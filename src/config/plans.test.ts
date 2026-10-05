import { describe, expect, it } from "vitest";

import { buildPricingCompareRows, planHighlights, planSlogan } from "@/config/planCopy";
import {
  ENGINE_VERSION,
  ENTERPRISE_CASE_ADDON_HUF,
  JIT_ADDON_PRICES,
  PLANS_CONFIG,
  formatQuota,
  getPublicPlans,
  jitAddonPriceForPlan,
  totalSlots,
} from "@/config/plans";
import { evaluateLicenseGate, hasPermission } from "@/lib/planPermissions";
import { BASE_SCENARIO_SLOTS } from "@/lib/scenarioSlots";
import { TIER_CAPACITY, TIER_MONTHLY_HUF } from "@/content/pricing/tiers";

describe("PLANS_CONFIG perpetual model", () => {
  it("exposes Basic / Pro / Enterprise with original package sizes", () => {
    expect(getPublicPlans().map((p) => p.id)).toEqual(["starter", "pro", "expert"]);
    expect(PLANS_CONFIG.starter.priceHuf).toBe(199_000);
    expect(PLANS_CONFIG.starter.quotas).toMatchObject({
      cases: 1,
      slotsPerCase: 3,
      seats: 1,
      guests: 1,
    });
    expect(PLANS_CONFIG.pro.badge).toBe("recommended");
    expect(PLANS_CONFIG.pro.priceHuf).toBe(399_000);
    expect(PLANS_CONFIG.pro.loyaltyLadder).toMatchObject({
      year1: { huf: 399_000, eur: 399 },
      year2: { huf: 299_000, eur: 299 },
      year3: { huf: 239_000, eur: 239 },
      lifetimeFreeFromYear: 4,
    });
    expect(PLANS_CONFIG.starter.loyaltyLadder?.year2.huf).toBe(149_000);
    expect(PLANS_CONFIG.starter.loyaltyLadder?.year3.huf).toBe(119_000);
    expect(PLANS_CONFIG.pro.quotas).toMatchObject({
      cases: 2,
      slotsPerCase: 3,
      seats: 1,
      guests: 5,
    });
    expect(PLANS_CONFIG.expert.customPricing).toBe(false);
    expect(PLANS_CONFIG.expert.priceHuf).toBe(799_000);
    expect(PLANS_CONFIG.expert.loyaltyLadder?.year2.huf).toBe(599_000);
    expect(PLANS_CONFIG.expert.loyaltyLadder?.year3.huf).toBe(479_000);
    expect(PLANS_CONFIG.expert.quotas).toMatchObject({
      cases: 5,
      slotsPerCase: 4,
      seats: 3,
      guests: 20,
    });
  });

  it("keeps capacity façade in sync", () => {
    expect(TIER_CAPACITY.starter.slotsPerCase).toBe(3);
    expect(TIER_CAPACITY.pro.slotsPerCase).toBe(3);
    expect(TIER_CAPACITY.expert.slotsPerCase).toBe(4);
    expect(PLANS_CONFIG.starter.priceHuf).toBe(199_000);
    expect(PLANS_CONFIG.pro.priceHuf).toBe(399_000);
    expect(PLANS_CONFIG.expert.priceHuf).toBe(799_000);
    expect(TIER_MONTHLY_HUF.starter).toBe(0);
    expect(TIER_MONTHLY_HUF.pro).toBe(0);
    expect(TIER_MONTHLY_HUF.expert).toBe(0);
    expect(BASE_SCENARIO_SLOTS.starter).toBe(3);
    expect(BASE_SCENARIO_SLOTS.pro).toBe(6);
    expect(BASE_SCENARIO_SLOTS.expert).toBe(20);
    expect(PLANS_CONFIG.campus.quotas).toMatchObject({ cases: 1, slotsPerCase: 2 });
    expect(totalSlots(PLANS_CONFIG.campus)).toBe(2);
    expect(totalSlots(PLANS_CONFIG.pro)).toBe(6);
  });

  it("keeps card bullets short and free of loyalty clutter", () => {
    const starter = planHighlights(PLANS_CONFIG.starter, "hu");
    const pro = planHighlights(PLANS_CONFIG.pro, "hu");
    const ent = planHighlights(PLANS_CONFIG.expert, "hu");
    expect(starter).toHaveLength(4);
    expect(pro).toHaveLength(4);
    expect(ent).toHaveLength(4);
    expect(starter.some((h) => /−25%|hűség|örökélet/i.test(h))).toBe(false);
    expect(starter.join(" ")).not.toMatch(/projekt|szcenárió/i);
    expect(starter[0]).toBe("1 aktív case");
    expect(starter[1]).toBe("3 aktív slot");
    expect(pro[0]).toBe("2 párhuzamos aktív case");
    expect(pro[1]).toBe("3 aktív slot case-enként");
    expect(ent[0]).toBe("5 Aktív Case");
    expect(ent[1]).toBe("4 Aktív Slot / Case");
    expect(pro.some((h) => /CAMT\.053|bankkivonat/i.test(h))).toBe(true);
    expect(ent.some((h) => /könyvelési|bankkivonat/i.test(h))).toBe(true);
    const slogan = planSlogan(PLANS_CONFIG.starter, "hu");
    expect(slogan).toContain("1");
    expect(slogan).toContain("3");
    const rows = buildPricingCompareRows("hu");
    const cases = rows.find((r) => r.id === "cases");
    expect(cases?.cells.pro).toBe(formatQuota(2));
    expect(cases?.cells.expert).toBe("5");
    const desktop = rows.find((r) => r.id === "desktop");
    expect(desktop?.feature).toBe("Asztali alkalmazás");
    expect(desktop?.cells.pro).toMatch(/Pro Desktop/);
    expect(desktop?.cells.expert).toMatch(/Bővítő modul \/ Előkészítés alatt/);
    expect(desktop?.cells.expert).not.toMatch(/szcenárió/i);
  });

  it("gates permissions by role and version window", () => {
    expect(hasPermission("pro", "SEAT", "EDIT_MODELS", null)).toBe(false);
    expect(hasPermission("pro", "GUEST", "EDIT_MODELS")).toBe(false);
    expect(hasPermission("demo", "DEMO", "RESET_DEMO")).toBe(true);
    expect(ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+/);

    const gateOk = evaluateLicenseGate({
      token: "t",
      tier: "pro",
      interval: "perpetual",
      status: "paid",
      verifiedAt: new Date().toISOString(),
      engineVersion: ENGINE_VERSION,
      updatesUntil: new Date(Date.now() + 86400000).toISOString(),
      licenseExpiryDate: null,
    });
    expect(gateOk.runtimeOk).toBe(true);
    expect(gateOk.updatesActive).toBe(true);
    expect(gateOk.engineOk).toBe(true);
  });

  it("keeps perpetual JIT module prices (Pro Case 49k, Enterprise Case 39k)", () => {
    expect(JIT_ADDON_PRICES.case_plus_1).toBe(49_000);
    expect(JIT_ADDON_PRICES.slot_plus_1).toBe(49_000);
    expect(JIT_ADDON_PRICES.seat_plus_1).toBe(79_000);
    expect(ENTERPRISE_CASE_ADDON_HUF).toBe(39_000);
    expect(jitAddonPriceForPlan("case_plus_1", "pro")).toBe(49_000);
    expect(jitAddonPriceForPlan("case_plus_1", "expert")).toBe(39_000);
  });
});
