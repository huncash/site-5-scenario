export const SCENARIO_DOOR_STEP_KEY = "ui:scenarioDoorStep";

export type ScenarioDoorStep =
  | "type"
  | "economic"
  | "industry"
  | "hospitality"
  | "strategy"
  | "resilience"
  | "education"
  | "healthcare"
  | "manufacturing"
  | "logistics"
  | "services"
  | "inner";

export function readScenarioDoorStep(): ScenarioDoorStep {
  if (typeof window === "undefined") return "type";
  try {
    const raw = sessionStorage.getItem(SCENARIO_DOOR_STEP_KEY);
    if (raw === "economic" || raw === "industry") return "economic";
    if (raw === "hospitality") return "hospitality";
    if (raw === "strategy") return "strategy";
    if (raw === "education" || raw === "training") return "education";
    if (raw === "resilience" || raw === "crisis" || raw === "disaster") return "resilience";
    if (raw === "inner" || raw === "zones") return "inner";
    if (raw === "healthcare") return "healthcare";
    if (raw === "manufacturing") return "manufacturing";
    if (raw === "logistics") return "logistics";
    return "type";
  } catch {
    return "type";
  }
}

export function writeScenarioDoorStep(step: ScenarioDoorStep) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCENARIO_DOOR_STEP_KEY, step);
  } catch {
    /* ignore */
  }
}
