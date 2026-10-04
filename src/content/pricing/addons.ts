/**
 * JIT add-on unit prices — forrás: `JIT_ADDON_PRICES` (`src/config/plans.ts`).
 */

import {
  JIT_ADDON_MIN_COMMITMENT_DAYS,
  JIT_ADDON_PRICES,
  type JitAddonId,
} from "@/config/plans";

export type { JitAddonId };
export { JIT_ADDON_MIN_COMMITMENT_DAYS };

export type JitAddon = {
  id: JitAddonId;
  /** Nettó Ft / hó / db */
  priceHuf: number;
  labelHu: string;
  labelEn: string;
};

export const JIT_ADDONS: JitAddon[] = [
  {
    id: "case_plus_1",
    priceHuf: JIT_ADDON_PRICES.case_plus_1,
    labelHu: "+1 Extra Case",
    labelEn: "+1 Extra Case",
  },
  {
    id: "slot_plus_1",
    priceHuf: JIT_ADDON_PRICES.slot_plus_1,
    labelHu: "+1 Extra Slot",
    labelEn: "+1 Extra Slot",
  },
  {
    id: "seat_plus_1",
    priceHuf: JIT_ADDON_PRICES.seat_plus_1,
    labelHu: "+1 Extra Seat",
    labelEn: "+1 Extra Seat",
  },
  {
    id: "guest_plus_1",
    priceHuf: JIT_ADDON_PRICES.guest_plus_1,
    labelHu: "+1 Extra Guest",
    labelEn: "+1 Extra Guest",
  },
];

export const JIT_ADDON_BY_ID: Record<JitAddonId, JitAddon> = Object.fromEntries(
  JIT_ADDONS.map((a) => [a.id, a]),
) as Record<JitAddonId, JitAddon>;

export function isJitAddonId(v: unknown): v is JitAddonId {
  return v === "case_plus_1" || v === "slot_plus_1" || v === "seat_plus_1" || v === "guest_plus_1";
}

export function jitAddonLabel(addon: JitAddon, locale: "hu" | "en"): string {
  return locale === "en" ? addon.labelEn : addon.labelHu;
}

/** Test helper: +1 Case + 3 Slot net bundle. */
export function jitExampleBundleHuf(): number {
  return JIT_ADDON_BY_ID.case_plus_1.priceHuf + 3 * JIT_ADDON_BY_ID.slot_plus_1.priceHuf;
}

/** Slot pack qty — unit × count. */
export function slotPackPriceFromUnit(qty: 1 | 3 | 5): number {
  return JIT_ADDON_BY_ID.slot_plus_1.priceHuf * qty;
}
