import { describe, expect, it } from "vitest";

import { buildEconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import { BCP_BEST_PRACTICE, compareEconomicToBcp } from "@/lib/bcpPracticeDelta";

describe("bcp practice delta", () => {
  it("ignores matching headcount and flags unit-divergent BCP fields", () => {
    const snap = buildEconomicReadSnapshot({});
    const { ignored, delta } = compareEconomicToBcp(snap);
    expect(ignored.map((r) => r.id)).toContain("headcount");
    expect(delta.map((r) => r.id)).toEqual(
      expect.arrayContaining(["runway", "reserve", "opex", "ttr", "water", "food", "mesh"]),
    );
    expect(delta.find((r) => r.id === "runway")?.bcpUnit).toBe("óra");
    expect(delta.find((r) => r.id === "runway")?.economicUnit).toBe("hó");
    expect(delta.every((r) => r.kind === "delta")).toBe(true);
    expect(BCP_BEST_PRACTICE.autonomyHours).toBe(72);
    expect(BCP_BEST_PRACTICE.ttrTargetHours).toBe(4);
  });
});
