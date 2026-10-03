import { describe, expect, it } from "vitest";

import {
  buildStrategyWhatIf,
  isKahnForkSegment,
  isStrategySegment,
  KAHN_FORK,
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

  it("builds a Kahn case-study tree with financing, contracts and PRO branches", () => {
    expect(isKahnForkSegment("demo19_strategy_kahn_fork")).toBe(true);
    const tree = kahnDecisionTree();
    expect(tree.financing.map((n) => n.id)).toEqual(["loan", "organic"]);
    expect(tree.contracts.map((n) => n.id)).toEqual(["cheap", "flex"]);
    expect(tree.branches.map((b) => b.tone)).toEqual(["opt", "real", "pess"]);
    expect(tree.financing[0]!.amountHint).toContain("4");
    expect(tree.contracts[0]!.amountHint).toMatch(/850/);
    const kahn = STRATEGY_SEGMENTS.find((s) => s.id === "demo19_strategy_kahn_fork");
    expect(kahn?.baseRevenueNetHuf).toBe(8_400_000);
    expect(KAHN_FORK.loanDrawHuf).toBe(4_500_000);
    const w = buildStrategyWhatIf({
      caseId: "demo19_strategy_kahn_fork",
      baseIncome: 8_400_000,
      baseExpense: 6_500_000,
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    });
    expect(w.inheritedFrom).toBeTruthy();
    expect(w.signals.map((s) => s.tone)).toEqual(["opt", "real", "pess"]);
    expect(w.signals[2]!.detail).toMatch(/850|kötbér/i);
    // 3. hónap (i=2): A-kötbér sokk — a havi pess nettó élesen gyengébb, mint az előző hónap
    const pessNet1 = w.chart[1]!.pessimistic - w.chart[0]!.pessimistic;
    const pessNet2 = w.chart[2]!.pessimistic - w.chart[1]!.pessimistic;
    expect(pessNet2).toBeLessThan(pessNet1 - KAHN_FORK.contractA.exitPenaltyHuf * 0.8);
  });
});
