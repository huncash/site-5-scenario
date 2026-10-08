import { beforeEach, describe, expect, it, vi } from "vitest";

import { isDashboardLabId } from "@/lib/dashboardLabs";
import {
  LAB_FOCUS_SESSION,
  SZUMMA_ENTER_SESSION,
  applyLabFocus,
  consumeLabFocus,
  consumeSzummaEnter,
  requestLabFocus,
  requestSzummaEnter,
} from "@/lib/labFocus";

const mem = new Map<string, string>();
const sessionStub = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
};

beforeEach(() => {
  mem.clear();
  (globalThis as unknown as { sessionStorage: typeof sessionStub }).sessionStorage = sessionStub;
  (globalThis as unknown as { window: object }).window = {
    sessionStorage: sessionStub,
    dispatchEvent: () => true,
  };
});

describe("labFocus", () => {
  it("stores and consumes a dashboard lab focus id", () => {
    expect(isDashboardLabId("labs-edge")).toBe(true);
    expect(isDashboardLabId("labs-baseline")).toBe(true);
    requestLabFocus("labs-edge");
    expect(sessionStub.getItem(LAB_FOCUS_SESSION)).toBe("labs-edge");
    expect(consumeLabFocus()).toBe("labs-edge");
    expect(consumeLabFocus()).toBe(null);
  });

  it("dispatches highlight mode on the focus event", () => {
    const events: CustomEvent[] = [];
    (globalThis as unknown as { window: { dispatchEvent: (e: Event) => boolean } }).window.dispatchEvent = (e) => {
      events.push(e as CustomEvent);
      return true;
    };
    requestLabFocus("labs-edge", "highlight");
    expect(events[0]?.detail).toEqual({ id: "labs-edge", mode: "highlight" });
    expect(sessionStub.getItem(LAB_FOCUS_SESSION)).toBe(null);
  });

  it("highlights without scrolling; jump scrolls", () => {
    const scroll = vi.fn();
    const host = { scrollIntoView: scroll };
    const prev = (globalThis as { document?: unknown }).document;
    (globalThis as { document: { querySelector: (sel: string) => unknown } }).document = {
      querySelector: (sel) => (sel === '[data-lab-section="labs-edge"]' ? host : null),
    };
    try {
      expect(applyLabFocus("labs-edge", "highlight")).toBe(true);
      expect(scroll).not.toHaveBeenCalled();
      expect(applyLabFocus("labs-edge", "jump")).toBe(true);
      expect(scroll).toHaveBeenCalled();
    } finally {
      if (prev === undefined) delete (globalThis as { document?: unknown }).document;
      else (globalThis as { document: unknown }).document = prev;
    }
  });

  it("stores and consumes a szumma enter flag", () => {
    requestSzummaEnter();
    expect(sessionStub.getItem(SZUMMA_ENTER_SESSION)).toBe("1");
    expect(consumeSzummaEnter()).toBe(true);
    expect(consumeSzummaEnter()).toBe(false);
  });
});
