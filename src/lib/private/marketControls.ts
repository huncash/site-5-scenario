/**
 * Szcenárió örökös listaárak a privát monetizációs szimulátorhoz.
 * Csak localhost `/admin/monetization-sim` — nincs havi SaaS sáv.
 */

import { loyaltyFeesFromYear1Huf, PLANS_CONFIG, totalSlots } from "@/config/plans";

export type MarketTier = "starter" | "pro" | "enterprise";

export type OursCatalogRow = {
  tier: MarketTier;
  planId: "starter" | "pro" | "expert";
  label: string;
  y1: number;
  y2: number;
  y3: number;
  y4: 0;
  cases: number;
  slots: number;
  seats: number;
  guests: number;
};

const PLAN_BY_TIER: Record<MarketTier, "starter" | "pro" | "expert"> = {
  starter: "starter",
  pro: "pro",
  enterprise: "expert",
};

export function oursCatalogRow(tier: MarketTier): OursCatalogRow {
  const planId = PLAN_BY_TIER[tier];
  const plan = PLANS_CONFIG[planId];
  const fees = loyaltyFeesFromYear1Huf(plan.priceHuf);
  const cases = typeof plan.quotas.cases === "number" ? plan.quotas.cases : 0;
  return {
    tier,
    planId,
    label: plan.label,
    y1: plan.priceHuf,
    y2: fees.y2,
    y3: fees.y3,
    y4: 0,
    cases,
    slots: totalSlots(plan),
    seats: plan.quotas.seats,
    guests: plan.quotas.guests,
  };
}

/** Összegző mátrix — tiszta örökös listaár + kapacitás. */
export const MARKET_CONTROL_MATRIX: readonly OursCatalogRow[] = (
  ["starter", "pro", "enterprise"] as const
).map(oursCatalogRow);

export const OURS_SOLO_PERPETUAL_HUF = 199_000;
export const OURS_PRO_PERPETUAL_HUF = 399_000;
export const OURS_ENTERPRISE_PERPETUAL_HUF = 799_000;

const OURS_BASIC_LOYALTY = loyaltyFeesFromYear1Huf(OURS_SOLO_PERPETUAL_HUF);
export const OURS_BASIC_Y2_HUF = OURS_BASIC_LOYALTY.y2;
export const OURS_BASIC_Y3_HUF = OURS_BASIC_LOYALTY.y3;

const OURS_PRO_LOYALTY = loyaltyFeesFromYear1Huf(OURS_PRO_PERPETUAL_HUF);
export const OURS_PRO_MAINTENANCE_HUF = OURS_PRO_LOYALTY.y2;
export const OURS_PRO_Y3_HUF = OURS_PRO_LOYALTY.y3;

const OURS_ENT_LOYALTY = loyaltyFeesFromYear1Huf(OURS_ENTERPRISE_PERPETUAL_HUF);
export const OURS_ENTERPRISE_MAINTENANCE_HUF = OURS_ENT_LOYALTY.y2;
export const OURS_ENTERPRISE_Y3_HUF = OURS_ENT_LOYALTY.y3;
