export type BillTier = "starter" | "pro" | "expert" | "campus";
export type BillInterval = "yearly" | "monthly";
export type SlotPackId = "slot_plus_1" | "slot_plus_3" | "slot_plus_5";

const MONTHLY_HUF: Record<BillTier, number> = {
  starter: 8_900,
  pro: 24_900,
  expert: 59_000,
  campus: 1_490,
};

const LABELS: Record<BillTier, string> = {
  starter: "Alap",
  pro: "Pro",
  expert: "Enterprise",
  campus: "Hallgatói / Campus",
};

export const SLOT_PACK_HUF: Record<SlotPackId, number> = {
  slot_plus_1: 2_900,
  slot_plus_3: 7_900,
  slot_plus_5: 11_900,
};

export const SLOT_PACK_SLOTS: Record<SlotPackId, number> = {
  slot_plus_1: 1,
  slot_plus_3: 3,
  slot_plus_5: 5,
};

export const SLOT_PACK_LABELS: Record<SlotPackId, string> = {
  slot_plus_1: "+1 Extra Szcenárió Slot",
  slot_plus_3: "+3 Extra Szcenárió Slot csomag",
  slot_plus_5: "+5 Extra Szcenárió Slot csomag",
};

export function isSlotPackId(v: unknown): v is SlotPackId {
  return v === "slot_plus_1" || v === "slot_plus_3" || v === "slot_plus_5";
}

/** Campus / zárt oktatás: slot-mátrix kizárva. */
export function slotPackAllowedForTier(tier: BillTier): boolean {
  return tier !== "campus";
}

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
