import { describe, expect, it } from "vitest";

import {
  buildStrategyWhatIf,
  isKahnForkSegment,
  isStrategySegment,
  kahnDecisionTree,
  STRATEGY_SEGMENTS,
} from "./strategyCases";

describe("strategyCases", () => {
  it("keeps strategy PDCA cases on the same baseline revenue", () => {
    expect(STRATEGY_SEGMENTS).toHaveLength(4);
    const revenues = new Set(STRATEGY_SEGMENTS.map((s) => s.baseRevenueNetHuf));
    expect(revenues.size).toBe(1);
  });

  it("new-line optimistic dips before takeoff", () => {
    const w = buildStrategyWhatIf({
      caseId: "demo8_strategy_new_line",
      baseIncome: 8_400_000,
      baseExpense: 6_500_000,
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    });
    expect(w.chart[0]!.optimistic).toBeLessThan(w.chart[0]!.realistic);
    expect(w.chart[11]!.optimistic).toBeGreaterThan(w.chart[11]!.realistic);
    expect(w.signals.map((s) => s.tone)).toEqual(["opt", "real", "pess"]);
  });

  it("recognizes only strategy ids", () => {
    expect(isStrategySegment("demo8_strategy_new_line")).toBe(true);
    expect(isStrategySegment("demo19_strategy_kahn_fork")).toBe(true);
    expect(isStrategySegment("demo1_multisite_operator")).toBe(false);
  });

  it("builds a Kahn fork with three visual branches", () => {
    expect(isKahnForkSegment("demo19_strategy_kahn_fork")).toBe(true);
    const tree = kahnDecisionTree();
    expect(tree.branches.map((b) => b.tone)).toEqual(["opt", "real", "pess"]);
    const w = buildStrategyWhatIf({
      caseId: "demo19_strategy_kahn_fork",
      baseIncome: 8_400_000,
      baseExpense: 6_500_000,
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    });
    expect(w.inheritedFrom).toBeTruthy();
    expect(w.signals.map((s) => s.tone)).toEqual(["opt", "real", "pess"]);
  });
});
