import { describe, expect, it } from "vitest";

import { CORE_CASE_IDS } from "@/lib/coreCases";
import {
  CORE_SCENARIO_KIND,
  isStartableScenarioKind,
  scenarioKindOf,
} from "@/lib/scenarioCatalog";

describe("scenario module startability", () => {
  it("starts only the economic engine", () => {
    expect(CORE_SCENARIO_KIND).toBe("economic");
    expect(isStartableScenarioKind("economic")).toBe(true);
    expect(isStartableScenarioKind("resilience")).toBe(false);
    expect(isStartableScenarioKind("education")).toBe(false);
    expect(isStartableScenarioKind("inner")).toBe(false);
    expect(isStartableScenarioKind("climate")).toBe(false);
  });

  it("keeps hospitality and Kahn on the core engine", () => {
    expect(scenarioKindOf("demo1_multisite_operator")).toBe("economic");
    expect(scenarioKindOf("demo11_strategy_kahn_fork")).toBe("economic");
    expect(isStartableScenarioKind(scenarioKindOf("demo11_strategy_kahn_fork"))).toBe(true);
  });

  it("marks BCP, education and inner as add-on kinds", () => {
    expect(scenarioKindOf("demo12_resilience_saas_outage")).toBe("resilience");
    expect(scenarioKindOf("demo16_edu_startup_cashflow")).toBe("education");
    expect(scenarioKindOf("demo18_personal_pocket_seasonal_pilot")).toBe("inner");
    for (const id of CORE_CASE_IDS) {
      const kind = scenarioKindOf(id);
      if (kind === "economic") expect(isStartableScenarioKind(kind)).toBe(true);
      else expect(isStartableScenarioKind(kind)).toBe(false);
    }
  });
});
