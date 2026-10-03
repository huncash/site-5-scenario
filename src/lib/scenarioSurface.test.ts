import { describe, expect, it } from "vitest";

import { inheritMasterBaseline } from "@/lib/masterBaseline";
import { baselineForSegment, scenarioSurface } from "@/lib/scenarioSurface";

describe("scenarioSurface", () => {
  it("keeps finance modules on hospitality and strategy", () => {
    expect(scenarioSurface("demo1_multisite_operator").showFinanceModules).toBe(true);
    expect(scenarioSurface("demo8_strategy_new_line").showFinanceModules).toBe(true);
    expect(scenarioSurface("demo8_strategy_new_line").inheritMasterBaseline).toBe(true);
  });

  it("hides finance on BCP / physical education", () => {
    expect(scenarioSurface("demo11_resilience_saas_outage")).toMatchObject({
      showFinanceModules: false,
      showPhysicalKpis: true,
    });
    expect(scenarioSurface("demo17_edu_campus_energy")).toMatchObject({
      showFinanceModules: false,
      showPhysicalKpis: true,
    });
    expect(scenarioSurface("demo16_edu_lean_vsm")).toMatchObject({
      showFinanceModules: false,
      showLean: true,
    });
  });

  it("keeps finance on startup cash-flow training", () => {
    expect(scenarioSurface("demo15_edu_startup_cashflow").showFinanceModules).toBe(true);
  });
});

describe("Master Baseline inherit", () => {
  it("copies org size and resources, marks inheritedFrom", () => {
    const parent = baselineForSegment("demo8_strategy_new_line");
    const child = inheritMasterBaseline(parent, "Új termékvonal");
    expect(child.headcount).toBe(parent.headcount);
    expect(child.sizeHint).toBe(parent.sizeHint);
    expect(child.startingResources).toEqual(parent.startingResources);
    expect(child.inheritedFrom).toBe(parent.orgLabel);
  });

  it("household BCP does not carry monthly revenue", () => {
    const ctx = baselineForSegment("demo13_resilience_home_blackout");
    expect(ctx.orgKind).toBe("household");
    expect(ctx.headcount).toBe(4);
    expect(ctx.monthlyRevenueNet).toBeNull();
    expect(ctx.startingResources.autonomyHours).toBe(72);
  });
});
