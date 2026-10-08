import { describe, expect, it } from "vitest";

import type { LicenseEntitlement } from "@/lib/license";
import { labBerryClickKind, labEyeOpen, labLicenseLed, labModuleFunnelHref } from "@/lib/labBerrySignals";

function lic(partial: Partial<LicenseEntitlement> = {}): LicenseEntitlement {
  return {
    token: "t",
    tier: "starter",
    interval: "perpetual",
    status: "paid",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  };
}

describe("labBerrySignals", () => {
  it("splits license LED from dashboard eye", () => {
    expect(labLicenseLed(true)).toBe("green");
    expect(labLicenseLed(false)).toBe("red");
    expect(labEyeOpen({ entitled: true, pipedToDashboard: true })).toBe(true);
    expect(labEyeOpen({ entitled: true, pipedToDashboard: false })).toBe(false);
    expect(labEyeOpen({ entitled: false, pipedToDashboard: true })).toBe(false);
  });

  it("pins an entitled berry and sends a locked berry to its funnel", () => {
    expect(labBerryClickKind(true)).toBe("pin");
    expect(labBerryClickKind(false)).toBe("funnel");
    const starter = lic({ tier: "starter" });
    expect(labModuleFunnelHref("labs-baseline", { license: starter, planId: "starter" })).toBe("");
    expect(labModuleFunnelHref("labs-edge", { license: starter, planId: "starter" })).toContain("addon=edge_sensor");
    expect(labModuleFunnelHref("labs-szumma", { license: lic({ tier: "pro" }), planId: "pro" })).toContain(
      "tier=expert",
    );
  });
});
