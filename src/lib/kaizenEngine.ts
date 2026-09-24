import type { Goal, Transaction } from "@/lib/finance";

export type KaizenMudaRate = {
  currentMonthMuda: number;
  prev3AvgMuda: number;
  reductionHuf: number; // positive = reduced vs prev3 avg
};

export type WeeklyKaizenImpulse = {
  id: string;
  occurred_at: string;
  partner: string;
  description: string;
  amount: number;
  category: string;
  muda_type?: string | null;
};

export type WeeklyKaizenSaving = {
  id: string;
  occurred_at: string;
  description: string;
  amount: number;
  bucket_id?: string | null;
};

export type KaizenGoalProgress = {
  id: string;
  name: string;
  target: number;
  saved: number;
  remaining: number;
  progressPct: number; // 0..100
};

export type WeeklyKaizenSummary = {
  impulses: WeeklyKaizenImpulse[];
  topSavings: WeeklyKaizenSaving[];
  savingsTotal7d: number;
  goals: KaizenGoalProgress[];
};

export type KaizenAudit = {
  mudaRate: KaizenMudaRate | null;
  weekly: WeeklyKaizenSummary;
};

function monthKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function shiftMonths(now: Date, delta: number) {
  return new Date(now.getFullYear(), now.getMonth() + delta, 1);
}

function netHuf(t: Transaction): number {
  const huf = Number(t.amount ?? 0);
  const eur = Number((t as any).eur_amount ?? 0);
  const rate = Number((t as any).eur_rate ?? 0);
  const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
  return huf + eurHuf;
}

function isInLastDays(iso: string, now: Date, days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  const t = Date.parse(String(iso ?? ""));
  return Number.isFinite(t) && now.getTime() - t <= ms;
}

function inSameMonth(iso: string, ref: Date) {
  const d = new Date(String(iso ?? ""));
  if (!Number.isFinite(d.getTime())) return false;
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function deriveGoalSavings(txns: Transaction[], goalName: string, buckets: Array<{ id: string; name: string }>) {
  const nm = goalName.trim().toLowerCase();
  const linked = new Set<string>(
    buckets
      .filter((b) => b.name.trim().toLowerCase() === nm)
      .map((b) => String(b.id)),
  );
  let sum = 0;
  for (const t of txns) {
    if (t.type !== "saving") continue;
    const bucketId = (t as any).bucket_id ?? null;
    if (!bucketId || linked.has(String(bucketId))) sum += Math.max(0, netHuf(t));
  }
  return sum;
}

export function computeKaizenAudit(input: {
  txns: Transaction[];
  goals: Goal[];
  buckets: Array<{ id: string; name: string }>;
  workspaceId: string; // typically "personal"
  now?: Date;
}): KaizenAudit {
  const now = input.now ?? new Date();
  const ws = input.workspaceId;

  const wsTxns = (input.txns ?? []).filter((t) => String((t as any).workspace ?? "personal") === ws);

  // Muda spend = expense with explicit muda_type (non-NONE).
  const currentKey = monthKey(now);
  const prevKeys = [monthKey(shiftMonths(now, -1)), monthKey(shiftMonths(now, -2)), monthKey(shiftMonths(now, -3))];
  const byMonth = new Map<string, number>();
  for (const t of wsTxns) {
    if (t.type !== "expense") continue;
    const mk = String(t.occurred_at ?? "").slice(0, 7);
    if (!mk) continue;
    const muda = String((t as any).muda_type ?? "");
    if (!muda || muda === "NONE") continue;
    byMonth.set(mk, (byMonth.get(mk) ?? 0) + Math.max(0, netHuf(t)));
  }
  const currentMonthMuda = byMonth.get(currentKey) ?? 0;
  const prev3 = prevKeys.map((k) => byMonth.get(k) ?? 0);
  const prev3Avg = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : 0;
  const mudaRate: KaizenMudaRate | null =
    currentMonthMuda > 0 || prev3Avg > 0
      ? {
          currentMonthMuda,
          prev3AvgMuda: prev3Avg,
          reductionHuf: Math.round(prev3Avg - currentMonthMuda),
        }
      : null;

  const impulses: WeeklyKaizenImpulse[] = wsTxns
    .filter((t) => t.type === "expense")
    .filter((t) => isInLastDays(String(t.occurred_at ?? ""), now, 7))
    .filter((t) => String((t as any).muda_type ?? "") === "IMPULSE_SPEND")
    .sort((a, b) => (String(a.occurred_at) < String(b.occurred_at) ? 1 : -1))
    .slice(0, 18)
    .map((t) => ({
      id: t.id,
      occurred_at: String(t.occurred_at ?? ""),
      partner: String(t.party ?? "").trim(),
      description: String(t.note ?? t.title ?? "").trim(),
      amount: Math.max(0, netHuf(t)),
      category: String(t.category ?? ""),
      muda_type: String((t as any).muda_type ?? ""),
    }));

  const saving7d = wsTxns
    .filter((t) => t.type === "saving")
    .filter((t) => isInLastDays(String(t.occurred_at ?? ""), now, 7))
    .map((t) => ({
      id: t.id,
      occurred_at: String(t.occurred_at ?? ""),
      description: String((t as any).note ?? (t as any).title ?? "").trim(),
      amount: Math.max(0, netHuf(t)),
      bucket_id: ((t as any).bucket_id ?? null) as any,
    }));
  saving7d.sort((a, b) => b.amount - a.amount);

  const topSavings: WeeklyKaizenSaving[] = saving7d.slice(0, 8);
  const savingsTotal7d = saving7d.reduce((a, b) => a + b.amount, 0);

  const goals: KaizenGoalProgress[] = (input.goals ?? [])
    .filter((g) => (g.workspace ?? "personal") === ws)
    .map((g) => {
      const target = Math.max(0, Number(g.target_amount ?? 0));
      const saved = deriveGoalSavings(wsTxns, String(g.name ?? ""), input.buckets ?? []);
      const remaining = Math.max(0, target - saved);
      const progressPct = target > 0 ? Math.max(0, Math.min(100, (saved / target) * 100)) : 0;
      return {
        id: g.id,
        name: String(g.name ?? ""),
        target,
        saved,
        remaining,
        progressPct,
      };
    })
    .sort((a, b) => (a.remaining < b.remaining ? -1 : 1))
    .slice(0, 4);

  return {
    mudaRate,
    weekly: { impulses, topSavings, savingsTotal7d, goals },
  };
}

