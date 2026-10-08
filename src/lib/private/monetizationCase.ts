/**
 * Privát monetizációs szimuláció — NEM része a publikus demó/katalógus listáknak.
 * Elérés: csak localhost `/admin/monetization-sim`.
 *
 * Két pillér: Opció A (örök használat + 1 év frissítés, egyszeri vagy 2×60 nap),
 * Opció B (opcionális Y2+ éves frissítés a meglévő örök licenc mellé).
 */

import { INSTALLMENT2_DUE_DAYS } from "@/lib/installmentPlan";
import {
  OURS_PRO_MAINTENANCE_HUF,
  OURS_PRO_PERPETUAL_HUF,
  OURS_PRO_Y3_HUF,
} from "@/lib/private/marketControls";

export const PRIVATE_MONETIZATION_CASE = {
  id: "private-szcenario-monetization",
  title: "PRIVÁT: Szcenárió Monetizációs & Árazási Szimuláció (3 Év)",
  isPrivate: true as const,
  timeHorizonMonths: 36,
  installmentDueDays: INSTALLMENT2_DUE_DAYS,

  optionA: {
    id: "option-a-perpetual-y1",
    name: "Opció A: Örök használat + 1 év frissítés",
    description:
      "Egyszeri listaár, vagy 2 egyenlő részlet 60 napon belül. A szoftver hátraléknál nem zár.",
    baseValues: {
      perpetualPrice: OURS_PRO_PERPETUAL_HUF,
      initialSales: 8,
      salesGrowthRate: 0.05,
      cacPerLicense: 65_000,
      /** 0 = mindenki egyszerre fizet; 1 = mindenki 2 részletben. */
      installmentShare: 0.5,
    },
  },

  optionB: {
    id: "option-b-y2-update",
    name: "Opció B: Éves frissítés Y2+-tól (opcionális)",
    description:
      "Nem kötelező kiegészítés a meglévő örök licenc mellé. Y2 75% · Y3 60% · Y4+ 0. Nincs havi előfizetés.",
    baseValues: {
      attachRate: 0.65,
      feeY2: OURS_PRO_MAINTENANCE_HUF,
      feeY3: OURS_PRO_Y3_HUF,
    },
  },
} as const;

export type PrivateMonetizationCase = typeof PRIVATE_MONETIZATION_CASE;

export type OptionASliderState = {
  perpetualPrice: number;
  installmentSharePct: number;
  initialSales: number;
  salesGrowthPct: number;
};

export type OptionBSliderState = {
  attachRatePct: number;
};

export function optionABaselineSliders(): OptionASliderState {
  const b = PRIVATE_MONETIZATION_CASE.optionA.baseValues;
  return {
    perpetualPrice: b.perpetualPrice,
    installmentSharePct: b.installmentShare * 100,
    initialSales: b.initialSales,
    salesGrowthPct: b.salesGrowthRate * 100,
  };
}

export function optionBBaselineSliders(): OptionBSliderState {
  return {
    attachRatePct: PRIVATE_MONETIZATION_CASE.optionB.baseValues.attachRate * 100,
  };
}
