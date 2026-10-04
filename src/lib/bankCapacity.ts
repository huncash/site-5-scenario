import { PLANS_CONFIG, isPublicPlanId, resolvePlanId, type PublicPlanId } from "@/config/plans";
import { readLicense } from "@/lib/license";
import { normalizeTierId, type SlotTierId } from "@/lib/scenarioSlots";

export type TierId = PublicPlanId;

/** Bankszámla / Slot korlát — PLANS_CONFIG. */
export function bankAccountsPerSlot(tier: SlotTierId): number | "unlimited" {
  const planId = resolvePlanId(tier);
  return PLANS_CONFIG[planId].quotas.bankAccountsPerSlot;
}

export function resolveBankTier(): SlotTierId {
  const lic = readLicense();
  return normalizeTierId(lic?.tier ?? "starter");
}

export type BankSlotCapacityResult =
  | { ok: true; used: number; limit: number | "unlimited" }
  | { ok: false; used: number; limit: number; reason: "limit_reached" };

/** Egy Slot-hoz rendelt bankszámlák száma vs. csomagkorlát. */
export function checkBankAccountsForSlot(usedMapped: number, tier: SlotTierId = resolveBankTier()): BankSlotCapacityResult {
  const limit = bankAccountsPerSlot(tier);
  if (limit === "unlimited") return { ok: true, used: usedMapped, limit };
  if (usedMapped >= limit) return { ok: false, used: usedMapped, limit, reason: "limit_reached" };
  return { ok: true, used: usedMapped, limit };
}

export function bankCapacityToast(tier: SlotTierId = resolveBankTier()): string {
  const limit = bankAccountsPerSlot(tier);
  if (limit === "unlimited") {
    if (tier === "pro") return "Pro: több bankfiók & kivonat csatolható Slot**-onként.";
    return "Enterprise / local: korlátlan banki / könyvelési csatolás.";
  }
  return `Basic / Campus: legfeljebb ${limit} banki kivonat (számla) / Slot** — bármilyen időszakra (CSV / PDF / XLS).`;
}

export function isPublicTierId(v: string): v is TierId {
  return isPublicPlanId(v);
}
