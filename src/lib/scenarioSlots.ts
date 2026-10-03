/** Szcenárió-slot kapacitás: alapcsomag + bővítő mátrix + ajánlói permanent. */

export type PublicTierId = "starter" | "pro" | "expert";
export type SlotTierId = PublicTierId | "campus" | "local";

export type SlotPackId = "slot_plus_1" | "slot_plus_3" | "slot_plus_5";

export type SlotPack = {
  id: SlotPackId;
  slots: 1 | 3 | 5;
  /** Nettó Ft / egyszeri bővítés (placeholder listaár). */
  priceHuf: number;
  labelHu: string;
  labelEn: string;
};

/** Alap szcenárió-helyek csomagonként (marketing + engine). */
export const BASE_SCENARIO_SLOTS: Record<SlotTierId, number> = {
  starter: 3,
  pro: 8,
  expert: 20,
  campus: 5,
  local: 8,
};

export const SLOT_PACKS: SlotPack[] = [
  { id: "slot_plus_1", slots: 1, priceHuf: 2_900, labelHu: "+1 Extra Szcenárió Slot", labelEn: "+1 Extra scenario slot" },
  { id: "slot_plus_3", slots: 3, priceHuf: 7_900, labelHu: "+3 Extra Szcenárió Slot csomag", labelEn: "+3 Extra scenario slot pack" },
  { id: "slot_plus_5", slots: 5, priceHuf: 11_900, labelHu: "+5 Extra Szcenárió Slot csomag", labelEn: "+5 Extra scenario slot pack" },
];

export function isSlotPackId(v: unknown): v is SlotPackId {
  return v === "slot_plus_1" || v === "slot_plus_3" || v === "slot_plus_5";
}

export function slotPackById(id: SlotPackId): SlotPack {
  return SLOT_PACKS.find((p) => p.id === id) ?? SLOT_PACKS[0];
}

/** Campus / zárt oktatási keret: bővítő mátrix ki van zárva. */
export function slotExpansionAllowed(tier: SlotTierId): boolean {
  return tier !== "campus";
}

export function publicSlotPacksForTier(tier: SlotTierId): SlotPack[] {
  return slotExpansionAllowed(tier) ? SLOT_PACKS : [];
}

export type SlotLedger = {
  tier: SlotTierId;
  /** Vásárolt bővítő pack-ek darabszáma id szerint. */
  purchasedPacks: Partial<Record<SlotPackId, number>>;
  /** Ajánlói / fizetéshez kötött permanent slotok. */
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
  const base = BASE_SCENARIO_SLOTS[ledger.tier] ?? BASE_SCENARIO_SLOTS.local;
  const addons = slotExpansionAllowed(ledger.tier) ? purchasedAddonSlots(ledger) : 0;
  return base + addons + Math.max(0, ledger.permanentBonus);
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
  return { ...ledger, permanentBonus: Math.max(0, ledger.permanentBonus) + Math.max(0, n) };
}

export function normalizeTierId(tier: string | null | undefined): SlotTierId {
  if (tier === "starter" || tier === "pro" || tier === "expert" || tier === "campus") return tier;
  if (!tier || tier === "local") return "local";
  return "local";
}
