import { describe, expect, it } from "vitest";

import { buildPricingCompareRows, planHighlights, planSlogan } from "@/config/planCopy";
import {
  JIT_ADDON_PRICES,
  PLANS_CONFIG,
  getPublicPlans,
  totalSlots,
  yearlyPriceHuf,
} from "@/config/plans";
import { hasPermission } from "@/lib/planPermissions";
import { BASE_SCENARIO_SLOTS } from "@/lib/scenarioSlots";
import { TIER_CAPACITY, TIER_MONTHLY_HUF } from "@/content/pricing/tiers";

describe("PLANS_CONFIG single source of truth", () => {
  it("exposes public Basic / Pro / Enterprise", () => {
    expect(getPublicPlans().map((p) => p.id)).toEqual(["starter", "pro", "expert"]);
    expect(PLANS_CONFIG.starter.label).toBe("Basic");
    expect(PLANS_CONFIG.pro.badge).toBe("recommended");
  });

  it("keeps capacity façade in sync", () => {
    for (const id of ["starter", "pro", "expert"] as const) {
      expect(TIER_CAPACITY[id].cases).toBe(PLANS_CONFIG[id].quotas.cases);
      expect(TIER_CAPACITY[id].slotsPerCase).toBe(PLANS_CONFIG[id].quotas.slotsPerCase);
      expect(TIER_CAPACITY[id].editors).toBe(PLANS_CONFIG[id].quotas.seats);
      expect(TIER_CAPACITY[id].guests).toBe(PLANS_CONFIG[id].quotas.guests);
      expect(TIER_MONTHLY_HUF[id]).toBe(PLANS_CONFIG[id].monthlyPriceHuf);
      expect(BASE_SCENARIO_SLOTS[id]).toBe(totalSlots(PLANS_CONFIG[id]));
    }
    expect(BASE_SCENARIO_SLOTS.campus).toBe(totalSlots(PLANS_CONFIG.campus));
    expect(BASE_SCENARIO_SLOTS.local).toBe(totalSlots(PLANS_CONFIG.local));
  });

  it("generates pricing copy from quotas", () => {
    const slogan = planSlogan(PLANS_CONFIG.starter, "hu");
    expect(slogan).toContain(String(PLANS_CONFIG.starter.quotas.cases));
    expect(slogan).toContain(String(PLANS_CONFIG.starter.quotas.slotsPerCase));
    const highlights = planHighlights(PLANS_CONFIG.pro, "hu");
    expect(highlights[0]).toContain(String(PLANS_CONFIG.pro.quotas.cases));
    expect(highlights.some((h) => h.includes(String(PLANS_CONFIG.pro.quotas.guests)))).toBe(true);
    const rows = buildPricingCompareRows("hu");
    const cases = rows.find((r) => r.id === "cases");
    expect(cases?.cells.expert).toBe(String(PLANS_CONFIG.expert.quotas.cases));
  });

  it("gates permissions by role", () => {
    expect(hasPermission("pro", "SEAT", "EDIT_MODELS")).toBe(true);
    expect(hasPermission("pro", "GUEST", "EDIT_MODELS")).toBe(false);
    expect(hasPermission("pro", "GUEST", "EXPLORE_SCENARIOS")).toBe(true);
    expect(hasPermission("demo", "DEMO", "RESET_DEMO")).toBe(true);
    expect(hasPermission("starter", "SEAT", "RESET_DEMO")).toBe(false);
    expect(hasPermission("expert", "SEAT", "SAVE_TO_CLOUD")).toBe(true);
    expect(hasPermission("starter", "SEAT", "SAVE_TO_CLOUD")).toBe(false);
  });

  it("keeps JIT prices and yearly discount coherent", () => {
    expect(JIT_ADDON_PRICES.slot_plus_1).toBe(2_900);
    expect(yearlyPriceHuf(PLANS_CONFIG.pro.monthlyPriceHuf)).toBe(
      Math.round(PLANS_CONFIG.pro.monthlyPriceHuf * 12 * 0.85),
    );
  });
});
