import { describe, expect, it } from "vitest";

import { recommendLeanVisualizations } from "@/lib/leanViz";

describe("recommendLeanVisualizations", () => {
  it("PLAN + szcenárió + cél → kis többszörös, vízesés, bullet", () => {
    const rec = recommendLeanVisualizations({
      pdcaMode: "PD",
      hasGoal: true,
      hasScenarios: true,
      categoryCount: 6,
      workspaceCount: 2,
      monthCount: 6,
      hasIncomeAndExpense: true,
    });
    const kinds = rec.map((r) => r.kind);
    expect(kinds).toContain("small_multiples");
    expect(kinds).toContain("waterfall");
    expect(kinds).toContain("bullet");
  });

  it("sok kategória → sankey vagy heatmap", () => {
    const rec = recommendLeanVisualizations({
      pdcaMode: "DC",
      hasIncomeAndExpense: true,
      categoryCount: 8,
      monthCount: 6,
      workspaceCount: 2,
    });
    expect(rec.some((r) => r.kind === "sankey" || r.kind === "heatmap")).toBe(true);
  });
});
