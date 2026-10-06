import { beforeEach, describe, expect, it } from "vitest";

import { readKahnPlanPath, resetKahnPlanPath, setKahnContract, setKahnFinancing } from "./kahnPlanPath";
import { resolveKahnPlanPro } from "./strategyCases";

describe("kahnPlanPath", () => {
  beforeEach(() => {
    resetKahnPlanPath();
  });

  it("organic clears the A/B contract; loan A vs B stay distinct", () => {
    resetKahnPlanPath();
    setKahnFinancing("loan");
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
