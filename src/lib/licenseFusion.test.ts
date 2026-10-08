import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FUSION_ERROR_HU,
  FUSION_LOG_PREFIX,
  LICENSE_STORAGE_KEY,
  admitLicenseToken,
  allowRemoteMeshPayload,
  clearInstanceBind,
  evaluateLicenseWrite,
  lastLicenseFusionError,
  licenseFingerprint,
  readInstanceBind,
} from "@/lib/licenseFusion";
import { clearLicense, readLicense, writeLicense, type LicenseEntitlement } from "@/lib/license";

function lic(over: Partial<LicenseEntitlement> = {}): LicenseEntitlement {
  return {
    token: "SZC-ALPHA",
    tier: "starter",
    interval: "perpetual",
    status: "paid",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    addons: [],
    slotPacks: [],
    ...over,
  };
}

function installMemoryStorage() {
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  } as Storage;
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  return map;
}

describe("license fusion lock", () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    installMemoryStorage();
    spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("binds the first token to the local instance DB", () => {
    expect(evaluateLicenseWrite({ incomingToken: "SZC-ALPHA" }).ok).toBe(true);
    expect(writeLicense(lic({ token: "SZC-ALPHA", addons: ["case_plus_1"] }))).toBe(true);
    expect(readInstanceBind()?.token).toBe("SZC-ALPHA");
    expect(readInstanceBind()?.dbName).toBe("finance-vault");
    expect(readLicense()?.addons).toEqual(["case_plus_1"]);
  });

  it("allows same-token roster refresh (Case / Slot / Edge of THIS instance)", () => {
    writeLicense(lic({ token: "SZC-ALPHA", addons: ["case_plus_1"] }));
    expect(
      writeLicense(
        lic({
          token: "SZC-ALPHA",
          addons: ["case_plus_1", "edge_sensor"],
          slotPacks: ["slot_plus_1"],
        }),
      ),
    ).toBe(true);
    expect(readLicense()?.addons).toEqual(["case_plus_1", "edge_sensor"]);
    expect(readLicense()?.slotPacks).toEqual(["slot_plus_1"]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("rejects a second token and keeps the bound Case / Slot / Edge roster", () => {
    writeLicense(lic({ token: "SZC-ALPHA", addons: ["case_plus_1"], slotPacks: ["slot_plus_1"] }));
    const rejected = writeLicense(
      lic({
        token: "SZC-BETA",
        tier: "starter",
        addons: ["seat_plus_1", "edge_sensor"],
        slotPacks: ["slot_plus_5"],
      }),
    );
    expect(rejected).toBe(false);
    expect(readLicense()?.token).toBe("SZC-ALPHA");
    expect(readLicense()?.addons).toEqual(["case_plus_1"]);
    expect(readLicense()?.slotPacks).toEqual(["slot_plus_1"]);
    expect(lastLicenseFusionError()).toBe(FUSION_ERROR_HU);
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0]?.[0])).toBe(FUSION_LOG_PREFIX);
    expect(String(spy.mock.calls[0]?.[1])).toBe(FUSION_ERROR_HU);
  });

  it("still rejects fusion after clearLicense — the instance bind survives", () => {
    writeLicense(lic({ token: "SZC-ALPHA" }));
    clearLicense();
    expect(readLicense()).toBeNull();
    expect(readInstanceBind()?.token).toBe("SZC-ALPHA");
    expect(writeLicense(lic({ token: "SZC-BETA" }))).toBe(false);
    expect(lastLicenseFusionError()).toBe(FUSION_ERROR_HU);
  });

  it("admits a new token only after the instance bind is wiped", () => {
    writeLicense(lic({ token: "SZC-ALPHA" }));
    clearLicense();
    clearInstanceBind();
    expect(admitLicenseToken("SZC-BETA").ok).toBe(true);
    expect(writeLicense(lic({ token: "SZC-BETA" }))).toBe(true);
  });

  it("blocks remote mesh payload when license fingerprints differ", () => {
    writeLicense(lic({ token: "SZC-ALPHA" }));
    const local = licenseFingerprint("SZC-ALPHA");
    const foreign = licenseFingerprint("SZC-BETA");
    expect(local).not.toBe(foreign);
    expect(allowRemoteMeshPayload(foreign)).toBe(false);
    expect(allowRemoteMeshPayload(local)).toBe(true);
    expect(allowRemoteMeshPayload(undefined)).toBe(true);
  });

  it("ignores a poisoned local roster from a second token", () => {
    writeLicense(lic({ token: "SZC-ALPHA", addons: ["case_plus_1"] }));
    localStorage.setItem(
      LICENSE_STORAGE_KEY,
      JSON.stringify(lic({ token: "SZC-BETA", addons: ["edge_sensor", "seat_plus_1"] })),
    );
    expect(readInstanceBind()?.token).toBe("SZC-ALPHA");
    expect(readLicense()).toBeNull();
    expect(admitLicenseToken("SZC-BETA").ok).toBe(false);
    expect(lastLicenseFusionError()).toBe(FUSION_ERROR_HU);
  });
});
