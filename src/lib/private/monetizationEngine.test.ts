import { describe, expect, it } from "vitest";

import {
  MARKET_CONTROL_MATRIX,
  OURS_ENTERPRISE_PERPETUAL_HUF,
  OURS_PRO_MAINTENANCE_HUF,
  OURS_PRO_PERPETUAL_HUF,
  PERPETUAL_COMPETITORS,
  SAAS_COMPETITORS,
  SAAS_CONTROL_SEAT_MONTHLY_HUF,
} from "@/lib/private/marketControls";
import { PRIVATE_MONETIZATION_CASE } from "@/lib/private/monetizationCase";
import {
  simulateEnterpriseSlot,
  simulatePerpetualSlot,
  simulateSubscriptionSlot,
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

  it("anchors baselines to market control + our list prices", () => {
    expect(PRIVATE_MONETIZATION_CASE.slot1.baseValues.seatPriceMonthly).toBe(
      SAAS_CONTROL_SEAT_MONTHLY_HUF,
    );
    expect(PRIVATE_MONETIZATION_CASE.slot2.baseValues.perpetualPrice).toBe(OURS_PRO_PERPETUAL_HUF);
    expect(PRIVATE_MONETIZATION_CASE.slot2.baseValues.maintenanceFeeY2).toBe(OURS_PRO_MAINTENANCE_HUF);
    expect(PRIVATE_MONETIZATION_CASE.slot2.baseValues.maintenanceFeeY3).toBe(239_000);
    expect(PRIVATE_MONETIZATION_CASE.slot3.baseValues.basePackagePrice).toBe(
      OURS_ENTERPRISE_PERPETUAL_HUF,
    );
    expect(PRIVATE_MONETIZATION_CASE.slot3.baseValues.monthlySalesVolume).toBe(2);
    expect(PRIVATE_MONETIZATION_CASE.slot3.baseValues.annualRenewalRate).toBe(0.85);
    expect(SAAS_COMPETITORS).toHaveLength(3);
    expect(PERPETUAL_COMPETITORS).toHaveLength(3);
    expect(MARKET_CONTROL_MATRIX.map((r) => r.tier)).toEqual(["starter", "pro", "enterprise"]);
    expect(MARKET_CONTROL_MATRIX[2]!.ours.priceHuf).toBe(799_000);
  });

  it("builds 36-month P-R-O series for all three slots", () => {
    const sub = simulateSubscriptionSlot({
      seatPriceMonthly: SAAS_CONTROL_SEAT_MONTHLY_HUF,
      monthlyGrowthRatePct: 8,
      churnRatePct: 2,
    });
    const perp = simulatePerpetualSlot({
      perpetualPrice: OURS_PRO_PERPETUAL_HUF,
      renewalRatePct: 75,
    });
    const ent = simulateEnterpriseSlot({
      basePackagePrice: OURS_ENTERPRISE_PERPETUAL_HUF,
      monthlySalesVolume: 2,
      renewalRatePct: 85,
    });
    expect(sub.chart).toHaveLength(36);
    expect(perp.chart).toHaveLength(36);
    expect(ent.chart).toHaveLength(36);
    expect(sub.cumulativeEnd.optimistic).toBeGreaterThan(sub.cumulativeEnd.pessimistic);
    expect(perp.cumulativeEnd.optimistic).toBeGreaterThan(perp.cumulativeEnd.pessimistic);
    expect(ent.cumulativeEnd.optimistic).toBeGreaterThan(ent.cumulativeEnd.pessimistic);
  });
});
