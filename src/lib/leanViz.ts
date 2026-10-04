import { compactCurrency } from "@/i18n/currency";

/**
 * Lean vizualizációs playbook + öntanuló preferencia.
 * Szín csak jelentéssel: semleges = bázis, kék = fókusz, piros/zöld = eltérés.
 */

export type LeanVizKind = "waterfall" | "bullet" | "heatmap" | "small_multiples" | "sankey";

export type LeanVizSlot =
  | "plan.whatif"
  | "plan.goal"
  | "do.cashflow"
  | "check.result"
  | "check.flow";

export type LeanVizAdvice = {
  id: string;
  kind: LeanVizKind;
  slot: LeanVizSlot;
  title: string;
  why: string;
  action: string;
};

export const LEAN_VIZ_PLAYBOOK: Readonly<
  Record<
    LeanVizKind,
    { labelHu: string; when: string; replaces: string }
  >
> = {
  waterfall: {
    labelHu: "Vízesés",
    when: "Kezdő értéktől a végeredményig (bevétel → költség → eredmény).",
    replaces: "Többsoros tábla / halmozott oszlop.",
  },
  bullet: {
    labelHu: "Bullet (cél vs. tény)",
    when: "Egy mutató célhoz viszonyítva, kis helyen.",
    replaces: "Sebességmérő / gauge.",
  },
  heatmap: {
    labelHu: "Kivétel-hőtérkép",
    when: "Sok cella, a deviancia a lényeg.",
    replaces: "Számtábla.",
  },
  small_multiples: {
    labelHu: "Kis többszörösök",
    when: "Több azonos skálájú trend egymás mellett.",
    replaces: "Tészta-vonalgrafikon.",
  },
  sankey: {
    labelHu: "Áramlás (Sankey)",
    when: "Honnan hová folyik a tőke.",
    replaces: "Kördiagram.",
  },
};

const USED_PREFIX = "ui:leanVizUsed:";
const PREF_PREFIX = "ui:leanVizPref:";
const ACCEPTED_PREFIX = "ui:leanVizAccepted:";

function lsGet(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function rememberVizUse(kind: LeanVizKind) {
  const n = Number(lsGet(`${USED_PREFIX}${kind}`) ?? 0) || 0;
  lsSet(`${USED_PREFIX}${kind}`, String(n + 1));
}

export function acceptVizAdvice(kind: LeanVizKind, slot: LeanVizSlot) {
  lsSet(`${ACCEPTED_PREFIX}${kind}`, "1");
  lsSet(`${PREF_PREFIX}${slot}`, kind);
  rememberVizUse(kind);
}

export function preferredVizForSlot(slot: LeanVizSlot): LeanVizKind | null {
  const v = lsGet(`${PREF_PREFIX}${slot}`);
  if (v === "waterfall" || v === "bullet" || v === "heatmap" || v === "small_multiples" || v === "sankey") return v;
  return null;
}

export function vizUsageCount(kind: LeanVizKind): number {
  return Number(lsGet(`${USED_PREFIX}${kind}`) ?? 0) || 0;
}

export type LeanVizContext = {
  pdcaMode?: "PD" | "DC" | "CA" | "AP" | null;
  hasGoal?: boolean;
  hasScenarios?: boolean;
  categoryCount?: number;
  workspaceCount?: number;
  monthCount?: number;
  hasIncomeAndExpense?: boolean;
};

export function recommendLeanVisualizations(ctx: LeanVizContext): LeanVizAdvice[] {
  const out: LeanVizAdvice[] = [];
  const mode = ctx.pdcaMode ?? "PD";
  const cats = ctx.categoryCount ?? 0;
  const months = ctx.monthCount ?? 0;

  if (ctx.hasScenarios && (mode === "PD" || mode === "AP")) {
    out.push({
      id: "viz.small_multiples.scenarios",
      kind: "small_multiples",
      slot: "plan.whatif",
      title: "P-R-O forgatókönyvek: kis többszörösök",      why: "Három vonal egy grafikonon tésztaábra. Azonos skálájú miniatűrökön a kiugrás azonnal látszik.",
      action: "A PLAN szimuláció a kis többszörösöket használja.",
    });
    out.push({
      id: "viz.waterfall.scenario",
      kind: "waterfall",
      slot: "plan.whatif",
      title: "Havi eredmény: vízesés",
      why: "Bevétel → fix → változó → nettó: a lebegő oszlop iránya és színe a hatást mutatja.",
      action: "A kiválasztott forgatókönyv vízesésre bontása.",
    });
  }

  if (ctx.hasGoal && (mode === "PD" || mode === "AP")) {
    out.push({
      id: "viz.bullet.goal",
      kind: "bullet",
      slot: "plan.goal",
      title: "Cél vs. tény: bullet",
      why: "A gauge helyet foglal. A bullet egy vonalon mutatja a tényt, a célt és a sávokat.",
      action: "A célkártya bullet grafikonra vált.",
    });
  }

  if (ctx.hasIncomeAndExpense && (mode === "PD" || mode === "DC" || mode === "CA")) {
    out.push({
      id: "viz.waterfall.pl",
      kind: "waterfall",
      slot: "check.result",
      title: "Eredménylevezetés vízeséssel",
      why: "A bevétel/kiadás oszlopok nem mutatják az utat a végeredményig.",
      action: "CHECK / cashflow: vízesés a havi eredményre.",
    });
  }

  if (cats >= 3 && ctx.hasIncomeAndExpense) {
    out.push({
      id: "viz.sankey.flow",
      kind: "sankey",
      slot: "do.cashflow",
      title: "Pénzáramlás Sankey",
      why: "A kördiagram arányt mutat, utat nem. A vonalvastagság a tőke útját mutatja.",
      action: "A cashflow keretben áramlás-nézet.",
    });
  }

  if ((cats >= 4 || (ctx.workspaceCount ?? 0) >= 2) && months >= 3) {
    out.push({
      id: "viz.heatmap.exception",
      kind: "heatmap",
      slot: "check.flow",
      title: "Kivétel-hőtérkép",
      why: "Management by exception: csak a piros/zöld cellákra kell nézni.",
      action: "Kategória × hónap hőtérkép a CHECK-en.",
    });
  }

  const score = (a: LeanVizAdvice) => {
    const used = vizUsageCount(a.kind);
    const accepted = lsGet(`${ACCEPTED_PREFIX}${a.kind}`) === "1" ? 8 : 0;
    const pref = preferredVizForSlot(a.slot) === a.kind ? 12 : 0;
    return used + accepted + pref;
  };
  out.sort((a, b) => score(b) - score(a));
  return out.slice(0, 4);
}

export type WaterfallStep = {
  key: string;
  label: string;
  value: number;
  role: "start" | "delta" | "total";
};

function groupKey(category: string) {
  const raw = String(category ?? "").trim();
  if (!raw) return "Egyéb";
  return raw.includes(":") ? raw.split(":")[0]!.trim() : raw;
}

/** Bevétel → költségcsoportok → eredmény (összeadható, nem egyetlen „egyéb” oszlop). */
export function groupExpenseWaterfall(
  income: number,
  expenseRows: Array<{ category: string; amount: number }>,
  extras?: Array<{ key: string; label: string; value: number }>,
): WaterfallStep[] {
  const groups = new Map<string, number>();
  for (const r of expenseRows) {
    const g = groupKey(r.category);
    groups.set(g, (groups.get(g) ?? 0) + Math.abs(Number(r.amount) || 0));
  }
  const deltas = [...groups.entries()]
    .filter(([, v]) => v >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7);
  const steps: WaterfallStep[] = [{ key: "inc", label: "Bevétel", value: Math.max(0, income), role: "start" }];
  for (const [label, value] of deltas) {
    steps.push({ key: `g:${label}`, label, value: -value, role: "delta" });
  }
  for (const extra of extras ?? []) {
    if (Math.abs(extra.value) < 1) continue;
    steps.push({ key: extra.key, label: extra.label, value: extra.value, role: "delta" });
  }
  steps.push({ key: "end", label: "Eredmény", value: 0, role: "total" });
  return steps;
}

export type BulletDatum = {
  id: string;
  label: string;
  actual: number;
  target: number;
  unit?: string;
  /** Hover: mit mér a sáv és a küszöb. */
  hint?: string;
};

export type HeatCell = {
  row: string;
  col: string;
  value: number;
};

export type SparkSeries = {
  id: string;
  label: string;
  points: Array<{ x: string; y: number }>;
  active?: boolean;
};

export type SankeyLink = {
  from: string;
  to: string;
  value: number;
};

export function compactHuf(v: number): string {
  return compactCurrency(v);
}
