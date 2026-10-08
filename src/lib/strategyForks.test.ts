import { beforeEach, describe, expect, it } from "vitest";

import {
  readStrategyPlanPath,
  resetStrategyPlanPath,
  setStrategyPrimary,
  setStrategySecondary,
} from "./strategyPlanPath";
import {
  resolveInflationPlanPro,
  resolveMarketPlanPro,
  resolveNewLinePlanPro,
  strategyForkKindOf,
  STRATEGY_FORK_CONST,
} from "./strategyForks";

describe("strategyPlanPath + forks", () => {
  beforeEach(() => {
    resetStrategyPlanPath();
  });

  it("inflation: lock vs float+pass vs float+cut updates runway, margin and extra COGS", () => {
    const idle = resolveInflationPlanPro(null, null);
    expect(idle.find((c) => c.tone === "pess")!.runwayMonths).toBe(8);
    expect(idle.every((c) => c.runwayMonths != null && c.exitPenaltyHuf != null && c.monthlyObligationHuf != null)).toBe(
      true,
    );

    const lock = resolveInflationPlanPro("lock", "pass");
    expect(lock.every((c) => c.monthlyObligationHuf === 0)).toBe(true);
    expect(lock.find((c) => c.tone === "pess")!.runwayMonths).toBe(8);

    setStrategyPrimary("demo20_strategy_input_inflation", "float");
    expect(readStrategyPlanPath("demo20_strategy_input_inflation").secondary).toBeNull();

    const pass = resolveInflationPlanPro("float", "pass");
    const cut = resolveInflationPlanPro("float", "cut");
    expect(pass.find((c) => c.tone === "real")!.monthlyObligationHuf).toBe(STRATEGY_FORK_CONST.passCogs);
    expect(cut.find((c) => c.tone === "pess")!.monthlyObligationHuf).toBe(0);
    expect(pass.find((c) => c.tone === "pess")!.runwayMonths).toBeLessThan(
      lock.find((c) => c.tone === "pess")!.runwayMonths!,
    );
  });

  it("market: immediate vs staged+core vs staged+exit updates entry and monthly drain", () => {
    const now = resolveMarketPlanPro("now", "core");
    expect(now.every((c) => c.exitPenaltyHuf === STRATEGY_FORK_CONST.entryCost)).toBe(true);
    expect(now.every((c) => c.monthlyObligationHuf === 0)).toBe(true);

    setStrategyPrimary("demo21_strategy_new_market", "staged");
    setStrategySecondary("demo21_strategy_new_market", "core");
    expect(readStrategyPlanPath("demo21_strategy_new_market")).toEqual({
      primary: "staged",
      secondary: "core",
    });

    const core = resolveMarketPlanPro("staged", "core");
    const exit = resolveMarketPlanPro("staged", "exit");
    expect(core.find((c) => c.tone === "real")!.monthlyObligationHuf).toBe(STRATEGY_FORK_CONST.coreDrain);
    expect(exit.every((c) => c.monthlyObligationHuf === 0)).toBe(true);
    expect(exit.find((c) => c.tone === "pess")!.runwayMonths).toBeGreaterThan(
      core.find((c) => c.tone === "pess")!.runwayMonths!,
    );
  });

  it("newline: planned vs burst+halt vs burst+push updates runway and stock bind", () => {
    expect(strategyForkKindOf("demo19_strategy_new_line")).toBe("newline");
    const planned = resolveNewLinePlanPro("planned", "halt");
    expect(planned.every((c) => c.monthlyObligationHuf === 0)).toBe(true);
    expect(planned.find((c) => c.tone === "pess")!.runwayMonths).toBe(8);

    setStrategyPrimary("demo19_strategy_new_line", "burst");
    expect(readStrategyPlanPath("demo19_strategy_new_line").secondary).toBeNull();

    const halt = resolveNewLinePlanPro("burst", "halt");
    const push = resolveNewLinePlanPro("burst", "push");
    expect(halt.find((c) => c.tone === "pess")!.runwayMonths).toBeGreaterThan(
      push.find((c) => c.tone === "pess")!.runwayMonths!,
    );
    expect(push.find((c) => c.tone === "pess")!.exitPenaltyHuf).toBe(STRATEGY_FORK_CONST.linePush);
  });
});
