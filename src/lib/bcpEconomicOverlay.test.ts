import { describe, expect, it } from "vitest";

import {
  bcpWriteAllowed,
  buildEconomicReadSnapshot,
  isEngineRoomReadOnly,
  resolveBcpViewMode,
} from "@/lib/bcpEconomicOverlay";

describe("bcpEconomicOverlay", () => {
  it("resolves isolated / overlay / engine-room and keeps a readable reserve depth", () => {
    expect(resolveBcpViewMode(false, false)).toBe("isolated");
    expect(resolveBcpViewMode(true, false)).toBe("overlay");
    expect(resolveBcpViewMode(true, true)).toBe("engine-room");
    const snap = buildEconomicReadSnapshot({
      live: { cashHuf: 2_000_000, lockedHuf: 400_000, opexHuf: 200_000, runwayMonths: 8 },
    });
    expect(snap.reserveDepthHuf).toBe(1_600_000);
    expect(snap.costMix.length).toBeGreaterThan(0);
    expect(snap.costMix.reduce((n, r) => n + r.share, 0)).toBeCloseTo(1, 5);
    expect(bcpWriteAllowed("isolated")).toBe(true);
    expect(bcpWriteAllowed("overlay")).toBe(false);
    expect(bcpWriteAllowed("engine-room")).toBe(false);
    expect(isEngineRoomReadOnly("engine-room")).toBe(true);
  });
});
