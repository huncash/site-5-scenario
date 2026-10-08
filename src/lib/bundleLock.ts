/**
 * Poka-Yoke bundle-zár: Case / Slot / Seat / Edge halmozása
 * ne legyen olcsóbb, mint a következő nyilvános csomag listaára.
 * A vendégfiók nem számít bele (olvasói keret, nem kapacitás-kijátszás).
 */
import {
  JIT_ADDON_PRICES,
  PLANS_CONFIG,
  jitAddonPriceForPlan,
  type JitAddonId,
  type PlanId,
} from "../config/plans";

export const BUNDLE_LOCK_ADDON_IDS = ["case_plus_1", "slot_plus_1", "seat_plus_1", "edge_sensor"] as const;
export type BundleLockAddonId = (typeof BUNDLE_LOCK_ADDON_IDS)[number];

export type BundleLockPublicTier = "starter" | "pro" | "expert";

export type BundleLockLine = { id: BundleLockAddonId; qty: number };

export type BundleLockDecision = {
  tripped: boolean;
  currentTier: BundleLockPublicTier;
  nextTier: "pro" | "expert" | null;
  addonNet: number;
  stayNet: number;
  upgradeNet: number;
  saveHuf: number;
  /** Következő csomag listaára (küszöb). */
  thresholdHuf: number;
};

const SLOT_PACK_QTY: Record<"slot_plus_1" | "slot_plus_3" | "slot_plus_5", number> = {
  slot_plus_1: 1,
  slot_plus_3: 3,
  slot_plus_5: 5,
};

function isJitAddonId(v: string): v is JitAddonId {
  return (
    v === "case_plus_1" ||
    v === "slot_plus_1" ||
    v === "seat_plus_1" ||
    v === "guest_plus_1" ||
    v === "edge_sensor" ||
    v === "advisor_desk"
  );
}

export function isBundleLockAddon(id: string): id is BundleLockAddonId {
  return (BUNDLE_LOCK_ADDON_IDS as readonly string[]).includes(id);
}

export function bundleLockSetNet(): number {
  return BUNDLE_LOCK_ADDON_IDS.reduce((sum, id) => sum + JIT_ADDON_PRICES[id], 0);
}

export function nextPublicPlan(from: BundleLockPublicTier): "pro" | "expert" | null {
  if (from === "starter") return "pro";
  if (from === "pro") return "expert";
  return null;
}

export function upgradeGapHuf(from: "starter" | "pro"): number {
  const next = nextPublicPlan(from)!;
  return PLANS_CONFIG[next].priceHuf - PLANS_CONFIG[from].priceHuf;
}

export function publicTierForLock(planId: PlanId | string): BundleLockPublicTier | null {
  if (planId === "starter" || planId === "demo") return "starter";
  if (planId === "pro") return "pro";
  if (planId === "expert") return "expert";
  return null;
}

export function slotPackLockQty(pack: string): number {
  if (pack === "slot_plus_1" || pack === "slot_plus_3" || pack === "slot_plus_5") {
    return SLOT_PACK_QTY[pack];
  }
  return 0;
}

export function mergeBundleLockLines(lines: BundleLockLine[]): BundleLockLine[] {
  const qty: Record<BundleLockAddonId, number> = {
    case_plus_1: 0,
    slot_plus_1: 0,
    seat_plus_1: 0,
    edge_sensor: 0,
  };
  for (const line of lines) {
    if (!isBundleLockAddon(line.id) || line.qty <= 0) continue;
    qty[line.id] += Math.round(line.qty);
  }
  return BUNDLE_LOCK_ADDON_IDS.map((id) => ({ id, qty: qty[id] })).filter((l) => l.qty > 0);
}

export function cartToBundleLockLines(input: {
  addon?: string | null;
  slotPack?: string | null;
  ownedAddons?: readonly string[] | null;
  ownedSlotPacks?: readonly string[] | null;
}): BundleLockLine[] {
  const raw: BundleLockLine[] = [];
  const pushAddon = (id: string, qty = 1) => {
    if (isBundleLockAddon(id)) raw.push({ id, qty });
  };
  for (const id of input.ownedAddons ?? []) pushAddon(id);
  for (const pack of input.ownedSlotPacks ?? []) {
    const n = slotPackLockQty(pack);
    if (n) raw.push({ id: "slot_plus_1", qty: n });
  }
  if (input.addon && isJitAddonId(input.addon) && input.addon !== input.slotPack) {
    pushAddon(input.addon);
  }
  const packQty = input.slotPack ? slotPackLockQty(input.slotPack) : 0;
  if (packQty) raw.push({ id: "slot_plus_1", qty: packQty });
  return mergeBundleLockLines(raw);
}

export function lockBasketNet(lines: BundleLockLine[], planId: PlanId): number {
  return mergeBundleLockLines(lines).reduce((sum, line) => {
    return sum + jitAddonPriceForPlan(line.id, planId) * line.qty;
  }, 0);
}

export function evaluateBundleLock(input: {
  planId: PlanId | string;
  lines: BundleLockLine[];
}): BundleLockDecision {
  const mapped = publicTierForLock(input.planId);
  if (!mapped) {
    return {
      tripped: false,
      currentTier: "starter",
      nextTier: null,
      addonNet: 0,
      stayNet: 0,
      upgradeNet: 0,
      saveHuf: 0,
      thresholdHuf: 0,
    };
  }
  const currentTier = mapped;
  const nextTier = nextPublicPlan(currentTier);
  const currentY1 = PLANS_CONFIG[currentTier].priceHuf;
  const addonNet = lockBasketNet(input.lines, currentTier);
  const stayNet = currentY1 + addonNet;
  if (!nextTier) {
    return {
      tripped: false,
      currentTier,
      nextTier: null,
      addonNet,
      stayNet,
      upgradeNet: currentY1,
      saveHuf: 0,
      thresholdHuf: currentY1,
    };
  }
  const upgradeNet = PLANS_CONFIG[nextTier].priceHuf;
  const saveHuf = stayNet - upgradeNet;
  return {
    tripped: stayNet >= upgradeNet,
    currentTier,
    nextTier,
    addonNet,
    stayNet,
    upgradeNet,
    saveHuf,
    thresholdHuf: upgradeNet,
  };
}

export function evaluateBundleLockFromCart(input: {
  planId: PlanId | string;
  addon?: string | null;
  slotPack?: string | null;
  ownedAddons?: readonly string[] | null;
  ownedSlotPacks?: readonly string[] | null;
}): BundleLockDecision {
  return evaluateBundleLock({
    planId: input.planId,
    lines: cartToBundleLockLines(input),
  });
}

/** Upgrade után a kapacitás-modulok kiesnek; az Edge külön adatgyűjtő maradhat. */
export function bundleLockUpgradeCart(input: {
  addon?: string | null;
  slotPack?: string | null;
}): { addon?: string; slotPack?: undefined } {
  const addon = input.addon === "edge_sensor" ? "edge_sensor" : undefined;
  return { addon };
}
