import { KAHN_FORK } from "@/lib/strategyCases";
import { MASTER_BASELINE } from "@/lib/masterBaseline";

export type KahnGuideStepId = "core" | "project" | "personal";
export type KahnGuideWorkspace = "personal" | "business" | "project";
export type KahnImpactScenario = "optimistic" | "realistic" | "pessimistic";

export const KAHN_GUIDE_COLLAPSE_KEY = "kahn-guide:collapsed";
/** Tartós elrejtés (localStorage) — GuidedTourBanner. */
export const KAHN_GUIDE_HIDE_KEY = "kahn-guide:hidden";

/** Illustratív osztalék-ugrás a jó ágon (≈1,8× havi nettó). */
export function kahnOptimisticDividendHuf() {
  return Math.round(MASTER_BASELINE.monthlyRevenueNet * 1.8);
}

/** Ügyvezetői kivét csökkentés a rossz ágon (%). */
export const KAHN_PESS_PAY_CUT_PCT = 30;

export function kahnGuideChain(): Array<{
  id: KahnGuideStepId;
  workspace: KahnGuideWorkspace;
}> {
  return [
    { id: "core", workspace: "business" },
    { id: "project", workspace: "project" },
    { id: "personal", workspace: "personal" },
  ];
}

export function readKahnGuideCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(KAHN_GUIDE_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeKahnGuideCollapsed(collapsed: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KAHN_GUIDE_COLLAPSE_KEY, collapsed ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function readKahnGuideHidden(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KAHN_GUIDE_HIDE_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeKahnGuideHidden(hidden: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KAHN_GUIDE_HIDE_KEY, hidden ? "1" : "0");
    window.dispatchEvent(new Event("szcenario:kahn_guide_hidden"));
  } catch {
    /* ignore */
  }
}

export function kahnImpactTone(scenario: KahnImpactScenario): "opt" | "real" | "pess" {
  if (scenario === "optimistic") return "opt";
  if (scenario === "pessimistic") return "pess";
  return "real";
}

export function kahnExitVsOptionHint() {
  return {
    exitPenaltyHuf: KAHN_FORK.contractA.exitPenaltyHuf,
    optionFeeHuf: KAHN_FORK.optionFeeHuf,
    minRunwayMonths: KAHN_FORK.minRunwayMonths,
  };
}
