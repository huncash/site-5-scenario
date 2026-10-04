/**
 * JIT örökös modulárak — forrás: `JIT_ADDON_PRICES` (`src/config/plans.ts`).
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
  /** Nettó Ft / örökös modul (egyszeri). */
  priceHuf: number;
  labelHu: string;
  labelEn: string;
  /** Publikus JIT listában megjelenik. */
  public: boolean;
};

export const JIT_ADDONS: JitAddon[] = [
  {
    id: "slot_plus_1",
    priceHuf: JIT_ADDON_PRICES.slot_plus_1,
    labelHu: "+1 Extra aktív Slot (örökös modul)",
    labelEn: "+1 Extra active Slot (perpetual module)",
    public: true,
  },
  {
    id: "seat_plus_1",
    priceHuf: JIT_ADDON_PRICES.seat_plus_1,
    labelHu: "+1 Extra Seat / szerkesztő (örökös modul)",
    labelEn: "+1 Extra Seat / editor (perpetual module)",
    public: true,
  },
  {
    id: "guest_plus_1",
    priceHuf: JIT_ADDON_PRICES.guest_plus_1,
    labelHu: "+1 Extra Guest",
    labelEn: "+1 Extra Guest",
    public: false,
  },
  {
    id: "case_plus_1",
    priceHuf: JIT_ADDON_PRICES.case_plus_1,
    labelHu: "+1 Extra aktív Case (örökös modul)",
    labelEn: "+1 Extra active Case (perpetual module)",
    public: true,
  },
];

export const PUBLIC_JIT_ADDONS = JIT_ADDONS.filter((a) => a.public && a.priceHuf > 0);

export const JIT_ADDON_BY_ID: Record<JitAddonId, JitAddon> = Object.fromEntries(
  JIT_ADDONS.map((a) => [a.id, a]),
) as Record<JitAddonId, JitAddon>;

export function isJitAddonId(v: unknown): v is JitAddonId {
  return v === "case_plus_1" || v === "slot_plus_1" || v === "seat_plus_1" || v === "guest_plus_1";
}

export function jitAddonLabel(addon: JitAddon, locale: "hu" | "en"): string {
  return locale === "en" ? addon.labelEn : addon.labelHu;
}

/** Test helper: 1 Slot + 1 Seat örökös modul. */
export function jitExampleBundleHuf(): number {
  return JIT_ADDON_BY_ID.slot_plus_1.priceHuf + JIT_ADDON_BY_ID.seat_plus_1.priceHuf;
}

/** Slot pack qty — unit × count (örökös). */
export function slotPackPriceFromUnit(qty: 1 | 3 | 5): number {
  return JIT_ADDON_BY_ID.slot_plus_1.priceHuf * qty;
}
