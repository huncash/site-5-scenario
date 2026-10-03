import { describe, expect, it } from "vitest";

import {
  KAHN_STOP_LOSS_ALERT_HU,
  kahnPersonalFlow,
  kahnSphereFromWorkspace,
} from "@/lib/kahnCrossTab";

describe("kahnCrossTab", () => {
  it("maps workspaces to spheres", () => {
    expect(kahnSphereFromWorkspace("personal")).toBe("personal");
    expect(kahnSphereFromWorkspace("Projekt1")).toBe("project");
    expect(kahnSphereFromWorkspace("Vállalkozás1")).toBe("core");
  });

  it("grows savings and dividend on optimistic path", () => {
    const real = kahnPersonalFlow("realistic");
    const opt = kahnPersonalFlow("optimistic");
    expect(opt.savingsDeltaHuf).toBeGreaterThan(0);
    expect(opt.dividendDeltaHuf).toBeGreaterThan(0);
    expect(opt.savingsFrameHuf).toBeGreaterThan(real.savingsFrameHuf);
    expect(opt.stopLossActive).toBe(false);
  });

  it("activates stop-loss and suspends funding on pessimistic path", () => {
    const pess = kahnPersonalFlow("pessimistic");
    expect(pess.stopLossActive).toBe(true);
    expect(pess.projectFundingSuspended).toBe(true);
    expect(pess.dividendDeltaHuf).toBeLessThan(0);
    expect(KAHN_STOP_LOSS_ALERT_HU).toMatch(/Stop-loss/);
  });
});
