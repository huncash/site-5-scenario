export const INSTALLMENT_COUNT = 2;
export const INSTALLMENT2_DUE_DAYS = 60;
export const INSTALLMENT2_CHECK_FROM_DAYS = 60;
export const INSTALLMENT2_CHECK_UNTIL_DAYS = 90;

export function installmentAllowed(tier: string, interval: string): boolean {
  return interval === "yearly" && tier !== "campus";
}

export function splitEqualParts(total: number, parts = INSTALLMENT_COUNT): number[] {
  const n = Math.max(1, Math.round(total));
  const p = Math.max(2, parts);
  const base = Math.floor(n / p);
  const last = n - base * (p - 1);
  return [base, last];
}

export function addDaysIso(from: Date, days: number): string {
  const d = new Date(from.getTime());
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function daysSince(fromIso: string, now = new Date()): number {
  const start = Date.parse(fromIso);
  if (!Number.isFinite(start)) return 0;
  return (now.getTime() - start) / 86_400_000;
}

/** 60. naptól a 2. részlet rendezetlensége — a szoftver nem zár. */
export function installment2ArrearsActive(
  input: { year1StartedAt?: string; installmentPlan?: boolean; installment2Paid?: boolean },
  now = new Date(),
): boolean {
  if (!input.installmentPlan || input.installment2Paid) return false;
  const start = input.year1StartedAt;
  if (!start) return false;
  return daysSince(start, now) >= INSTALLMENT2_CHECK_FROM_DAYS;
}
