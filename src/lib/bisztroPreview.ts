import { MASTER_BASELINE } from "@/lib/masterBaseline";
import { KAHN_SEGMENT_ID } from "@/lib/demoCatalog";
import { resolveKahnPlanPro } from "@/lib/strategyCases";

/** Főoldali / demó-indulási kiinduló pálya: Bisztró, organikus tartás, realista sáv. */
export function bisztroDoorPreview() {
  const cards = resolveKahnPlanPro("organic", null);
  const real = cards.find((c) => c.tone === "real") ?? cards[1]!;
  return {
    caseId: KAHN_SEGMENT_ID,
    cashHuf: MASTER_BASELINE.startingCashHuf,
    runwayMonths: real.runwayMonths ?? 0,
    exitPenaltyHuf: real.exitPenaltyHuf ?? 0,
    monthlyObligationHuf: real.monthlyObligationHuf ?? 0,
  };
}

export function kpisNeverEmpty(n: number | null | undefined): number {
  return n == null || !Number.isFinite(n) ? 0 : n;
}
