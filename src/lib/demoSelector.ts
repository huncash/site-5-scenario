import { writeScenarioDoorStep } from "@/lib/doorStep";

/** Főoldali hierarchikus demóválasztó (kategóriák + DEMO 1… kártyák). */
export const DEMO_SELECTOR_HASH = "tipusok";

export function preferDemoSelectorHome() {
  writeScenarioDoorStep("type");
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("szcenario_home_mode");
    window.dispatchEvent(new Event("szcenario:home_mode"));
  } catch {
    /* ignore */
  }
}
