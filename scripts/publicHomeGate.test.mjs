import { describe, expect, it } from "vitest";
import {
  publicHomeGateEnabled,
  shouldServePublicHomeGate,
  PUBLIC_HOME_GATE_HTML,
} from "./publicHomeGate.mjs";

describe("publicHomeGate", () => {
  it("is on by default and off with 0", () => {
    expect(publicHomeGateEnabled({})).toBe(true);
    expect(publicHomeGateEnabled({ PUBLIC_HOME_GATE: "0" })).toBe(false);
  });

  it("serves the apex home only", () => {
    const env = { PUBLIC_HOME_GATE: "1" };
    expect(shouldServePublicHomeGate("/", "szcenario.hu", env)).toBe(true);
    expect(shouldServePublicHomeGate("/pricing", "szcenario.hu", env)).toBe(false);
    expect(shouldServePublicHomeGate("/", "app.szcenario.hu", env)).toBe(false);
    expect(shouldServePublicHomeGate("/", "bill.szcenario.hu", env)).toBe(false);
    expect(shouldServePublicHomeGate("/", "support.szcenario.hu", env)).toBe(false);
  });

  it("is a minimal construction page", () => {
    expect(PUBLIC_HOME_GATE_HTML).toContain("szcenario.hu");
    expect(PUBLIC_HOME_GATE_HTML).toContain("Fejlesztés alatt");
    expect(PUBLIC_HOME_GATE_HTML).not.toMatch(/P-R-O|Barion|WANT/i);
  });
});
