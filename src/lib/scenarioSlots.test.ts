import { describe, expect, it } from "vitest";

import {
  addPermanentBonus,
  addPurchasedPack,
  checkScenarioSlotCapacity,
  emptySlotLedger,
  MAX_REFERRAL_GIFT_SLOTS,
  publicSlotPacksForTier,
  slotExpansionAllowed,
  slotPackNetForInterval,
  totalScenarioSlots,
} from "@/lib/scenarioSlots";
import { billingFingerprint, validateReferralAward } from "@/lib/referral";
import { yearlyPriceHuf } from "@/content/pricing/tiers";

describe("scenarioSlots", () => {
  it("excludes expansion packs on campus", () => {
    expect(slotExpansionAllowed("campus")).toBe(false);
    expect(publicSlotPacksForTier("campus")).toHaveLength(0);
    expect(publicSlotPacksForTier("pro")).toHaveLength(3);
  });

  it("sums base + packs + gift bonus (capped)", () => {
    let ledger = emptySlotLedger("starter");
    ledger = addPurchasedPack(ledger, "slot_plus_3");
    ledger = addPermanentBonus(ledger, 1);
    expect(totalScenarioSlots(ledger)).toBe(3 + 3 + 1);
    ledger = addPermanentBonus(ledger, MAX_REFERRAL_GIFT_SLOTS);
    expect(ledger.permanentBonus).toBe(MAX_REFERRAL_GIFT_SLOTS);
  });

  it("aligns add-on net with monthly/yearly billing cycle", () => {
    expect(slotPackNetForInterval(2_900, "monthly")).toBe(2_900);
    expect(slotPackNetForInterval(2_900, "yearly")).toBe(yearlyPriceHuf(2_900));
  });

  it("signals limit_reached for chooser UI", () => {
    const ledger = emptySlotLedger("starter");
    const r = checkScenarioSlotCapacity(3, ledger);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("limit_reached");
  });
});

describe("referral gift rules", () => {
  it("rejects same billing fingerprint", () => {
    const fp = billingFingerprint({ email: "a@b.hu", taxId: "HU123" });
    expect(
      validateReferralAward({
        referrerFingerprint: fp,
        refereeFingerprint: fp,
        paymentOk: true,
        bothSubscriptionsActive: true,
      }).ok,
    ).toBe(false);
  });

  it("requires successful payment and active pair", () => {
    expect(
      validateReferralAward({
        referrerFingerprint: "a",
        refereeFingerprint: "b",
        paymentOk: false,
        bothSubscriptionsActive: true,
      }),
    ).toEqual({ ok: false, reason: "payment_required" });
    expect(
      validateReferralAward({
        referrerFingerprint: "a",
        refereeFingerprint: "b",
        paymentOk: true,
        bothSubscriptionsActive: false,
      }),
    ).toEqual({ ok: false, reason: "subscription_inactive" });
  });

  it("enforces hard cap of 25 gift slots", () => {
    expect(
      validateReferralAward({
        referrerFingerprint: "a",
        refereeFingerprint: "b",
        paymentOk: true,
        bothSubscriptionsActive: true,
        referrerActiveGifts: MAX_REFERRAL_GIFT_SLOTS,
      }),
    ).toEqual({ ok: false, reason: "cap_reached_referrer" });
  });

  it("awards when payment ok, pair active, under cap", () => {
    expect(
      validateReferralAward({
        referrerFingerprint: billingFingerprint({ email: "a@x.hu" }),
        refereeFingerprint: billingFingerprint({ email: "b@x.hu" }),
        paymentOk: true,
        bothSubscriptionsActive: true,
        referrerActiveGifts: 0,
        refereeActiveGifts: 0,
      }),
    ).toEqual({ ok: true });
  });
});
