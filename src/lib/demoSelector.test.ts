import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SCENARIO_DOOR_STEP_KEY } from "@/lib/doorStep";
import { HOME_MODE_KEY } from "@/lib/siteSurface";
import { preferDemoSelectorHome } from "@/lib/demoSelector";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, String(v));
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe("preferDemoSelectorHome", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", memoryStorage());
    vi.stubGlobal("localStorage", memoryStorage());
    vi.stubGlobal("window", {
      localStorage: globalThis.localStorage,
      dispatchEvent: () => true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forces the hierarchical demo picker, not a remembered dashboard case", () => {
    sessionStorage.setItem(SCENARIO_DOOR_STEP_KEY, "hospitality");
    localStorage.setItem(HOME_MODE_KEY, "dashboard");

    preferDemoSelectorHome();

    expect(sessionStorage.getItem(SCENARIO_DOOR_STEP_KEY)).toBe("type");
    expect(localStorage.getItem(HOME_MODE_KEY)).toBeNull();
  });
});
