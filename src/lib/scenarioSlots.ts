/** Slot kapacitás: csomagmátrix (Eset × Slot/Eset) + bővítő + ajánlói ajándék. */

import { MAX_REFERRAL_GIFT_SLOTS, PLANS_CONFIG, totalSlots, yearlyPriceHuf } from "@/config/plans";
import { slotPackPriceFromUnit } from "@/content/pricing/addons";
import type { BillingInterval } from "@/lib/funnelOrder";
import { isSchoolHost } from "@/lib/school";

export type PublicTierId = "starter" | "pro" | "expert";
export type SlotTierId = PublicTierId | "campus" | "local" | "demo";

const SLOT_TIER_IDS = ["starter", "pro", "expert", "campus", "local", "demo"] as const;

export type SlotPackId = "slot_plus_1" | "slot_plus_3" | "slot_plus_5";

export type SlotPack = {
  id: SlotPackId;
  slots: 1 | 3 | 5;
  /** Nettó Ft / hó (a yearly a fő csomag 15%-os kedvezményével számol). */
  priceHuf: number;
  labelHu: string;
  labelEn: string;
};

export { MAX_REFERRAL_GIFT_SLOTS };

/**
 * Összes Slot a csomagban (Eset × Slot/Eset alsó határ) — PLANS_CONFIG.
 */
export const BASE_SCENARIO_SLOTS: Record<SlotTierId, number> = {
  starter: totalSlots(PLANS_CONFIG.starter),
  pro: totalSlots(PLANS_CONFIG.pro),
  expert: totalSlots(PLANS_CONFIG.expert),
  campus: totalSlots(PLANS_CONFIG.campus),
  local: totalSlots(PLANS_CONFIG.local),
  demo: totalSlots(PLANS_CONFIG.demo),
};

/** Egységár × db (JIT) — nincs mélykedvezmény, ami aláásná a Pro/Enterprise margót. */
export const SLOT_PACKS: SlotPack[] = [
  {
    id: "slot_plus_1",
    slots: 1,
    priceHuf: slotPackPriceFromUnit(1),
    labelHu: "+1 Extra Slot",
    labelEn: "+1 Extra Slot",
  },
  {
    id: "slot_plus_3",
    slots: 3,
    priceHuf: slotPackPriceFromUnit(3),
    labelHu: "+3 Extra Slot",
    labelEn: "+3 Extra Slot",
  },
  {
    id: "slot_plus_5",
    slots: 5,
    priceHuf: slotPackPriceFromUnit(5),
    labelHu: "+5 Extra Slot",
    labelEn: "+5 Extra Slot",
  },
];
export function isSlotPackId(v: unknown): v is SlotPackId {
  return v === "slot_plus_1" || v === "slot_plus_3" || v === "slot_plus_5";
}

export function slotPackById(id: SlotPackId): SlotPack {
  return SLOT_PACKS.find((p) => p.id === id) ?? SLOT_PACKS[0];
}

export function slotPackLabel(pack: SlotPack, locale: "hu" | "en"): string {
  return locale === "en" ? pack.labelEn : pack.labelHu;
}

/** JIT Slot örökös modul — egyszeri ár (interval legacy, nincs havi átszámítás). */
export function slotPackNetForInterval(oneTimeNetHuf: number, _interval: BillingInterval): number {
  void yearlyPriceHuf;
  return oneTimeNetHuf;
}

/** Campus / zárt oktatási keret: bővítő mátrix ki van zárva. */
export function slotExpansionAllowed(tier: SlotTierId): boolean {
  if (tier === "campus" || tier === "demo") return false;
  if (typeof window !== "undefined" && isSchoolHost()) return false;
  return true;
}

export function publicSlotPacksForTier(tier: SlotTierId): SlotPack[] {
  return slotExpansionAllowed(tier) ? SLOT_PACKS : [];
}

export type SlotLedger = {
  tier: SlotTierId;
  /** Vásárolt bővítő pack-ek darabszáma id szerint. */
  purchasedPacks: Partial<Record<SlotPackId, number>>;
  /**
   * Ajánlói ajándék slotok (aktív páros előfizetés alatt).
   * Hard cap: {@link MAX_REFERRAL_GIFT_SLOTS}.
   */
  permanentBonus: number;
};

export function emptySlotLedger(tier: SlotTierId = "local"): SlotLedger {
  return { tier, purchasedPacks: {}, permanentBonus: 0 };
}

export function purchasedAddonSlots(ledger: SlotLedger): number {
  let n = 0;
  for (const pack of SLOT_PACKS) {
    const qty = ledger.purchasedPacks[pack.id] ?? 0;
    n += qty * pack.slots;
  }
  return n;
}

export function totalScenarioSlots(ledger: SlotLedger): number {
  const base = BASE_SCENARIO_SLOTS[ledger.tier] ?? BASE_SCENARIO_SLOTS.demo;
  const addons = slotExpansionAllowed(ledger.tier) ? purchasedAddonSlots(ledger) : 0;
  const gifts = Math.min(MAX_REFERRAL_GIFT_SLOTS, Math.max(0, ledger.permanentBonus));
  return base + addons + gifts;
}

export type SlotCapacityResult =
  | { ok: true; used: number; limit: number; remaining: number }
  | { ok: false; used: number; limit: number; remaining: 0; reason: "limit_reached" };

export function checkScenarioSlotCapacity(used: number, ledger: SlotLedger): SlotCapacityResult {
  const limit = totalScenarioSlots(ledger);
  const remaining = Math.max(0, limit - used);
  if (used >= limit) return { ok: false, used, limit, remaining: 0, reason: "limit_reached" };
  return { ok: true, used, limit, remaining };
}

export function addPurchasedPack(ledger: SlotLedger, packId: SlotPackId, qty = 1): SlotLedger {
  if (!slotExpansionAllowed(ledger.tier)) return ledger;
  const cur = ledger.purchasedPacks[packId] ?? 0;
  return {
    ...ledger,
    purchasedPacks: { ...ledger.purchasedPacks, [packId]: cur + Math.max(1, qty) },
  };
}

export function addPermanentBonus(ledger: SlotLedger, n = 1): SlotLedger {
  const next = Math.max(0, ledger.permanentBonus) + Math.max(0, n);
  return { ...ledger, permanentBonus: Math.min(MAX_REFERRAL_GIFT_SLOTS, next) };
}

/** Ajándék slotok beállítása (cap-elve); pl. license sync / revoke után. */
export function setGiftBonusSlots(ledger: SlotLedger, n: number): SlotLedger {
  return { ...ledger, permanentBonus: Math.min(MAX_REFERRAL_GIFT_SLOTS, Math.max(0, Math.floor(n))) };
}

/** `local` csak explicit. `demo` / ismeretlen soha nem hullik korlátlanra. */
export function normalizeTierId(tier: string | null | undefined): SlotTierId {
  const cleaned = String(tier ?? "")
    .trim()
    .toLowerCase();
  if (cleaned === "basic") return "starter";
  if (cleaned === "local") return "local";
  if ((SLOT_TIER_IDS as readonly string[]).includes(cleaned)) return cleaned as SlotTierId;
  return "demo";
}
