import { describe, expect, it } from "vitest";

import {
  BASE_CASE_IDS,
  CORE_CASE_IDS,
  LENS_CASE_IDS,
  PILLAR_OF,
  TIER_OF,
  coreCasesOnStep,
  isBaseCaseId,
  isCoreCaseId,
  isLensCaseId,
  KAHN_SEGMENT_ID,
  publicDemoSegments,
} from "./coreCases";

describe("coreCases", () => {
  it("locks the public pack at 7 base + 11 lenses = 18 unique cases", () => {
    expect(BASE_CASE_IDS).toHaveLength(7);
    expect(LENS_CASE_IDS).toHaveLength(11);
    expect(CORE_CASE_IDS).toHaveLength(18);
    expect(publicDemoSegments()).toHaveLength(18);
    expect(new Set(CORE_CASE_IDS).size).toBe(18);
    expect(new Set(Object.values(PILLAR_OF)).size).toBe(5);
    expect(isCoreCaseId(KAHN_SEGMENT_ID)).toBe(true);
    expect(isBaseCaseId("demo2_premium_nightlife")).toBe(true);
    expect(isLensCaseId("demo21_industry_supply_shock")).toBe(true);
    expect(isCoreCaseId("demo8_strategy_new_line")).toBe(false);
    expect(isCoreCaseId("demo26_industry_saas_exit")).toBe(false);
    expect(TIER_OF.demo1_multisite_operator).toBe("base");
    expect(TIER_OF[KAHN_SEGMENT_ID]).toBe("lens");
  });

  it("routes each public case onto one door step without overlap", () => {
    const hospitality = coreCasesOnStep("hospitality");
    const manufacturing = coreCasesOnStep("manufacturing");
    const inner = coreCasesOnStep("inner");
    const listed = [
      ...hospitality,
      ...coreCasesOnStep("healthcare"),
      ...manufacturing,
      ...coreCasesOnStep("logistics"),
      ...inner,
      ...coreCasesOnStep("strategy"),
    ];
    expect(hospitality).toHaveLength(6);
    expect(manufacturing).toEqual(["demo21_industry_supply_shock", "demo22_industry_poka_recall"]);
    expect(inner).toContain("demo7_personal_pocket_seasonal_pilot");
    expect(new Set(listed).size).toBe(18);
  });
});
