import { describe, expect, it } from "vitest";

import { buildPhysicalDashboard } from "./physicalMetrics";
import { baselineForSegment, scenarioSurface } from "./scenarioSurface";
import {
  HOSPITAL_GENERATOR_KW,
  INDUSTRY_SEGMENTS,
  buildIndustryWhatIf,
  defaultHospitalAlloc,
  isIndustrySegment,
  resolveIndustryWalk,
  simulateHospital,
} from "./industryCases";

describe("industryCases", () => {
  it("keeps seven cases on four doors", () => {
    expect(INDUSTRY_SEGMENTS).toHaveLength(7);
    expect(new Set(INDUSTRY_SEGMENTS.map((s) => s.door)).size).toBe(4);
  });

  it("hospital triage keeps ICU/NICU and sheds the ward first", () => {
    const sim = simulateHospital(defaultHospitalAlloc());
    expect(sim.loadKw).toBeLessThanOrEqual(HOSPITAL_GENERATOR_KW);
    expect(sim.wards.find((w) => w.id === "icu")!.kept).toBe(true);
    expect(sim.wards.find((w) => w.id === "nicu")!.kept).toBe(true);
    expect(sim.shedKw).toBeGreaterThan(0);
    expect(sim.triageOk).toBe(true);
  });

  it("overload on the vital loop fails triage", () => {
    const sim = simulateHospital({ icu: 120, or: 80, nicu: 80, ward: 40 });
    expect(sim.triageOk).toBe(false);
    expect(sim.wards.find((w) => w.id === "nicu")!.kept).toBe(false);
  });

  it("fuel and tax keep finance, hospital hides it", () => {
    expect(scenarioSurface("demo20_industry_hospital_blackout")).toMatchObject({
      family: "industry",
      showFinanceModules: false,
      showPhysicalKpis: true,
      showLean: true,
    });
    expect(scenarioSurface("demo24_industry_fuel_crisis").showFinanceModules).toBe(true);
    expect(scenarioSurface("demo25_industry_tax_shock").showFinanceModules).toBe(true);
    expect(baselineForSegment("demo20_industry_hospital_blackout").orgKind).toBe("hospital");
  });

  it("SaaS local-first walk is cheaper than paying the vendor shock", () => {
    const local = resolveIndustryWalk("saas", ["local"]);
    const pay = resolveIndustryWalk("saas", ["pay"]);
    expect(local.cashHuf).toBeGreaterThan(pay.cashHuf);
    expect(local.runwayMonths).toBeGreaterThan(pay.runwayMonths);
  });

  it("fuel what-if optimistic recovers after the spike", () => {
    const w = buildIndustryWhatIf({
      caseId: "demo24_industry_fuel_crisis",
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    })!;
    expect(w.chart[11]!.optimistic).toBeGreaterThan(w.chart[11]!.pessimistic);
    expect(w.signals.map((s) => s.tone)).toEqual(["opt", "real", "pess"]);
  });

  it("hospital physical dashboard has energy and fuel gauges", () => {
    const dash = buildPhysicalDashboard("demo20_industry_hospital_blackout");
    expect(dash?.gauges.some((g) => g.id === "energy")).toBe(true);
    expect(dash?.gauges.some((g) => g.id === "runway-fuel")).toBe(true);
    expect(dash?.forks[0]?.id).toBe("triage");
  });

  it("recognizes only industry ids", () => {
    expect(isIndustrySegment("demo21_industry_supply_shock")).toBe(true);
    expect(isIndustrySegment("demo11_resilience_saas_outage")).toBe(false);
  });
});
