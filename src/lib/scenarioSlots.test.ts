import { describe, expect, it } from "vitest";

import {
  addPermanentBonus,
  addPurchasedPack,
  checkScenarioSlotCapacity,
  emptySlotLedger,
  publicSlotPacksForTier,
  slotExpansionAllowed,
  totalScenarioSlots,
} from "@/lib/scenarioSlots";
import { billingFingerprint, validateReferralAward } from "@/lib/referral";

describe("scenarioSlots", () => {
  it("excludes expansion packs on campus", () => {
    expect(slotExpansionAllowed("campus")).toBe(false);
    expect(publicSlotPacksForTier("campus")).toHaveLength(0);
    expect(publicSlotPacksForTier("pro")).toHaveLength(3);
  });

  it("sums base + packs + permanent bonus", () => {
    let ledger = emptySlotLedger("starter");
    ledger = addPurchasedPack(ledger, "slot_plus_3");
    ledger = addPermanentBonus(ledger, 1);
    expect(totalScenarioSlots(ledger)).toBe(3 + 3 + 1);
  });

  it("signals limit_reached for chooser UI", () => {
    const ledger = emptySlotLedger("starter");
    const r = checkScenarioSlotCapacity(3, ledger);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("limit_reached");
  });
});

describe("referral poka-yoke", () => {
  it("rejects same billing fingerprint", () => {
    const fp = billingFingerprint({ email: "a@b.hu", taxId: "HU123" });
    expect(
      validateReferralAward({
        referrerFingerprint: fp,
        refereeFingerprint: fp,
        paymentOk: true,
      }).ok,
    ).toBe(false);
  });

  it("requires successful payment", () => {
    expect(
      validateReferralAward({
        referrerFingerprint: "a",
        refereeFingerprint: "b",
        paymentOk: false,
      }),
    ).toEqual({ ok: false, reason: "payment_required" });
  });

  it("awards when payment ok and fingerprints differ", () => {
    expect(
      validateReferralAward({
        referrerFingerprint: billingFingerprint({ email: "a@x.hu" }),
        refereeFingerprint: billingFingerprint({ email: "b@x.hu" }),
        paymentOk: true,
      }),
    ).toEqual({ ok: true });
  });
});
