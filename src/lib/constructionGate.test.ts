import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_AUTH_FLAG,
  ADMIN_PROOF_KEY,
  CONSTRUCTION_GATE_ON,
  constructionGateOn,
  isConstructionUnlocked,
  lockConstructionGate,
  MAINTENANCE_MODE,
  tryConstructionUnlock,
} from "@/lib/constructionGate";

describe("constructionGate", () => {
  afterEach(() => {
    lockConstructionGate();
    vi.unstubAllEnvs();
  });

  it("is on in source so the weekend hold stays closed", () => {
    expect(MAINTENANCE_MODE).toBe(true);
    expect(CONSTRUCTION_GATE_ON).toBe(true);
    expect(constructionGateOn()).toBe(true);
  });

  it("turns off with a single env flag", () => {
    vi.stubEnv("VITE_MAINTENANCE_MODE", "0");
    expect(constructionGateOn()).toBe(false);
  });

  it("unlocks only with the admin key, never as a guest", async () => {
    expect(isConstructionUnlocked()).toBe(false);
    expect(await tryConstructionUnlock("")).toBe(false);
    expect(await tryConstructionUnlock("vendeg")).toBe(false);
    expect(isConstructionUnlocked()).toBe(false);
    expect(await tryConstructionUnlock("SzcenarioHetvege")).toBe(true);
    expect(isConstructionUnlocked()).toBe(true);
  });

  it("does not open from a bare is_admin_authenticated flag", () => {
    lockConstructionGate();
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ADMIN_AUTH_FLAG, "true");
      localStorage.removeItem(ADMIN_PROOF_KEY);
    }
    expect(isConstructionUnlocked()).toBe(false);
  });
});
