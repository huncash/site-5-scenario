import { describe, expect, it } from "vitest";

import { ADVISOR_CASE_FRAME, usedLiveCaseCount } from "@/lib/advisorDesk";
import { formatCapacityFrame } from "@/lib/capacityHud";
import { buildAdvisorClientReport } from "@/lib/advisorClientReport";

describe("advisorDesk", () => {
  it("does not count DEMO profiles against the live frame", () => {
    expect(usedLiveCaseCount([{ name: "DEMO 11" }, { name: "DEMO 12" }])).toBe(1);
    expect(usedLiveCaseCount([{ name: "Acme Kft." }, { name: "DEMO 11" }])).toBe(1);
    expect(usedLiveCaseCount([{ name: "Acme Kft." }, { name: "Béta Bt." }])).toBe(2);
  });

  it("prints used / limit keret", () => {
    expect(formatCapacityFrame(1, ADVISOR_CASE_FRAME)).toBe("1 / 18 keret");
  });
});

describe("advisorClientReport", () => {
  it("packs runway, stress bands and risk room", () => {
    const report = buildAdvisorClientReport({
      profileName: "Acme Kft.",
      workspace: "personal",
      cash: { income: 1_000_000, expense: 400_000, balance: 600_000, lockedVat: 50_000 },
      financing: "organic",
      contract: null,
      generatedAt: "2026-10-09T00:00:00.000Z",
    });
    expect(report.kind).toBe("szcenario-advisor-client-report");
    expect(report.stress).toHaveLength(3);
    expect(report.riskRoom.runwayMonths).toBeGreaterThan(0);
    expect(report.riskRoom.minRunwayMonths).toBeGreaterThan(0);
    expect(report.cash.balance).toBe(600_000);
  });
});
