/**
 * BCP olvasás a gazdasági rétegre: elszigetelt case maradhat,
 * overlay / gépház csak olvas — nem ír vissza a könyvelésbe.
 */
import { MASTER_BASELINE, type MasterBaselineContext } from "@/lib/masterBaseline";

export type BcpViewMode = "isolated" | "overlay" | "engine-room";

export const BCP_VIEW_BLOCK = {
  overlay: "bcp-economic-overlay",
  engineRoom: "bcp-engine-room",
} as const;

export const EDU_ANON_BLOCK = "edu-anonymize";

export type EconomicCostRow = {
  id: string;
  family: string;
  huf: number;
  share: number;
};

export type EconomicReadSnapshot = {
  orgLabel: string;
  headcount: number;
  cashHuf: number;
  lockedHuf: number;
  reserveDepthHuf: number;
  monthlyRevenueNet: number;
  monthlyOpexHuf: number;
  loanRemainingHuf: number;
  runwayMonths: number | null;
  costMix: EconomicCostRow[];
};

const PLAN_ROWS: Array<{ id: string; family: string; huf: number }> = [
  { id: "setup", family: "Indítás / engedély", huf: MASTER_BASELINE.plan.setup + MASTER_BASELINE.plan.permit },
  { id: "lab", family: "Műhely / lab", huf: MASTER_BASELINE.plan.lab },
  { id: "ops", family: "Üzemeltetés", huf: MASTER_BASELINE.plan.recInternet + MASTER_BASELINE.plan.recPhone + MASTER_BASELINE.plan.recBankFees },
  { id: "guard", family: "Könyvelés / biztosítás", huf: MASTER_BASELINE.plan.recAccounting + MASTER_BASELINE.plan.recInsurance },
  { id: "debt", family: "Hiteltörlesztés", huf: MASTER_BASELINE.loan.installment },
];

export function resolveBcpViewMode(overlayOn: boolean, engineRoomOn: boolean): BcpViewMode {
  if (engineRoomOn) return "engine-room";
  if (overlayOn) return "overlay";
  return "isolated";
}

/** Gépház: a gazdasági réteg költsége/tartaléka csak olvasás. Overlay sem ír vissza. */
export function bcpWriteAllowed(mode: BcpViewMode): boolean {
  return mode === "isolated";
}

export function isEngineRoomReadOnly(mode: BcpViewMode): boolean {
  return mode === "engine-room";
}

export function buildEconomicReadSnapshot(input: {
  baseline?: MasterBaselineContext | null;
  live?: {
    cashHuf?: number | null;
    opexHuf?: number | null;
    lockedHuf?: number | null;
    runwayMonths?: number | null;
  };
}): EconomicReadSnapshot {
  const b = input.baseline;
  const cash =
    input.live?.cashHuf ??
    b?.startingResources.cashHuf ??
    MASTER_BASELINE.startingCashHuf;
  const locked = Math.max(0, input.live?.lockedHuf ?? 0);
  const opex =
    input.live?.opexHuf ??
    PLAN_ROWS.reduce((n, r) => n + r.huf, 0);
  const revenue = b?.monthlyRevenueNet ?? MASTER_BASELINE.monthlyRevenueNet;
  const mixSum = PLAN_ROWS.reduce((n, r) => n + r.huf, 0) || 1;
  const runway =
    input.live?.runwayMonths ??
    (opex > 0 ? (cash - locked) / opex : null);
  return {
    orgLabel: b?.orgLabel ?? MASTER_BASELINE.businessAlias,
    headcount: b?.headcount ?? MASTER_BASELINE.headcount,
    cashHuf: Math.max(0, cash),
    lockedHuf: locked,
    reserveDepthHuf: Math.max(0, cash - locked),
    monthlyRevenueNet: Math.max(0, revenue ?? 0),
    monthlyOpexHuf: Math.max(0, opex),
    loanRemainingHuf: MASTER_BASELINE.loan.remaining,
    runwayMonths: runway,
    costMix: PLAN_ROWS.map((row) => ({
      ...row,
      share: row.huf / mixSum,
    })),
  };
}
