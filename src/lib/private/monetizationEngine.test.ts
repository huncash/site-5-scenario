import { describe, expect, it } from "vitest";

import { loyaltyFeesFromYear1Huf } from "@/config/plans";
import { splitEqualParts } from "@/lib/installmentPlan";
import {
  MARKET_CONTROL_MATRIX,
  OURS_BASIC_Y2_HUF,
  OURS_BASIC_Y3_HUF,
  OURS_ENTERPRISE_PERPETUAL_HUF,
  OURS_PRO_MAINTENANCE_HUF,
  OURS_PRO_PERPETUAL_HUF,
  OURS_SOLO_PERPETUAL_HUF,
} from "@/lib/private/marketControls";
import {
  optionABaselineSliders,
  optionBBaselineSliders,
  PRIVATE_MONETIZATION_CASE,
} from "@/lib/private/monetizationCase";
import {
  INSTALLMENT_LAG_MONTHS,
  optionACashAtMonth,
  optionBCashAtMonth,
  simulateOptionA,
  simulateOptionB,
  simulateTwoPillars,
} from "@/lib/private/monetizationEngine";
import { filterPublicCases } from "@/lib/private/publicCaseFilter";

describe("private monetization sim", () => {
  it("is marked private and never passes public filter", () => {
    expect(PRIVATE_MONETIZATION_CASE.isPrivate).toBe(true);
    expect(
      filterPublicCases([
        { id: "a", isPrivate: true },
        { id: "b" },
        { id: "c", isPrivate: false },
      ]).map((x) => x.id),
    ).toEqual(["b", "c"]);
  });

  it("anchors two pillars to Pro list price + optional Y2+", () => {
    expect(PRIVATE_MONETIZATION_CASE.optionA.baseValues.perpetualPrice).toBe(OURS_PRO_PERPETUAL_HUF);
    expect(PRIVATE_MONETIZATION_CASE.optionB.baseValues.feeY2).toBe(OURS_PRO_MAINTENANCE_HUF);
    expect(PRIVATE_MONETIZATION_CASE.optionB.baseValues.feeY3).toBe(239_000);
    expect(PRIVATE_MONETIZATION_CASE.installmentDueDays).toBe(60);
    expect(INSTALLMENT_LAG_MONTHS).toBe(2);
    expect(MARKET_CONTROL_MATRIX.map((r) => r.tier)).toEqual(["starter", "pro", "enterprise"]);
    expect(MARKET_CONTROL_MATRIX[0]).toMatchObject({
      y1: OURS_SOLO_PERPETUAL_HUF,
      y2: OURS_BASIC_Y2_HUF,
      y3: OURS_BASIC_Y3_HUF,
      cases: 1,
      slots: 3,
      seats: 1,
      guests: 1,
    });
    expect(MARKET_CONTROL_MATRIX[1]).toMatchObject({
      y1: OURS_PRO_PERPETUAL_HUF,
      cases: 2,
      slots: 6,
      seats: 1,
      guests: 5,
    });
    expect(MARKET_CONTROL_MATRIX[2]).toMatchObject({
      y1: OURS_ENTERPRISE_PERPETUAL_HUF,
      cases: 5,
      slots: 20,
      seats: 3,
      guests: 20,
    });
    expect(JSON.stringify(MARKET_CONTROL_MATRIX)).not.toMatch(/saas|havi|monthly/i);
  });

  it("has no monthly subscription construction", () => {
    expect(PRIVATE_MONETIZATION_CASE).not.toHaveProperty("slot1");
    const json = JSON.stringify(PRIVATE_MONETIZATION_CASE);
    expect(json).not.toMatch(/seatPriceMonthly|slot-subscription/);
  });

  it("splits Option A cash: lump vs 2×60 nap", () => {
    const price = 399_000;
    const [p1, p2] = splitEqualParts(price);
    const sales = [10, 0, 0];
    expect(optionACashAtMonth(sales, 1, price, 0)).toBe(10 * price);
    expect(optionACashAtMonth(sales, 1, price, 1)).toBe(10 * p1);
    expect(optionACashAtMonth(sales, 3, price, 1)).toBe(10 * p2);
    expect(optionACashAtMonth(sales, 2, price, 1)).toBe(0);
  });

  it("recognizes Option B only at Y2/Y3 anniversary, never as monthly fee", () => {
    const sales = [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    expect(optionBCashAtMonth(sales, 1, 1, 299_000, 239_000)).toBe(0);
    expect(optionBCashAtMonth(sales, 12, 1, 299_000, 239_000)).toBe(0);
    expect(optionBCashAtMonth(sales, 13, 1, 299_000, 239_000)).toBe(4 * 299_000);
    expect(optionBCashAtMonth(sales, 14, 0.5, 299_000, 239_000)).toBe(0);
  });

  it("builds 36-month P-R-O series for A, B and A+B", () => {
    const a = optionABaselineSliders();
    const b = optionBBaselineSliders();
    const optA = simulateOptionA(a, b);
    const optB = simulateOptionB(a, b);
    const ab = simulateTwoPillars(a, b);
    expect(optA.chart).toHaveLength(36);
    expect(optB.chart).toHaveLength(36);
    expect(ab.chart).toHaveLength(36);
    expect(optA.cumulativeEnd.optimistic).toBeGreaterThan(optA.cumulativeEnd.pessimistic);
    expect(optB.cumulativeEnd.optimistic).toBeGreaterThan(optB.cumulativeEnd.pessimistic);
    expect(ab.cumulativeEnd.realistic).toBeGreaterThan(optA.cumulativeEnd.realistic);
    const fees = loyaltyFeesFromYear1Huf(a.perpetualPrice);
    expect(fees.y2).toBe(OURS_PRO_MAINTENANCE_HUF);
  });
});
