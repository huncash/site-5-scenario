import { describe, expect, it } from "vitest";

import { bisztroDoorPreview, kpisNeverEmpty } from "./bisztroPreview";
import { expenseTypeLabel, wasteLabel, cycleLabel } from "./simpleLabels";
import { DEFAULT_LEAN_VIEW, readLeanView } from "./leanView";

describe("bisztro door preview", () => {
  it("returns filled runway, exit fee and monthly load", () => {
    const p = bisztroDoorPreview();
    expect(p.runwayMonths).toBeGreaterThan(0);
    expect(p.exitPenaltyHuf).toBe(0);
    expect(p.monthlyObligationHuf).toBeGreaterThan(0);
    expect(kpisNeverEmpty(null)).toBe(0);
    expect(kpisNeverEmpty(11)).toBe(11);
  });
});

describe("simple labels", () => {
  it("uses flexible spend in the default simple view", () => {
    expect(DEFAULT_LEAN_VIEW).toBe(false);
    expect(readLeanView()).toBe(false);
    expect(expenseTypeLabel("WANT", false, "hu")).toBe("Rugalmas kiadás");
    expect(expenseTypeLabel("WANT", true, "hu")).toBe("WANT");
    expect(wasteLabel(false, "hu")).toBe("Pazarlás");
    expect(wasteLabel(true, "hu")).toBe("MUDA");
    expect(cycleLabel(false, "hu")).toBe("Ciklus");
    expect(cycleLabel(true, "hu")).toBe("PDCA");
  });
});
