import { describe, expect, it } from "vitest";

import {
  buildStrategyWhatIf,
  isInflationSegment,
  isKahnForkSegment,
  isNewMarketSegment,
  isStrategySegment,
  KAHN_FORK,
  kahnDecisionTree,
  resolveKahnPlanPro,
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
      caseId: "demo19_strategy_new_line",
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
    expect(isStrategySegment("demo19_strategy_new_line")).toBe(true);
    expect(isStrategySegment("demo11_strategy_kahn_fork")).toBe(true);
    expect(isInflationSegment("demo20_strategy_input_inflation")).toBe(true);
    expect(isNewMarketSegment("demo21_strategy_new_market")).toBe(true);
    expect(isStrategySegment("demo1_multisite_operator")).toBe(false);
  });

  it("builds a Kahn case-study tree with financing, contracts and PRO branches", () => {
    expect(isKahnForkSegment("demo11_strategy_kahn_fork")).toBe(true);
    const tree = kahnDecisionTree();
    expect(tree.financing.map((n) => n.id)).toEqual(["loan", "organic"]);
    expect(tree.contracts.map((n) => n.id)).toEqual(["cheap", "flex"]);
    expect(tree.branches.map((b) => b.tone)).toEqual(["opt", "real", "pess"]);
    expect(tree.financing[0]!.amountHint).toContain("4");
    expect(tree.contracts[0]!.amountHint).toMatch(/850/);
    const kahn = STRATEGY_SEGMENTS.find((s) => s.id === "demo11_strategy_kahn_fork");
    expect(kahn?.baseRevenueNetHuf).toBe(8_400_000);
    expect(KAHN_FORK.loanDrawHuf).toBe(4_500_000);
    const w = buildStrategyWhatIf({
      caseId: "demo11_strategy_kahn_fork",
      baseIncome: 8_400_000,
      baseExpense: 6_500_000,
      horizonMonths: 12,
      now: new Date("2026-10-01"),
    });
    expect(w.inheritedFrom).toBeTruthy();
    expect(w.signals.map((s) => s.tone)).toEqual(["opt", "real", "pess"]);
    expect(w.signals[2]!.detail).toMatch(/850|kötbér/i);
    expect(w.kahnMetrics?.exitPenaltyHuf).toBe(KAHN_FORK.contractA.exitPenaltyHuf);
    expect(w.kahnMetrics?.decisionDays).toBe(60);
    expect(w.kahnMetrics?.minRunwayMonths).toBe(4);
    // 3. hónap (i=2): A-kötbér sokk — a havi pess nettó élesen gyengébb, mint az előző hónap
    const pessNet1 = w.chart[1]!.pessimistic - w.chart[0]!.pessimistic;
    const pessNet2 = w.chart[2]!.pessimistic - w.chart[1]!.pessimistic;
    expect(pessNet2).toBeLessThan(pessNet1 - KAHN_FORK.contractA.exitPenaltyHuf * 0.8);
  });

  it("live PLAN matrix: organic vs loan A vs loan B updates runway, penalty and monthly load", () => {
    const idle = resolveKahnPlanPro(null, null);
    expect(idle.find((c) => c.tone === "real")!.runwayMonths).toBe(11);
    expect(idle.every((c) => c.runwayMonths != null && c.exitPenaltyHuf != null && c.monthlyObligationHuf != null)).toBe(
      true,
    );

    const organic = resolveKahnPlanPro("organic", "cheap");
    expect(organic.every((c) => c.exitPenaltyHuf === 0)).toBe(true);
    expect(organic.find((c) => c.tone === "opt")!.monthlyObligationHuf).toBe(KAHN_FORK.organicMonthlyCommitHuf);

    const cheap = resolveKahnPlanPro("loan", "cheap");
    const flex = resolveKahnPlanPro("loan", "flex");
    const cheapPess = cheap.find((c) => c.tone === "pess")!;
    const flexPess = flex.find((c) => c.tone === "pess")!;
    expect(cheapPess.exitPenaltyHuf).toBe(KAHN_FORK.contractA.exitPenaltyHuf);
    expect(flexPess.exitPenaltyHuf).toBe(0);
    expect(cheapPess.runwayMonths).toBe(KAHN_FORK.minRunwayMonths);
    expect(flexPess.runwayMonths).toBeGreaterThan(cheapPess.runwayMonths!);
    expect(cheap.find((c) => c.tone === "opt")!.monthlyObligationHuf).toBe(KAHN_FORK.contractA.monthlyInterestHuf);
    expect(flex.find((c) => c.tone === "opt")!.monthlyObligationHuf).toBe(KAHN_FORK.contractB.monthlyInterestHuf);
  });
});
