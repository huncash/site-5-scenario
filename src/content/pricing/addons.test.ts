import { describe, expect, it } from "vitest";

import {
  JIT_ADDON_BY_ID,
  JIT_ADDON_MIN_COMMITMENT_DAYS,
  jitExampleBundleHuf,
  slotPackPriceFromUnit,
} from "@/content/pricing/addons";
import { TIER_MONTHLY_HUF } from "@/content/pricing/tiers";
import { publicGrossFromNet, roundCommercialGrossHuf } from "@/content/pricing/vat";

describe("JIT perpetual add-on pricing", () => {
  it("uses perpetual module prices", () => {
    expect(JIT_ADDON_BY_ID.case_plus_1.priceHuf).toBe(49_000);
    expect(JIT_ADDON_BY_ID.case_plus_1.public).toBe(true);
    expect(JIT_ADDON_BY_ID.slot_plus_1.priceHuf).toBe(49_000);
    expect(JIT_ADDON_BY_ID.seat_plus_1.priceHuf).toBe(79_000);
    expect(JIT_ADDON_MIN_COMMITMENT_DAYS).toBe(0);
  });

  it("Slot + Seat bundle is below Pro license list price", () => {
    expect(jitExampleBundleHuf()).toBe(128_000);
    expect(jitExampleBundleHuf()).toBeLessThan(TIER_MONTHLY_HUF.pro);
  });

  it("slot packs are unit × qty", () => {
    expect(slotPackPriceFromUnit(1)).toBe(49_000);
    expect(slotPackPriceFromUnit(3)).toBe(147_000);
    expect(slotPackPriceFromUnit(5)).toBe(245_000);
  });

  it("rounds public gross to nearest 10 Ft", () => {
    expect(roundCommercialGrossHuf(6_223)).toBe(6_220);
    expect(publicGrossFromNet(49_000, 27)).toBe(roundCommercialGrossHuf(49_000 * 1.27));
    expect(publicGrossFromNet(79_000, 27)).toBe(roundCommercialGrossHuf(79_000 * 1.27));
  });
});
