import { describe, expect, it } from "vitest";

import {
  BASE_CASE_IDS,
  CORE_CASE_IDS,
  LENS_CASE_IDS,
  PILLAR_OF,
  TIER_OF,
  coreCasesOnStep,
  groupPublicDemoSegments,
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
    expect(isLensCaseId("demo8_industry_supply_shock")).toBe(true);
    expect(isCoreCaseId("demo19_strategy_new_line")).toBe(false);
    expect(isCoreCaseId("demo26_industry_saas_exit")).toBe(false);
    expect(TIER_OF.demo1_multisite_operator).toBe("base");
    expect(TIER_OF[KAHN_SEGMENT_ID]).toBe("lens");
  });

  it("numbers public demos DEMO 1…18 with matching ids and no gaps", () => {
    const pubs = publicDemoSegments();
    expect(CORE_CASE_IDS).toEqual(pubs.map((s) => s.id));
    pubs.forEach((s, i) => {
      const n = i + 1;
      expect(s.id.startsWith(`demo${n}_`)).toBe(true);
      expect(s.name.startsWith(`DEMO ${n} —`)).toBe(true);
    });
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
    expect(manufacturing).toEqual(["demo8_industry_supply_shock", "demo9_industry_poka_recall"]);
    expect(inner).toContain("demo18_personal_pocket_seasonal_pilot");
    expect(new Set(listed).size).toBe(18);
  });

  it("groups login demos by scenario kind then industry", () => {
    const groups = groupPublicDemoSegments();
    expect(groups.map((g) => g.kind)).toEqual(["economic", "resilience", "education", "inner"]);
    const flat = groups.flatMap((g) => g.industries.flatMap((b) => b.segments.map((s) => s.id)));
    expect(flat).toHaveLength(18);
    expect(new Set(flat).size).toBe(18);
    const economic = groups.find((g) => g.kind === "economic")!;
    expect(economic.industries.some((b) => b.industry === "hospitality" && b.segments.length === 6)).toBe(true);
    expect(economic.industries.some((b) => b.industry === "strategy")).toBe(true);
    const resilience = groups.find((g) => g.kind === "resilience")!;
    expect(resilience.industries).toHaveLength(4);
  });
});
