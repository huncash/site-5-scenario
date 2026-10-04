/**
 * Privát monetizációs szimuláció — NEM része a publikus demó/katalógus listáknak.
 * Elérés: csak localhost `/admin/monetization-sim`.
 */

import {
  OURS_ENTERPRISE_MAINTENANCE_HUF,
  OURS_ENTERPRISE_PERPETUAL_HUF,
  OURS_ENTERPRISE_Y3_HUF,
  OURS_PRO_MAINTENANCE_HUF,
  OURS_PRO_PERPETUAL_HUF,
  OURS_PRO_Y3_HUF,
  SAAS_CONTROL_SEAT_MONTHLY_HUF,
} from "@/lib/private/marketControls";

export const PRIVATE_MONETIZATION_CASE = {
  id: "private-szcenario-monetization",
  title: "PRIVÁT: Szcenárió Monetizációs & Árazási Szimuláció (3 Év)",
  isPrivate: true as const,
  timeHorizonMonths: 36,

  slot1: {
    id: "slot-subscription",
    name: "1. Slot: Klasszikus SaaS (havi előfizetés) — piaci kontroll",
    baseValues: {
      seatPriceMonthly: SAAS_CONTROL_SEAT_MONTHLY_HUF,
      initialSeats: 15,
      monthlyGrowthRate: 0.08,
      churnRate: 0.02,
      cacPerSeat: 45_000,
      annualDiscount: 0.2,
    },
  },

  slot2: {
    id: "slot-perpetual",
    name: "2. Slot: Örökös Licenc + 1 Év Frissítés (a mi Pro árazásunk)",
    baseValues: {
      perpetualPrice: OURS_PRO_PERPETUAL_HUF,
      /** 2. évi hűségdíj. */
      maintenanceFeeY2: OURS_PRO_MAINTENANCE_HUF,
      /** 3. évi hűségdíj; 4. évtől 0. */
      maintenanceFeeY3: OURS_PRO_Y3_HUF,
      initialSales: 8,
      salesGrowthRate: 0.05,
      renewalRateYear2And3: 0.75,
      cacPerLicense: 65_000,
    },
  },

  slot3: {
    id: "slot-enterprise-dynamic",
    name: "3. Slot: Enterprise / Multi-Seat (Transzparens & Csúszkás)",
    description:
      "Fix egyedi tárgyalások helyett önkiszolgáló, transzparens csúszkás árazás a nagyobb cégeknek és csapatoknak.",
    baseValues: {
      basePackagePrice: OURS_ENTERPRISE_PERPETUAL_HUF,
      extraCasePrice: 39_000,
      extraSeatPrice: 79_000,
      extraSlotPrice: 49_000,
      monthlySalesVolume: 2,
      annualRenewalRate: 0.85,
      maintenanceFeeY2: OURS_ENTERPRISE_MAINTENANCE_HUF,
      maintenanceFeeY3: OURS_ENTERPRISE_Y3_HUF,
      cacPerLicense: 120_000,
    },
  },
} as const;

export type PrivateMonetizationCase = typeof PRIVATE_MONETIZATION_CASE;

export type SubscriptionSliderState = {
  seatPriceMonthly: number;
  monthlyGrowthRatePct: number;
  churnRatePct: number;
};

export type PerpetualSliderState = {
  perpetualPrice: number;
  renewalRatePct: number;
};

export type EnterpriseSliderState = {
  basePackagePrice: number;
  monthlySalesVolume: number;
  renewalRatePct: number;
};

export function subscriptionBaselineSliders(): SubscriptionSliderState {
  const b = PRIVATE_MONETIZATION_CASE.slot1.baseValues;
  return {
    seatPriceMonthly: b.seatPriceMonthly,
    monthlyGrowthRatePct: b.monthlyGrowthRate * 100,
    churnRatePct: b.churnRate * 100,
  };
}

export function perpetualBaselineSliders(): PerpetualSliderState {
  const b = PRIVATE_MONETIZATION_CASE.slot2.baseValues;
  return {
    perpetualPrice: b.perpetualPrice,
    renewalRatePct: b.renewalRateYear2And3 * 100,
  };
}

export function enterpriseBaselineSliders(): EnterpriseSliderState {
  const b = PRIVATE_MONETIZATION_CASE.slot3.baseValues;
  return {
    basePackagePrice: b.basePackagePrice,
    monthlySalesVolume: b.monthlySalesVolume,
    renewalRatePct: b.annualRenewalRate * 100,
  };
}
