/** Kahn: Core ↔ Projekt ↔ Magán reakciós hatásmodell (illusztratív, demó). */

import { glossaryCopy } from "@/lib/glossary";
import { MASTER_BASELINE } from "@/lib/masterBaseline";
import { KAHN_FORK } from "@/lib/strategyCases";
import { KAHN_PESS_PAY_CUT_PCT, kahnOptimisticDividendHuf, type KahnImpactScenario } from "@/lib/kahnGuide";

export type KahnSphere = "core" | "project" | "personal";

export const KAHN_STOP_LOSS_ALERT_HU =
  "A megjelölt vészfék-pont (Stop-loss) élesedése a személyes tartalékok védelme érdekében a projekt-finanszírozás azonnali felfüggesztését írja elő.";

export const KAHN_STOP_LOSS_ALERT_EN =
  "Triggering the marked stop-loss point requires an immediate suspension of project financing to protect personal reserves.";

function jargon(id: "runway" | "stopLoss" | "penalty") {
  const hu = glossaryCopy(id, "hu");
  const en = glossaryCopy(id, "en");
  return {
    termHu: `${hu.term} (${hu.plain})`,
    termEn: `${en.term} (${en.plain})`,
    exactHu: hu.exact,
    exactEn: en.exact,
  };
}

export const KAHN_JARGON = {
  runway: jargon("runway"),
  stopLoss: jargon("stopLoss"),
  penalty: jargon("penalty"),
} as const;

export const KAHN_TOUR_STEPS = [
  {
    id: "core" as const,
    sphere: "core" as KahnSphere,
    titleHu: "A törzs-alapműködés és a kockázatos projektek elkülönítése.",
    titleEn: "Separating core operations from risky projects.",
  },
  {
    id: "project" as const,
    sphere: "project" as KahnSphere,
    titleHu: "A szórási tartományok és a vészfék-pontok (Stop-loss) meghatározása.",
    titleEn: "Setting spread bands and stop-loss points.",
  },
  {
    id: "personal" as const,
    sphere: "personal" as KahnSphere,
    titleHu: "A döntések hatása a személyes és családi vagyoni biztonságra.",
    titleEn: "How decisions affect personal and family wealth safety.",
  },
] as const;

export type KahnPersonalFlow = {
  scenario: KahnImpactScenario;
  /** Havi osztalék / kivét keret a választott ágon. */
  dividendFrameHuf: number;
  /** Delta a reális ághoz képest. */
  dividendDeltaHuf: number;
  /** Becsült személyes megtakarítási keret a választott ágon. */
  savingsFrameHuf: number;
  savingsDeltaHuf: number;
  stopLossActive: boolean;
  projectFundingSuspended: boolean;
  payCutPct: number;
  minRunwayMonths: number;
  exitPenaltyHuf: number;
  optionFeeHuf: number;
};

/** Alap kivét ≈ 8% havi nettó bevétel; megtakarítási keret ≈ tartalék 15%-a. */
export function kahnPersonalFlow(scenario: KahnImpactScenario): KahnPersonalFlow {
  const baseDividend = Math.round(MASTER_BASELINE.monthlyRevenueNet * 0.08);
  const baseSavings = Math.round(MASTER_BASELINE.startingCashHuf * 0.15);
  const optBump = kahnOptimisticDividendHuf();

  if (scenario === "optimistic") {
    const dividendFrameHuf = baseDividend + optBump;
    const savingsFrameHuf = Math.round(baseSavings * 1.22);
    return {
      scenario,
      dividendFrameHuf,
      dividendDeltaHuf: dividendFrameHuf - baseDividend,
      savingsFrameHuf,
      savingsDeltaHuf: savingsFrameHuf - baseSavings,
      stopLossActive: false,
      projectFundingSuspended: false,
      payCutPct: 0,
      minRunwayMonths: KAHN_FORK.minRunwayMonths,
      exitPenaltyHuf: KAHN_FORK.contractA.exitPenaltyHuf,
      optionFeeHuf: KAHN_FORK.optionFeeHuf,
    };
  }

  if (scenario === "pessimistic") {
    const dividendFrameHuf = Math.round(baseDividend * (1 - KAHN_PESS_PAY_CUT_PCT / 100));
    const savingsFrameHuf = Math.round(baseSavings * 0.92);
    return {
      scenario,
      dividendFrameHuf,
      dividendDeltaHuf: dividendFrameHuf - baseDividend,
      savingsFrameHuf,
      savingsDeltaHuf: savingsFrameHuf - baseSavings,
      stopLossActive: true,
      projectFundingSuspended: true,
      payCutPct: KAHN_PESS_PAY_CUT_PCT,
      minRunwayMonths: KAHN_FORK.minRunwayMonths,
      exitPenaltyHuf: KAHN_FORK.contractA.exitPenaltyHuf,
      optionFeeHuf: KAHN_FORK.optionFeeHuf,
    };
  }

  return {
    scenario: "realistic",
    dividendFrameHuf: baseDividend,
    dividendDeltaHuf: 0,
    savingsFrameHuf: baseSavings,
    savingsDeltaHuf: 0,
    stopLossActive: false,
    projectFundingSuspended: false,
    payCutPct: 0,
    minRunwayMonths: KAHN_FORK.minRunwayMonths,
    exitPenaltyHuf: KAHN_FORK.contractA.exitPenaltyHuf,
    optionFeeHuf: KAHN_FORK.optionFeeHuf,
  };
}

export function kahnSphereFromWorkspace(workspaceId: string): KahnSphere {
  if (workspaceId === "personal") return "personal";
  if (workspaceId === "Projekt1") return "project";
  return "core";
}

export const KAHN_FOCUS_IDS = {
  core: "kahn-core-focus",
  project: "kahn-project-focus",
  personal: "kahn-personal-focus",
  tour: "kahn-guided-tour",
} as const;
