import type { Transaction } from "@/lib/finance";

export type MonthAgg = {
  ym: string; // YYYY-MM
  fixNeed: number;
  variableNeed: number;
  want: number;
  investment: number;
  muda: number;
  totalExpense: number;
};

export type SeasonalityPeak = {
  month: number; // 1..12
  factor: number; // monthAvg / overallAvg
  avgExpense: number;
};

export type MultiYearAnalytics = {
  months: MonthAgg[];
  baselineFixNeedMonthly: number;
  baselineMudaMonthly: number;
  overallMonthlyExpenseAvg: number;
  monthSeasonality: Array<{ month: number; factor: number; avgExpense: number }>;
  peaks: SeasonalityPeak[];
  annualizedMuda: number;
  annualizedWants: number;
  annualizedLeak: number; // wants + muda (not double-counted) by heuristic
  runwayMonthsCurrent: number | null;
  runwayMonthsLean: number | null;
};

function monthKey(iso: string) {
  return String(iso ?? "").slice(0, 7);
}

function deriveExpenseType(t: Transaction): "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT" | null {
  const et = (t as any).expense_type as any;
  if (et === "FIX_NEED" || et === "VARIABLE_NEED" || et === "WANT" || et === "INVESTMENT") return et;
  const c = String(t.category ?? "");
  if (t.type === "saving" || c === "savings") return "INVESTMENT";
  if (t.type !== "expense") return null;
  if (c === "utilities" || c === "housing" || c === "loan_repayment") return "FIX_NEED";
  if (c === "food" || c === "health" || c === "transport") return "VARIABLE_NEED";
  if (c === "entertainment" || c === "shopping" || c === "education") return "WANT";
  if (c === "uncategorized" || c === "other") return "WANT";
  return "VARIABLE_NEED";
}

function deriveMudaType(t: Transaction): string {
  return String((t as any).muda_type ?? "NONE");
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function analyzeMultiYear(input: {
  txns: Transaction[];
  workspaceId: string;
  yearsBack?: number; // default 3
  now?: Date;
  liquidityHuf?: number | null; // optional for runway
}): MultiYearAnalytics {
  const now = input.now ?? new Date();
  const yearsBack = Math.max(1, Math.floor(input.yearsBack ?? 3));
  const since = new Date(now.getFullYear() - yearsBack, now.getMonth(), 1).getTime();

  const byYm = new Map<string, MonthAgg>();
  for (const t of input.txns) {
    const ws = String((t as any).workspace ?? "personal");
    if (ws !== input.workspaceId) continue;
    const at = Date.parse(String(t.occurred_at ?? ""));
    if (!Number.isFinite(at) || at < since) continue;
    const ym = monthKey(String(t.occurred_at ?? ""));
    if (!/^\d{4}-\d{2}$/.test(ym)) continue;
    const agg =
      byYm.get(ym) ??
      ({
        ym,
        fixNeed: 0,
        variableNeed: 0,
        want: 0,
        investment: 0,
        muda: 0,
        totalExpense: 0,
      } satisfies MonthAgg);

    const amt = Math.max(0, Number(t.amount ?? 0));
    const et = deriveExpenseType(t);
    const mt = deriveMudaType(t);

    if (t.type === "expense") {
      agg.totalExpense += amt;
      if (et === "FIX_NEED") agg.fixNeed += amt;
      else if (et === "VARIABLE_NEED") agg.variableNeed += amt;
      else if (et === "WANT") agg.want += amt;
      else if (et === "INVESTMENT") agg.investment += amt;
      if (mt && mt !== "NONE") agg.muda += amt;
    } else if (t.type === "saving") {
      agg.investment += amt;
    }

    byYm.set(ym, agg);
  }

  const months = Array.from(byYm.values()).sort((a, b) => (a.ym < b.ym ? -1 : 1));

  const denom = Math.max(1, months.length);
  const baselineFixNeedMonthly = months.reduce((s, m) => s + m.fixNeed, 0) / denom;
  const baselineMudaMonthly = months.reduce((s, m) => s + m.muda, 0) / denom;
  const overallMonthlyExpenseAvg = months.reduce((s, m) => s + m.totalExpense, 0) / denom;

  // Seasonality: month-of-year average / overall average
  const mo = new Map<number, { sum: number; n: number }>();
  for (const m of months) {
    const month = Number(m.ym.slice(5, 7));
    const cur = mo.get(month) ?? { sum: 0, n: 0 };
    cur.sum += m.totalExpense;
    cur.n += 1;
    mo.set(month, cur);
  }
  const monthSeasonality = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
    const x = mo.get(month);
    const avgExpense = x && x.n > 0 ? x.sum / x.n : overallMonthlyExpenseAvg;
    const factor = overallMonthlyExpenseAvg > 0 ? avgExpense / overallMonthlyExpenseAvg : 1;
    return { month, factor: clamp(factor, 0.5, 2.0), avgExpense };
  });
  const peaks = monthSeasonality
    .filter((m) => m.factor >= 1.2 && m.avgExpense > 0)
    .sort((a, b) => b.factor - a.factor)
    .slice(0, 4);

  // Annualized leak metrics from last 90 days
  const days90 = 90 * 24 * 60 * 60 * 1000;
  const since90 = now.getTime() - days90;
  let muda90 = 0;
  let want90 = 0;
  let leak90 = 0;
  for (const t of input.txns) {
    const ws = String((t as any).workspace ?? "personal");
    if (ws !== input.workspaceId) continue;
    if (t.type !== "expense") continue;
    const at = Date.parse(String(t.occurred_at ?? ""));
    if (!Number.isFinite(at) || at < since90) continue;
    const amt = Math.max(0, Number(t.amount ?? 0));
    const et = deriveExpenseType(t);
    const mt = deriveMudaType(t);
    if (et === "WANT") want90 += amt;
    if (mt && mt !== "NONE") muda90 += amt;
    // leak: wants OR muda, counted once
    if (et === "WANT" || (mt && mt !== "NONE")) leak90 += amt;
  }
  const annualizedMuda = (muda90 / 90) * 365;
  const annualizedWants = (want90 / 90) * 365;
  const annualizedLeak = (leak90 / 90) * 365;

  // Predictive runway (seasonality-corrected) if liquidity is provided
  const thisMonth = now.getMonth() + 1;
  const season = monthSeasonality.find((m) => m.month === thisMonth)?.factor ?? 1;
  const burnCurrent = overallMonthlyExpenseAvg * season;
  const burnLean = Math.max(0, (overallMonthlyExpenseAvg - baselineMudaMonthly) * season);
  const liq = input.liquidityHuf ?? null;
  const runwayMonthsCurrent = liq != null && burnCurrent > 0 ? liq / burnCurrent : null;
  const runwayMonthsLean = liq != null && burnLean > 0 ? liq / burnLean : null;

  return {
    months,
    baselineFixNeedMonthly,
    baselineMudaMonthly,
    overallMonthlyExpenseAvg,
    monthSeasonality,
    peaks,
    annualizedMuda,
    annualizedWants,
    annualizedLeak,
    runwayMonthsCurrent,
    runwayMonthsLean,
  };
}

