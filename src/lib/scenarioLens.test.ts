import { describe, expect, it } from "vitest";

import { CORE_CASE_IDS } from "@/lib/demoCatalog";
import { scenarioLens } from "@/lib/scenarioLens";
import { pdcaPhaseExact, scenarioSurface } from "@/lib/scenarioSurface";

describe("scenarioLens", () => {
  it("gives every public case four tab slots and a PDCA spine", () => {
    for (const id of CORE_CASE_IDS) {
      const lens = scenarioLens(id, "hu");
      expect(lens.tabs.cashflow).toBeTruthy();
      expect(lens.tabs.items).toBeTruthy();
      expect(lens.tabs.deals).toBeTruthy();
      expect(lens.tabs.inventory).toBeTruthy();
      expect(scenarioSurface(id).showFinanceModules).toBe(true);
      expect(pdcaPhaseExact("PLAN", scenarioSurface(id), id)).toMatch(/^PLAN/);
      expect(pdcaPhaseExact("ACT", scenarioSurface(id), id)).toMatch(/^ACT/);
    }
  });

  it("renames deals/inventory on hospital and BCP without dropping cashflow", () => {
    expect(scenarioLens("demo7_industry_hospital_blackout", "hu").tabs).toMatchObject({
      cashflow: "Cashflow",
      deals: "Osztályok",
      inventory: "Energia",
    });
    expect(scenarioLens("demo12_resilience_saas_outage", "en").tabs.deals).toBe("Nodes");
    expect(scenarioLens("demo1_multisite_operator", "hu").tabs.deals).toBe("Üzletek");
  });
});
