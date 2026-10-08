import { beforeEach, describe, expect, it } from "vitest";

import { readKahnPlanPath, resetKahnPlanPath, setKahnContract, setKahnFinancing } from "./kahnPlanPath";
import { resolveKahnPlanPro } from "./strategyCases";

describe("kahnPlanPath", () => {
  beforeEach(() => {
    resetKahnPlanPath();
  });

  it("starts on the Bisztró organic path so KPIs are filled", () => {
    expect(readKahnPlanPath()).toEqual({ financing: "organic", contract: null });
    const live = resolveKahnPlanPro(readKahnPlanPath().financing, readKahnPlanPath().contract);
    expect(live.every((c) => c.runwayMonths != null && c.exitPenaltyHuf != null && c.monthlyObligationHuf != null)).toBe(
      true,
    );
  });

  it("organic clears the A/B contract; loan A vs B stay distinct", () => {
    resetKahnPlanPath();
    setKahnFinancing("loan");
    expect(readKahnPlanPath().contract).toBe("flex");
    setKahnContract("cheap");
    expect(readKahnPlanPath()).toEqual({ financing: "loan", contract: "cheap" });

    setKahnFinancing("organic");
    expect(readKahnPlanPath()).toEqual({ financing: "organic", contract: null });
    expect(resolveKahnPlanPro("organic", "cheap").every((c) => c.exitPenaltyHuf === 0)).toBe(true);

    setKahnContract("flex");
    expect(readKahnPlanPath()).toEqual({ financing: "loan", contract: "flex" });
    resetKahnPlanPath();
  });
});
