import { describe, expect, it } from "vitest";

import { JIT_ADDON_PRICES, PLANS_CONFIG } from "@/config/plans";
import {
  BUNDLE_LOCK_ADDON_IDS,
  bundleLockSetNet,
  bundleLockUpgradeCart,
  evaluateBundleLock,
  evaluateBundleLockFromCart,
  upgradeGapHuf,
} from "@/lib/bundleLock";

describe("bundle lock", () => {
  it("keeps Case+Slot+Seat+Edge at the listed perpetual prices", () => {
    expect(JIT_ADDON_PRICES.case_plus_1).toBe(49_000);
    expect(JIT_ADDON_PRICES.slot_plus_1).toBe(49_000);
    expect(JIT_ADDON_PRICES.seat_plus_1).toBe(79_000);
    expect(JIT_ADDON_PRICES.edge_sensor).toBe(99_000);
    expect(bundleLockSetNet()).toBe(276_000);
    expect(BUNDLE_LOCK_ADDON_IDS).toEqual(["case_plus_1", "slot_plus_1", "seat_plus_1", "edge_sensor"]);
  });

  it("makes one lock-set on Basic at least as expensive as stepping to Pro", () => {
    expect(upgradeGapHuf("starter")).toBe(200_000);
    expect(bundleLockSetNet()).toBeGreaterThanOrEqual(upgradeGapHuf("starter"));
    const oneSet = evaluateBundleLock({
      planId: "starter",
      lines: BUNDLE_LOCK_ADDON_IDS.map((id) => ({ id, qty: 1 })),
    });
    expect(oneSet.stayNet).toBe(199_000 + 276_000);
    expect(oneSet.upgradeNet).toBe(PLANS_CONFIG.pro.priceHuf);
    expect(oneSet.tripped).toBe(true);
    expect(oneSet.nextTier).toBe("pro");
    expect(oneSet.saveHuf).toBe(76_000);
  });

  it("does not trip a small Basic cart below the Pro list price", () => {
    const small = evaluateBundleLockFromCart({
      planId: "starter",
      addon: "seat_plus_1",
    });
    expect(small.tripped).toBe(false);
    expect(small.stayNet).toBe(199_000 + 79_000);
  });

  it("trips Basic + 5 extra Slots because stay beats Pro list", () => {
    const pack = evaluateBundleLockFromCart({
      planId: "starter",
      slotPack: "slot_plus_5",
    });
    expect(pack.addonNet).toBe(245_000);
    expect(pack.stayNet).toBe(444_000);
    expect(pack.tripped).toBe(true);
    expect(pack.nextTier).toBe("pro");
  });

  it("ignores guest accounts in the lock basket", () => {
    const guests = evaluateBundleLockFromCart({
      planId: "starter",
      addon: "guest_plus_1",
      ownedAddons: ["guest_plus_1", "guest_plus_1"],
    });
    expect(guests.addonNet).toBe(0);
    expect(guests.tripped).toBe(false);
  });

  it("trips Pro when stacked extras reach Enterprise list, and keeps Edge after upgrade", () => {
    const stacked = evaluateBundleLockFromCart({
      planId: "pro",
      addon: "edge_sensor",
      slotPack: "slot_plus_5",
      ownedAddons: ["case_plus_1", "seat_plus_1"],
    });
    expect(stacked.addonNet).toBe(49_000 + 245_000 + 79_000 + 99_000);
    expect(stacked.stayNet).toBeGreaterThanOrEqual(PLANS_CONFIG.expert.priceHuf);
    expect(stacked.tripped).toBe(true);
    expect(stacked.nextTier).toBe("expert");
    expect(bundleLockUpgradeCart({ addon: "edge_sensor", slotPack: "slot_plus_5" })).toEqual({
      addon: "edge_sensor",
    });
  });

  it("does not lock Enterprise — there is no higher public pack", () => {
    const ent = evaluateBundleLockFromCart({
      planId: "expert",
      slotPack: "slot_plus_5",
      addon: "edge_sensor",
    });
    expect(ent.tripped).toBe(false);
    expect(ent.nextTier).toBeNull();
  });

  it("does not lock Campus or local — they are outside the public ladder", () => {
    expect(evaluateBundleLockFromCart({ planId: "campus", slotPack: "slot_plus_5" }).tripped).toBe(false);
    expect(evaluateBundleLockFromCart({ planId: "local", addon: "edge_sensor" }).tripped).toBe(false);
  });
});
