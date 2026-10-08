/**
 * Előredefiniált vészhelyzeti best practice vs. gazdasági eset.
 * Azonos mezőket elnyeli; eltérő mértékegység / vonatkozás → BCP modul.
 */
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import {
  FOOD_KG_PER_PERSON_DAY,
  FUEL_L_PER_PERSON_DAY,
  WATER_L_PER_PERSON_DAY,
} from "@/lib/physicalMetrics";
import { MASTER_BASELINE } from "@/lib/masterBaseline";

export type BcpDeltaKind = "shared" | "delta";

export type BcpPracticeField = {
  id: string;
  labelHu: string;
  economicUnit: string | null;
  bcpUnit: string;
  economicValue: number | null;
  bcpValue: number;
  kind: BcpDeltaKind;
};

export const BCP_BEST_PRACTICE = {
  id: "bcp-72h-local-first",
  labelHu: "72 órás helyi működési tartalék",
  ttrTargetHours: 4,
  autonomyHours: 72,
  waterLPerPersonDay: WATER_L_PER_PERSON_DAY,
  foodKgPerPersonDay: FOOD_KG_PER_PERSON_DAY,
  fuelLPerPersonDay: FUEL_L_PER_PERSON_DAY,
  meshCoveragePct: 90,
} as const;

function sameNumber(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

export function compareEconomicToBcp(snap: EconomicReadSnapshot): {
  ignored: BcpPracticeField[];
  delta: BcpPracticeField[];
} {
  const rows: BcpPracticeField[] = [
    {
      id: "headcount",
      labelHu: "Létszám",
      economicUnit: "fő",
      bcpUnit: "fő",
      economicValue: snap.headcount,
      bcpValue: MASTER_BASELINE.headcount,
      kind: sameNumber(snap.headcount, MASTER_BASELINE.headcount) ? "shared" : "delta",
    },
    {
      id: "runway",
      labelHu: "Tartalék idő",
      economicUnit: "hó",
      bcpUnit: "óra",
      economicValue: snap.runwayMonths,
      bcpValue: BCP_BEST_PRACTICE.autonomyHours,
      kind: "delta",
    },
    {
      id: "reserve",
      labelHu: "Tartalék mélysége",
      economicUnit: "Ft",
      bcpUnit: "óra",
      economicValue: snap.reserveDepthHuf,
      bcpValue: BCP_BEST_PRACTICE.autonomyHours,
      kind: "delta",
    },
    {
      id: "opex",
      labelHu: "Üzemeltetés",
      economicUnit: "Ft/hó",
      bcpUnit: "L/fő/nap",
      economicValue: snap.monthlyOpexHuf,
      bcpValue: BCP_BEST_PRACTICE.fuelLPerPersonDay,
      kind: "delta",
    },
    {
      id: "ttr",
      labelHu: "Helyreállási idő (TTR)",
      economicUnit: null,
      bcpUnit: "óra",
      economicValue: null,
      bcpValue: BCP_BEST_PRACTICE.ttrTargetHours,
      kind: "delta",
    },
    {
      id: "water",
      labelHu: "Ivóvíz",
      economicUnit: null,
      bcpUnit: "L/fő/nap",
      economicValue: null,
      bcpValue: BCP_BEST_PRACTICE.waterLPerPersonDay,
      kind: "delta",
    },
    {
      id: "food",
      labelHu: "Élelmiszer",
      economicUnit: null,
      bcpUnit: "kg/fő/nap",
      economicValue: null,
      bcpValue: BCP_BEST_PRACTICE.foodKgPerPersonDay,
      kind: "delta",
    },
    {
      id: "mesh",
      labelHu: "Helyi mesh lefedettség",
      economicUnit: null,
      bcpUnit: "%",
      economicValue: null,
      bcpValue: BCP_BEST_PRACTICE.meshCoveragePct,
      kind: "delta",
    },
  ];
  return {
    ignored: rows.filter((r) => r.kind === "shared"),
    delta: rows.filter((r) => r.kind === "delta"),
  };
}
