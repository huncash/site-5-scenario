import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  claimGuestSession,
  ensureGuestSlotPool,
  generateGuestCodeForSlot,
  generateNextGuestCode,
  guestCodeSlotsForTier,
  guestKickMessage,
  guestWatermarkLabel,
  parseGuestCode,
  revokeGuestCode,
} from "@/lib/auth/guestSlots";

function installMemoryStorage() {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
    key: (i) => Array.from(map.keys())[i] ?? null,
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
}

describe("guestSlots", () => {
  beforeEach(() => {
    installMemoryStorage();
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = (i * 17 + 3) % 256;
        return arr;
      },
      randomUUID: () => "11111111-1111-1111-1111-111111111111",
      subtle: globalThis.crypto.subtle,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("tier pool sizes: Basic 1 / Pro 5 / Enterprise 20", () => {
    expect(guestCodeSlotsForTier("starter")).toBe(1);
    expect(guestCodeSlotsForTier("pro")).toBe(5);
    expect(guestCodeSlotsForTier("expert")).toBe(20);
    expect(guestCodeSlotsForTier("demo")).toBe(0);
    expect(ensureGuestSlotPool("pro")).toHaveLength(5);
  });

  it("generates GUEST-XXXX-NN codes and revokes per slot", () => {
    const a = generateGuestCodeForSlot(1, "starter");
    expect(a.ok).toBe(true);
    if (!a.ok) return;
    expect(parseGuestCode(a.slot.code!)).toMatchObject({ index: 1 });
    expect(a.slot.code!.startsWith("GUEST-")).toBe(true);

    const full = generateNextGuestCode("starter");
    expect(full.ok).toBe(false);

    expect(revokeGuestCode(a.slot.code!)).toBe(true);
    const again = generateGuestCodeForSlot(1, "starter");
    expect(again.ok).toBe(true);
  });

  it("claims displace prior session and formats watermark / kick copy", async () => {
    const gen = generateGuestCodeForSlot(1, "starter");
    expect(gen.ok).toBe(true);
    if (!gen.ok) return;

    const first = await claimGuestSession({ code: gen.slot.code!, sessionId: "sess-a" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(guestWatermarkLabel(first.claim)).toMatch(/^KÓD: #GUEST-[A-Z0-9]{4}-01$/);

    const second = await claimGuestSession({ code: gen.slot.code!, sessionId: "sess-b" });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.displaced).toBe(true);
    expect(guestKickMessage(1)).toContain("#01");
  });
});
