import { describe, expect, it } from "vitest";

import {
  JIT_ADDON_BY_ID,
  JIT_ADDON_MIN_COMMITMENT_DAYS,
  jitExampleBundleHuf,
  slotPackPriceFromUnit,
} from "@/content/pricing/addons";
import { TIER_MONTHLY_HUF } from "@/content/pricing/tiers";
import { publicGrossFromNet, roundCommercialGrossHuf } from "@/content/pricing/vat";

describe("JIT add-on pricing", () => {
  it("uses realistic unit prices", () => {
    expect(JIT_ADDON_BY_ID.case_plus_1.priceHuf).toBe(4_900);
    expect(JIT_ADDON_BY_ID.slot_plus_1.priceHuf).toBe(2_900);
    expect(JIT_ADDON_BY_ID.seat_plus_1.priceHuf).toBe(6_900);
    expect(JIT_ADDON_BY_ID.guest_plus_1.priceHuf).toBe(1_200);
    expect(JIT_ADDON_MIN_COMMITMENT_DAYS).toBe(30);
  });

  it("+1 Case + 3 Slots = 13 600 Ft (~55% of Pro)", () => {
    expect(jitExampleBundleHuf()).toBe(13_600);
    const shareOfPro = jitExampleBundleHuf() / TIER_MONTHLY_HUF.pro;
    expect(shareOfPro).toBeGreaterThan(0.5);
    expect(shareOfPro).toBeLessThan(0.6);
  });

  it("slot packs are unit × qty (no deep discount)", () => {
    expect(slotPackPriceFromUnit(1)).toBe(2_900);
    expect(slotPackPriceFromUnit(3)).toBe(8_700);
    expect(slotPackPriceFromUnit(5)).toBe(14_500);
  });

  it("rounds public gross to nearest 10 Ft", () => {
    expect(roundCommercialGrossHuf(6_223)).toBe(6_220);
    expect(roundCommercialGrossHuf(3_683)).toBe(3_680);
    expect(roundCommercialGrossHuf(8_763)).toBe(8_760);
    expect(roundCommercialGrossHuf(1_524)).toBe(1_520);
    expect(publicGrossFromNet(4_900, 27)).toBe(6_220);
    expect(publicGrossFromNet(2_900, 27)).toBe(3_680);
    expect(publicGrossFromNet(6_900, 27)).toBe(8_760);
    expect(publicGrossFromNet(1_200, 27)).toBe(1_520);
  });
});
