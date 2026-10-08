/**
 * Számlázási katalógus — SSOT: `src/config/plans.ts`.
 * Nincs külön tesztár / tesztnév.
 */
import {
  JIT_ADDON_PRICES,
  PLANS_CONFIG,
  YEARLY_DISCOUNT_PCT,
  jitAddonPriceForPlan,
  type JitAddonId as PlanJitAddonId,
  type PlanId,
} from "../../src/config/plans.ts";

export type BillTier = "starter" | "pro" | "expert" | "campus";
export type BillInterval = "yearly" | "monthly";
export type SlotPackId = "slot_plus_1" | "slot_plus_3" | "slot_plus_5";
export type JitAddonId = PlanJitAddonId;

const LABELS: Record<BillTier, string> = {
  starter: PLANS_CONFIG.starter.label,
  pro: PLANS_CONFIG.pro.label,
  expert: PLANS_CONFIG.expert.label,
  campus: PLANS_CONFIG.campus.label,
};

/** Nettó Ft — perpetual 1. évi licenc; campusnál havi token. */
export const PACKAGE_NET_HUF: Record<BillTier, number> = {
  starter: PLANS_CONFIG.starter.priceHuf,
  pro: PLANS_CONFIG.pro.priceHuf,
  expert: PLANS_CONFIG.expert.priceHuf,
  campus: PLANS_CONFIG.campus.monthlyPriceHuf,
};

/** @deprecated Alias a kliens kompatibilitáshoz — valós csomagár, nem havi SaaS. */
export const MONTHLY_HUF = PACKAGE_NET_HUF;

const SLOT_UNIT_HUF = JIT_ADDON_PRICES.slot_plus_1;

export const SLOT_PACK_HUF: Record<SlotPackId, number> = {
  slot_plus_1: SLOT_UNIT_HUF,
  slot_plus_3: SLOT_UNIT_HUF * 3,
  slot_plus_5: SLOT_UNIT_HUF * 5,
};

export function slotPackNetForInterval(packId: SlotPackId, _interval: BillInterval): number {
  void _interval;
  return SLOT_PACK_HUF[packId];
}

export const SLOT_PACK_SLOTS: Record<SlotPackId, number> = {
  slot_plus_1: 1,
  slot_plus_3: 3,
  slot_plus_5: 5,
};

export const SLOT_PACK_LABELS: Record<SlotPackId, string> = {
  slot_plus_1: "+1 Extra Aktív Slot",
  slot_plus_3: "+3 Extra Aktív Slot",
  slot_plus_5: "+5 Extra Aktív Slot",
};

export const JIT_ADDON_HUF: Record<JitAddonId, number> = { ...JIT_ADDON_PRICES };

export const JIT_ADDON_LABELS: Record<JitAddonId, string> = {
  case_plus_1: "+1 Extra Aktív Case",
  slot_plus_1: "+1 Extra Aktív Slot",
  seat_plus_1: "+1 Extra szerkesztő",
  guest_plus_1: "+1 Extra vendégfiók",
  edge_sensor: "Szenzoros / Edge adatgyűjtő modul",
};

export function isJitAddonId(v: unknown): v is JitAddonId {
  return (
    v === "case_plus_1" ||
    v === "slot_plus_1" ||
    v === "seat_plus_1" ||
    v === "guest_plus_1" ||
    v === "edge_sensor"
  );
}

export function isSlotPackId(v: unknown): v is SlotPackId {
  return v === "slot_plus_1" || v === "slot_plus_3" || v === "slot_plus_5";
}

export function slotPackAllowedForTier(tier: BillTier): boolean {
  return tier !== "campus";
}

export function isBillTier(v: unknown): v is BillTier {
  return v === "starter" || v === "pro" || v === "expert" || v === "campus";
}

export function isBillInterval(v: unknown): v is BillInterval {
  return v === "yearly" || v === "monthly";
}

/** Perpetual: passthrough. Campus yearly: 12× havi. */
export function yearlyPriceHuf(monthlyHuf: number): number {
  return monthlyHuf * 12;
}

export function chargeHuf(tier: BillTier, interval: BillInterval): number {
  if (tier === "campus") {
    const monthly = PLANS_CONFIG.campus.monthlyPriceHuf;
    return interval === "yearly" ? yearlyPriceHuf(monthly) : monthly;
  }
  return PACKAGE_NET_HUF[tier];
}

export function tierLabel(tier: BillTier): string {
  return LABELS[tier];
}

export function invoicePackageName(tier: BillTier, interval: BillInterval): string {
  if (tier === "campus") {
    const span = interval === "yearly" ? "12 hó" : "1 hó";
    return `Szcenárió — ${LABELS.campus} (${span})`;
  }
  return `Szcenárió — ${LABELS[tier]} (örökös licenc, 1. év)`;
}

export function addonNetForTier(addon: JitAddonId, tier: BillTier): number {
  return jitAddonPriceForPlan(addon, tier as PlanId);
}

export function formatHuf(n: number): string {
  return `${new Intl.NumberFormat("hu-HU").format(n)} Ft`;
}

export { YEARLY_DISCOUNT_PCT };
