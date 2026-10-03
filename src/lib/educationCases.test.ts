import { describe, expect, it } from "vitest";

import {
  buildEducationModel,
  buildEducationWhatIf,
  EDUCATION_SEGMENTS,
  isEducationSegment,
} from "./educationCases";

describe("educationCases", () => {
  it("keeps four mixed training cases", () => {
    expect(EDUCATION_SEGMENTS).toHaveLength(4);
    expect(EDUCATION_SEGMENTS.map((s) => s.kind)).toEqual(["startup", "lean", "campus", "cyber"]);
  });

  it("startup break-even is earlier on the optimistic band", () => {
    const m = buildEducationModel("demo15_edu_startup_cashflow");
    const be = m.kpis.find((k) => k.id === "be")!;
    expect(be.opt).toBeLessThan(be.real);
    expect(be.real).toBeLessThan(be.pess);
    const w = buildEducationWhatIf({
      caseId: "demo15_edu_startup_cashflow",
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    });
    expect(w?.chart[3]!.optimistic).toBeGreaterThan(w!.chart[3]!.realistic);
  });

  it("lean OEE and SMED move lead time", () => {
    const m = buildEducationModel("demo16_edu_lean_vsm");
    const oee = m.kpis.find((k) => k.id === "oee")!;
    const smed = m.kpis.find((k) => k.id === "smed")!;
    const lead = m.kpis.find((k) => k.id === "lead")!;
    expect(oee.opt).toBeGreaterThan(oee.pess);
    expect(smed.opt).toBeLessThan(smed.pess);
    expect(lead.opt).toBeLessThan(lead.pess);
  });

  it("recognizes only education ids", () => {
    expect(isEducationSegment("demo15_edu_startup_cashflow")).toBe(true);
    expect(isEducationSegment("demo11_resilience_saas_outage")).toBe(false);
  });
});
