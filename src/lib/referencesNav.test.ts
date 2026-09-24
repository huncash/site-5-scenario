import { describe, expect, it, beforeEach } from "vitest";
import {
  consumeReferencesHighlightIds,
  consumeReferencesRestore,
  consumeReferencesReturn,
  isReferencesTab,
  pushReferencesReturn,
  stageReferencesRestore,
} from "./referencesNav";

function mockSessionStorage() {
  const map = new Map<string, string>();
  const api = {
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
  Object.defineProperty(globalThis, "sessionStorage", { value: api, configurable: true });
}

describe("referencesNav", () => {
  beforeEach(() => {
    mockSessionStorage();
  });

  it("recognizes tabs", () => {
    expect(isReferencesTab("partners")).toBe(true);
    expect(isReferencesTab("nope")).toBe(false);
  });

  it("round-trips return + restore + highlight", () => {
    pushReferencesReturn({
      previousView: "/",
      activeTab: "deals",
      activeWs: "middle",
      middleWs: "Vállalkozás1",
      pdcaMode: "DC",
      scrollPosition: 420,
      profile: "p1",
      workspace: "Vállalkozás1",
      highlightIds: ["a", "b"],
    });
    expect(consumeReferencesHighlightIds()).toEqual(["a", "b"]);
    const ret = consumeReferencesReturn();
    expect(ret?.scrollPosition).toBe(420);
    stageReferencesRestore(ret!);
    expect(consumeReferencesRestore()?.activeTab).toBe("deals");
  });
});
