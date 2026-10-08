import { describe, expect, it } from "vitest";

import { ENTERPRISE_CASE_ADDON_HUF, JIT_ADDON_PRICES, PLANS_CONFIG } from "@/config/plans";
import { INSTALLMENT2_DUE_DAYS, splitEqualParts } from "@/lib/installmentPlan";
import {
  buildAllPlanLego,
  buildPlanLego,
  optionAPayFor,
  optionBUpdateFor,
} from "@/lib/private/pricingLegoMatrix";

describe("pricing Lego matrix", () => {
  it("rebuilds Basic / Pro / Enterprise from public JIT units", () => {
    const basic = buildPlanLego("starter");
    expect(basic.lines.map((l) => l.qty)).toEqual([1, 3, 1, 1]);
    expect(basic.legoListHuf).toBe(
      1 * JIT_ADDON_PRICES.case_plus_1 +
        3 * JIT_ADDON_PRICES.slot_plus_1 +
        1 * JIT_ADDON_PRICES.seat_plus_1 +
        1 * JIT_ADDON_PRICES.guest_plus_1,
    );
    expect(basic.legoListHuf).toBe(294_000);
    expect(basic.y1).toBe(199_000);
    expect(basic.sum3y).toBe(467_000);
    expect(basic.bundleGapListHuf).toBe(95_000);
    expect(basic.twoPackY1).toBe(398_000);
    expect(basic.doubleListHuf).toBe(294_000);
    expect(basic.own3yPlusDoubleList).toBe(761_000);

    const pro = buildPlanLego("pro");
    expect(pro.lines.map((l) => l.qty)).toEqual([2, 6, 1, 5]);
    expect(pro.legoListHuf).toBe(566_000);
    expect(pro.y1).toBe(399_000);
    expect(pro.sum3y).toBe(937_000);
    expect(pro.twoPackY1).toBe(798_000);

    const ent = buildPlanLego("expert");
    expect(ent.lines.map((l) => l.qty)).toEqual([5, 20, 3, 20]);
    expect(ent.legoListHuf).toBe(1_842_000);
    expect(ent.legoBillHuf).toBe(1_792_000);
    expect(ent.y1).toBe(799_000);
    expect(ent.sum3y).toBe(1_877_000);
    expect(ent.twoPackY1).toBe(1_598_000);
    expect(ent.doubleBillHuf).toBeGreaterThan(ent.twoPackY1);
  });

  it("keeps package cheaper than Lego on every public tier", () => {
    for (const row of buildAllPlanLego()) {
      expect(row.y1).toBeLessThan(row.legoListHuf);
      expect(row.bundleGapListHuf).toBeGreaterThan(0);
    }
  });

  it("JIT örökös lista: Case 49k / Ent Case 39k, Slot 49k, Seat 79k, Guest 19k, Edge 99k", () => {
    expect(JIT_ADDON_PRICES).toMatchObject({
      case_plus_1: 49_000,
      slot_plus_1: 49_000,
      seat_plus_1: 79_000,
      guest_plus_1: 19_000,
      edge_sensor: 99_000,
    });
    expect(ENTERPRISE_CASE_ADDON_HUF).toBe(39_000);
    expect(buildPlanLego("expert").lines.find((l) => l.key === "cases")!.unitHuf).toBe(49_000);
    expect(buildPlanLego("expert").legoBillHuf).toBeLessThan(buildPlanLego("expert").legoListHuf);
  });

  it("Opció A: egyszeri vagy 2 egyenlő részlet 60 napon belül", () => {
    const pro = optionAPayFor("pro");
    expect(pro.lump).toBe(399_000);
    expect(pro.dueDays).toBe(INSTALLMENT2_DUE_DAYS);
    expect(pro.parts).toEqual(splitEqualParts(PLANS_CONFIG.pro.priceHuf));
    expect(pro.parts[0] + pro.parts[1]).toBe(399_000);
    expect(pro.parts).toHaveLength(2);
  });

  it("Opció B: opcionális Y2+ frissítés, Y4-től 0", () => {
    const pro = optionBUpdateFor("pro");
    expect(pro.y2).toBe(299_000);
    expect(pro.y3).toBe(239_000);
    expect(pro.y4).toBe(0);
  });
});
