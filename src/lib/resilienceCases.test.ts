import { describe, expect, it } from "vitest";

import {
  buildResilienceModel,
  isResilienceSegment,
  RESILIENCE_SEGMENTS,
  TFR_MATRIX,
} from "./resilienceCases";

describe("resilienceCases", () => {
  it("keeps four physical / macro cases", () => {
    expect(RESILIENCE_SEGMENTS).toHaveLength(4);
    expect(RESILIENCE_SEGMENTS.map((s) => s.kind)).toEqual(["bcp", "community", "household", "macro"]);
  });

  it("exposes TTR, ResourceRunway and EnergyAutonomy on operational cases", () => {
    for (const id of ["demo12_resilience_saas_outage", "demo13_resilience_community_grid", "demo14_resilience_home_blackout"] as const) {
      const m = buildResilienceModel(id);
      expect(m.kpis.map((k) => k.id).sort()).toEqual(["energyAutonomy", "resourceRunway", "ttr"]);
      expect(m.hours.length).toBeGreaterThan(8);
      expect(m.tfrRows).toHaveLength(0);
    }
  });

  it("keeps an offline TFR matrix under replacement fertility", () => {
    const m = buildResilienceModel("demo15_resilience_demography");
    expect(m.tfrRows).toHaveLength(5);
    expect(TFR_MATRIX.every((r) => r.tfr < m.replacementTfr)).toBe(true);
    expect(TFR_MATRIX.map((r) => r.id)).toEqual(["kr", "cn", "it", "jp", "hu"]);
    expect(m.hours).toHaveLength(0);
  });

  it("recognizes only resilience ids", () => {
    expect(isResilienceSegment("demo12_resilience_saas_outage")).toBe(true);
    expect(isResilienceSegment("demo19_strategy_new_line")).toBe(false);
  });
});
