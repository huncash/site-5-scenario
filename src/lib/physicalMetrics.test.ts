import { describe, expect, it } from "vitest";

import {
  applyCrisisChoice,
  buildPhysicalDashboard,
  communicationRedundancy,
  energyAutonomyHours,
  pokaYokeErrorIndex,
  resourceRunwayHours,
  survivalBand,
  WATER_L_PER_PERSON_DAY,
} from "./physicalMetrics";

describe("physicalMetrics", () => {
  it("computes resource runway from stock and headcount", () => {
    const hours = resourceRunwayHours({ stock: 72, headcount: 4, perPersonPerDay: WATER_L_PER_PERSON_DAY });
    expect(hours).toBeCloseTo(24 * (72 / (4 * 3)), 5);
  });

  it("computes energy autonomy from Wh, solar and load", () => {
    expect(energyAutonomyHours({ batteryWh: 5200, solarW: 200, loadW: 400 })).toBeCloseTo(26, 5);
    expect(energyAutonomyHours({ batteryWh: 1000, solarW: 500, loadW: 400 })).toBe(168);
  });

  it("maps remaining/target to green-yellow-red", () => {
    expect(survivalBand(80, 100)).toBe("green");
    expect(survivalBand(40, 100)).toBe("yellow");
    expect(survivalBand(10, 100)).toBe("red");
  });

  it("scores communication redundancy from live nodes", () => {
    const r = communicationRedundancy([
      { id: "a", label: "A", kind: "hq", x: 0, y: 0, up: true, links: ["mesh", "lora"] },
      { id: "b", label: "B", kind: "unit", x: 1, y: 1, up: false, links: ["mesh"] },
    ]);
    expect(r.activeNodes).toBe(1);
    expect(r.totalNodes).toBe(2);
    expect(r.coveragePct).toBeGreaterThan(0);
    expect(r.linkMix.mesh).toBe(1);
  });

  it("counts Poka-Yoke violations as an index", () => {
    const idx = pokaYokeErrorIndex([
      { step: 1, label: "ok", violated: false },
      { step: 2, label: "fail", violated: true },
      { step: 3, label: "fail", violated: true },
      { step: 4, label: "ok", violated: false },
    ]);
    expect(idx).toEqual({ violations: 2, steps: 4, index: 50 });
  });

  it("builds BCP dashboard with gauges, mesh and fork", () => {
    const dash = buildPhysicalDashboard("demo12_resilience_saas_outage");
    expect(dash).toBeTruthy();
    expect(dash!.gauges.some((g) => g.id === "ttr")).toBe(true);
    expect(dash!.nodes.length).toBeGreaterThan(2);
    expect(dash!.forks[0]?.choices.length).toBe(3);
    expect(dash!.pokaYoke.steps).toBeGreaterThan(0);
  });

  it("applies a crisis choice to TTR without mutating the source", () => {
    const dash = buildPhysicalDashboard("demo12_resilience_saas_outage")!;
    const before = dash.ttr.hours;
    const choice = dash.forks[0]!.choices.find((c) => c.id === "p2p")!;
    const next = applyCrisisChoice(dash, choice);
    expect(dash.ttr.hours).toBe(before);
    expect(next.ttr.hours).toBeGreaterThan(before);
  });
});
