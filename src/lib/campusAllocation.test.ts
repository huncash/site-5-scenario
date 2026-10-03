import { describe, expect, it } from "vitest";

import {
  MARKETING_LAG_MONTHS,
  POKA_RESERVE_MIN_PCT,
  PRODUCT_LAG_MONTHS,
  clampAlloc,
  simulateCampus,
} from "./campusAllocation";

describe("campusAllocation", () => {
  it("clamps spend into 100 minus reserve", () => {
    const a = clampAlloc({ marketing: 80, product: 80, payroll: 80, reserve: 12 });
    expect(a.reserve).toBe(12);
    expect(a.marketing + a.product + a.payroll + a.reserve).toBe(100);
  });

  it("keeps revenue flat until marketing lag, then the band opens", () => {
    const sim = simulateCampus({ marketing: 40, product: 30, payroll: 18, reserve: 12 });
    expect(sim.series[0]!.real).toBeGreaterThan(sim.series[MARKETING_LAG_MONTHS - 1]!.real);
    expect(sim.series[PRODUCT_LAG_MONTHS]!.opt).toBeGreaterThan(sim.series[0]!.opt);
    expect(sim.series[5]!.opt).toBeGreaterThan(sim.series[5]!.real);
    expect(sim.series[5]!.real).toBeGreaterThan(sim.series[5]!.pess);
  });

  it("Poka-Yoke reserve below the floor worsens the pessimistic band", () => {
    const ok = simulateCampus({ marketing: 30, product: 30, payroll: 28, reserve: POKA_RESERVE_MIN_PCT });
    const bare = simulateCampus({ marketing: 30, product: 30, payroll: 40, reserve: 0 });
    expect(ok.pokaOk).toBe(true);
    expect(bare.pokaOk).toBe(false);
    expect(bare.series[bare.series.length - 1]!.pess).toBeLessThan(ok.series[ok.series.length - 1]!.pess);
  });

  it("more marketing beats more payroll after the delay", () => {
    const ads = simulateCampus({ marketing: 50, product: 20, payroll: 18, reserve: 12 });
    const wages = simulateCampus({ marketing: 10, product: 20, payroll: 58, reserve: 12 });
    expect(ads.series[8]!.real).toBeGreaterThan(wages.series[8]!.real);
  });
});
