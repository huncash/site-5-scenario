export type BillTier = "starter" | "pro" | "expert" | "campus";
export type BillInterval = "yearly" | "monthly";
export type SlotPackId = "slot_plus_1" | "slot_plus_3" | "slot_plus_5";

const MONTHLY_HUF: Record<BillTier, number> = {
  starter: 8_900,
  pro: 24_420,
  expert: 59_000,
  campus: 1_490,
};

const LABELS: Record<BillTier, string> = {
  starter: "Basic",
  pro: "Pro",
  expert: "Enterprise",
  campus: "Hallgatói / Campus",
};

const SLOT_UNIT_HUF = 2_900;

/** Nettó Ft / hó — egységár × db (JIT), yearly a fő csomag kedvezményével. */
export const SLOT_PACK_HUF: Record<SlotPackId, number> = {
  slot_plus_1: SLOT_UNIT_HUF * 1,
  slot_plus_3: SLOT_UNIT_HUF * 3,
  slot_plus_5: SLOT_UNIT_HUF * 5,
};

export function slotPackNetForInterval(packId: SlotPackId, interval: BillInterval): number {
  const m = SLOT_PACK_HUF[packId];
  return interval === "yearly" ? yearlyPriceHuf(m) : m;
}

export const SLOT_PACK_SLOTS: Record<SlotPackId, number> = {
  slot_plus_1: 1,
  slot_plus_3: 3,
  slot_plus_5: 5,
};

export const SLOT_PACK_LABELS: Record<SlotPackId, string> = {
  slot_plus_1: "+1 Extra Slot",
  slot_plus_3: "+3 Extra Slot",
  slot_plus_5: "+5 Extra Slot",
};

/** JIT egység-modulok (Case / Slot / Seat / Guest). */
export type JitAddonId = "case_plus_1" | "slot_plus_1" | "seat_plus_1" | "guest_plus_1";

export const JIT_ADDON_HUF: Record<JitAddonId, number> = {
  case_plus_1: 4_900,
  slot_plus_1: 2_900,
  seat_plus_1: 6_900,
  guest_plus_1: 1_200,
};

export const JIT_ADDON_LABELS: Record<JitAddonId, string> = {
  case_plus_1: "+1 Extra Case",
  slot_plus_1: "+1 Extra Slot",
  seat_plus_1: "+1 Extra Seat",
  guest_plus_1: "+1 Extra Guest",
};

export function isJitAddonId(v: unknown): v is JitAddonId {
  return v === "case_plus_1" || v === "slot_plus_1" || v === "seat_plus_1" || v === "guest_plus_1";
}
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
