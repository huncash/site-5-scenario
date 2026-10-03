import { describe, expect, it } from "vitest";

import { SERIES_COLORS, seriesStroke } from "@/components/lean-viz/LeanCharts";

describe("SERIES_COLORS / seriesStroke", () => {
  it("keeps income, expense and saving strokes distinct and legend-aligned", () => {
    expect(seriesStroke("inc")).toBe(SERIES_COLORS.income);
    expect(seriesStroke("exp")).toBe(SERIES_COLORS.expense);
    expect(seriesStroke("sav")).toBe(SERIES_COLORS.saving);
    expect(seriesStroke("inc")).not.toBe(seriesStroke("exp"));
    expect(seriesStroke("inc")).not.toBe(seriesStroke("sav"));
    expect(seriesStroke("exp")).not.toBe(seriesStroke("sav"));
  });
});
