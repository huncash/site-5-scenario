import { TIER_CAPACITY, type TierId } from "@/content/pricing/tiers";
import { isTierId } from "@/content/pricing/tiers";
import { readLicense } from "@/lib/license";
import { normalizeTierId, type SlotTierId } from "@/lib/scenarioSlots";

/** Bankszámla / Slot korlát a csomagmátrix szerint. */
export function bankAccountsPerSlot(tier: SlotTierId): number | "unlimited" {
  if (tier === "campus") return 1;
  if (tier === "local") return "unlimited";
  if (!isTierId(tier)) return "unlimited";
  return TIER_CAPACITY[tier].bankAccountsPerSlot;
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
    if (tier === "pro") return "Pro: több bankfiók & kivonat csatolható Slot*-onként.";
    return "Enterprise / local: korlátlan banki / könyvelési csatolás.";
  }
  return `Basic / Campus: legfeljebb ${limit} banki kivonat (számla) / Slot* — bármilyen időszakra (CSV / PDF / XLS).`;
}

export function isPublicTierId(v: string): v is TierId {
  return isTierId(v);
}
