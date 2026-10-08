import { afterEach, describe, expect, it } from "vitest";

import { ACCESS_ROLE } from "@/lib/accessRole";
import { readCapacityHud } from "@/lib/capacityHud";
import {
  canCrossEngineShare,
  canExportEducationPack,
  demoCaseEnginesActive,
  engineAddonQuotaDelta,
  grantAllExtraEngines,
  grantEngineOnLicense,
  licensedEngines,
  markDemoCaseEngines,
  quotasUnchangedByEngine,
} from "@/lib/engineFrames";
import type { LicenseEntitlement } from "@/lib/license";
import { emptySlotLedger, totalScenarioSlots } from "@/lib/scenarioSlots";

function lic(over: Partial<LicenseEntitlement> = {}): LicenseEntitlement {
  return {
    token: "SZC-FRAME",
    tier: "starter",
    interval: "perpetual",
    status: "paid",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    addons: [],
    slotPacks: [],
    ...over,
  };
}

describe("engineFrames", () => {
  afterEach(() => {
    markDemoCaseEngines(false);
  });

  it("keeps economic on the license and does not add quota when granting education / BCP", () => {
    const before = lic();
    const afterEdu = grantEngineOnLicense(before, "education");
    const afterBcp = grantEngineOnLicense(afterEdu, "resilience");
    expect(licensedEngines(before)).toEqual(["economic"]);
    markDemoCaseEngines(true);
    expect(demoCaseEnginesActive()).toBe(true);
    expect(licensedEngines(before)).toEqual(["economic", "education", "resilience"]);
    markDemoCaseEngines(false);
    expect(licensedEngines(before)).toEqual(["economic"]);
    expect(licensedEngines(afterBcp)).toEqual(["economic", "education", "resilience"]);
    expect(licensedEngines(grantAllExtraEngines(before))).toEqual([
      "economic",
      "education",
      "resilience",
    ]);
    expect(engineAddonQuotaDelta()).toEqual({ cases: 0, slots: 0, seats: 0, guests: 0 });
    expect(totalScenarioSlots(emptySlotLedger("starter"))).toBe(
      totalScenarioSlots(emptySlotLedger("starter")),
    );
    const hudA = readCapacityHud({ profileCount: 1, workspaceIds: ["personal"] });
    const hudB = readCapacityHud({ profileCount: 1, workspaceIds: ["personal"] });
    expect(quotasUnchangedByEngine(hudA, hudB)).toBe(true);
  });

  it("allows anonymized economic→education and read overlay economic→BCP, never reverse raw", () => {
    expect(
      canCrossEngineShare({ from: "economic", to: "education", channel: "anonymized", sameLicense: true }).ok,
    ).toBe(true);
    expect(
      canCrossEngineShare({ from: "economic", to: "education", channel: "raw", sameLicense: true }).ok,
    ).toBe(false);
    expect(
      canCrossEngineShare({ from: "economic", to: "resilience", channel: "read_overlay", sameLicense: true }).ok,
    ).toBe(true);
    expect(
      canCrossEngineShare({ from: "education", to: "economic", channel: "raw", sameLicense: true }).ok,
    ).toBe(false);
    expect(
      canCrossEngineShare({ from: "resilience", to: "economic", channel: "raw", sameLicense: true }).ok,
    ).toBe(false);
    expect(
      canCrossEngineShare({
        from: "economic",
        to: "resilience",
        channel: "read_overlay",
        sameLicense: false,
      }).ok,
    ).toBe(false);
    expect(
      canCrossEngineShare({
        from: "economic",
        to: "resilience",
        channel: "read_overlay",
        sameLicense: true,
        role: ACCESS_ROLE.VIEWER_READONLY,
      }).ok,
    ).toBe(false);
    expect(canExportEducationPack({ anonOn: false }).ok).toBe(false);
    expect(canExportEducationPack({ anonOn: true }).ok).toBe(true);
    expect(
      canExportEducationPack({ anonOn: true, role: ACCESS_ROLE.VIEWER_READONLY }).ok,
    ).toBe(false);
  });
});
