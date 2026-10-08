import type { KahnContractId, KahnFinancingId, KahnProLive } from "@/lib/strategyCases";
import { KAHN_FORK, kahnReserveTargetHuf, resolveKahnPlanPro } from "@/lib/strategyCases";

export const ADVISOR_CLIENT_REPORT_KIND = "szcenario-advisor-client-report";

export type AdvisorClientCash = {
  income: number;
  expense: number;
  balance: number;
  lockedVat: number;
};

export type AdvisorClientReport = {
  kind: typeof ADVISOR_CLIENT_REPORT_KIND;
  version: 1;
  generatedAt: string;
  profileName: string;
  workspace: string;
  cash: AdvisorClientCash;
  path: { financing: KahnFinancingId | null; contract: KahnContractId | null };
  stress: Array<{
    band: string;
    runwayMonths: number | null;
    exitPenaltyHuf: number | null;
    monthlyObligationHuf: number | null;
    note: string;
  }>;
  riskRoom: {
    runwayMonths: number | null;
    exitPenaltyHuf: number | null;
    monthlyObligationHuf: number | null;
    minRunwayMonths: number;
    reserveTargetHuf: number;
  };
};

export function buildAdvisorClientReport(input: {
  profileName: string;
  workspace: string;
  cash: AdvisorClientCash;
  financing: KahnFinancingId | null;
  contract: KahnContractId | null;
  generatedAt?: string;
}): AdvisorClientReport {
  const live = resolveKahnPlanPro(input.financing, input.contract);
  const pess: KahnProLive = live.find((c) => c.tone === "pess") ?? live[live.length - 1]!;
  return {
    kind: ADVISOR_CLIENT_REPORT_KIND,
    version: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    profileName: input.profileName,
    workspace: input.workspace,
    cash: input.cash,
    path: { financing: input.financing, contract: input.contract },
    stress: live.map((c) => ({
      band: c.label,
      runwayMonths: c.runwayMonths,
      exitPenaltyHuf: c.exitPenaltyHuf,
      monthlyObligationHuf: c.monthlyObligationHuf,
      note: c.strategy,
    })),
    riskRoom: {
      runwayMonths: pess.runwayMonths,
      exitPenaltyHuf: pess.exitPenaltyHuf,
      monthlyObligationHuf: pess.monthlyObligationHuf,
      minRunwayMonths: KAHN_FORK.minRunwayMonths,
      reserveTargetHuf: kahnReserveTargetHuf(),
    },
  };
}
