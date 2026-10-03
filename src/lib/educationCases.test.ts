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
    expect(EDUCATION_SEGMENTS.map((s) => s.kind)).toEqual(["startup", "ops", "campus", "cyber"]);
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

  it("ops OEE/SMED and Quick Win ROI move lead time", () => {
    const m = buildEducationModel("demo16_edu_lean_vsm");
    expect(m.kind).toBe("ops");
    const oee = m.kpis.find((k) => k.id === "oee")!;
    const smed = m.kpis.find((k) => k.id === "smed")!;
    const lead = m.kpis.find((k) => k.id === "lead")!;
    const roi = m.kpis.find((k) => k.id === "roi")!;
    expect(oee.opt).toBeGreaterThan(oee.pess);
    expect(smed.opt).toBeLessThan(smed.pess);
    expect(lead.opt).toBeLessThan(lead.pess);
    expect(roi.opt).toBeGreaterThan(roi.pess);
    expect(m.extras.some((e) => e.label.includes("CapEx"))).toBe(true);
  });

  it("recognizes only education ids", () => {
    expect(isEducationSegment("demo15_edu_startup_cashflow")).toBe(true);
    expect(isEducationSegment("demo11_resilience_saas_outage")).toBe(false);
  });
});
