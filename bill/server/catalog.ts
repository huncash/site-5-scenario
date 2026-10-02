export type BillTier = "starter" | "pro" | "expert" | "campus";
export type BillInterval = "yearly" | "monthly";

const MONTHLY_HUF: Record<BillTier, number> = {
  starter: 8_900,
  pro: 24_900,
  expert: 59_000,
  campus: 1_490,
};

const LABELS: Record<BillTier, string> = {
  starter: "Alapcsomag",
  pro: "Üzleti / Pro",
  expert: "Nagyvállalati / Enterprise",
  campus: "Hallgatói / Campus",
};

const YEARLY_DISCOUNT_PCT = 15;

export function isBillTier(v: unknown): v is BillTier {
  return v === "starter" || v === "pro" || v === "expert" || v === "campus";
}

export function isBillInterval(v: unknown): v is BillInterval {
  return v === "yearly" || v === "monthly";
}

export function yearlyPriceHuf(monthlyHuf: number): number {
  return Math.round(monthlyHuf * 12 * (1 - YEARLY_DISCOUNT_PCT / 100));
}

export function chargeHuf(tier: BillTier, interval: BillInterval): number {
  const m = MONTHLY_HUF[tier];
  return interval === "yearly" ? yearlyPriceHuf(m) : m;
}

export function tierLabel(tier: BillTier): string {
  return LABELS[tier];
}

export function formatHuf(n: number): string {
  return `${new Intl.NumberFormat("hu-HU").format(n)} Ft`;
}

export { MONTHLY_HUF, YEARLY_DISCOUNT_PCT };
