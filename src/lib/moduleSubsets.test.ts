import { describe, expect, it } from "vitest";

import {
  MODULE_SUBSETS,
  SUBSET_LAB_BY_ID,
  isModuleSubsetId,
  moduleSubsetById,
  subsetDomId,
  subsetIdForLab,
} from "@/lib/moduleSubsets";

describe("moduleSubsets", () => {
  it("keeps four business subsets with PDCA targets", () => {
    expect(MODULE_SUBSETS.map((s) => s.id)).toEqual(["baseline", "sim", "shock", "advise"]);
    expect(moduleSubsetById("baseline").pdca).toBe("PD");
    expect(moduleSubsetById("sim").pdca).toBe("PD");
    expect(moduleSubsetById("shock").pdca).toBe("CA");
    expect(moduleSubsetById("advise").pdca).toBe("AP");
    expect(isModuleSubsetId("shock")).toBe(true);
    expect(isModuleSubsetId("edge")).toBe(false);
    expect(subsetDomId("sim")).toBe("module-subset-sim");
    expect(SUBSET_LAB_BY_ID).toEqual({
      baseline: "labs-baseline",
      sim: "labs-sim",
      shock: "labs-shock",
      advise: "labs-advise",
    });
    expect(subsetIdForLab("labs-shock")).toBe("shock");
    expect(subsetIdForLab("labs-edge")).toBe(null);
  });
});
