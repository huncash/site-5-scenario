import {
  BASE_CASE_IDS,
  CORE_CASE_IDS,
  KAHN_SEGMENT_ID,
  LENS_CASE_IDS,
  PUBLIC_DEMO_SEGMENTS,
  isCoreCaseId as catalogIsCore,
  type BaseCaseId,
  type CoreCaseId,
  type DemoSegmentId,
  type LensCaseId,
} from "@/lib/demoCatalog";
import type { ScenarioDoorStep } from "@/lib/doorStep";

export { BASE_CASE_IDS, CORE_CASE_IDS, KAHN_SEGMENT_ID, LENS_CASE_IDS } from "@/lib/demoCatalog";

export type { BaseCaseId, CoreCaseId, LensCaseId };

export const CASE_PILLARS = ["civil", "personal", "corporate", "demographics", "education"] as const;
export type CasePillar = (typeof CASE_PILLARS)[number];

export const CASE_TIERS = ["base", "lens"] as const;
export type CaseTier = (typeof CASE_TIERS)[number];

const BASE_SET = new Set<string>(BASE_CASE_IDS);
const LENS_SET = new Set<string>(LENS_CASE_IDS);

export const TIER_OF: Record<CoreCaseId, CaseTier> = {
  demo1_multisite_operator: "base",
  demo2_premium_nightlife: "base",
  demo3_specialty_cafe_tea: "base",
  demo4_fine_dining_bistro: "base",
  demo5_pastry_gelato: "base",
  demo6_event_catering_popup: "base",
  demo7_personal_pocket_seasonal_pilot: "base",
  demo11_resilience_saas_outage: "lens",
  demo12_resilience_community_grid: "lens",
  demo13_resilience_home_blackout: "lens",
  demo14_resilience_demography: "lens",
  demo15_edu_startup_cashflow: "lens",
  demo16_edu_lean_vsm: "lens",
  demo19_strategy_kahn_fork: "lens",
  demo20_industry_hospital_blackout: "lens",
  demo21_industry_supply_shock: "lens",
  demo22_industry_poka_recall: "lens",
  demo23_industry_wms_outage: "lens",
};

export const PILLAR_OF: Record<CoreCaseId, CasePillar> = {
  demo1_multisite_operator: "corporate",
  demo2_premium_nightlife: "corporate",
  demo3_specialty_cafe_tea: "corporate",
  demo4_fine_dining_bistro: "corporate",
  demo5_pastry_gelato: "corporate",
  demo6_event_catering_popup: "corporate",
  demo7_personal_pocket_seasonal_pilot: "personal",
  demo11_resilience_saas_outage: "corporate",
  demo12_resilience_community_grid: "civil",
  demo13_resilience_home_blackout: "personal",
  demo14_resilience_demography: "demographics",
  demo15_edu_startup_cashflow: "education",
  demo16_edu_lean_vsm: "education",
  demo19_strategy_kahn_fork: "corporate",
  demo20_industry_hospital_blackout: "corporate",
  demo21_industry_supply_shock: "corporate",
  demo22_industry_poka_recall: "corporate",
  demo23_industry_wms_outage: "corporate",
};

export function isCoreCaseId(id: string | null | undefined): id is CoreCaseId {
  return catalogIsCore(id);
}

export function isBaseCaseId(id: string | null | undefined): id is BaseCaseId {
  return Boolean(id && BASE_SET.has(id));
}

export function isLensCaseId(id: string | null | undefined): id is LensCaseId {
  return Boolean(id && LENS_SET.has(id));
}

export function publicDemoSegments() {
  return PUBLIC_DEMO_SEGMENTS;
}

export function coreCasesOnStep(step: ScenarioDoorStep): DemoSegmentId[] {
  if (step === "hospitality") {
    return [
      "demo1_multisite_operator",
      "demo2_premium_nightlife",
      "demo3_specialty_cafe_tea",
      "demo4_fine_dining_bistro",
      "demo5_pastry_gelato",
      "demo6_event_catering_popup",
    ];
  }
  if (step === "healthcare") return ["demo20_industry_hospital_blackout"];
  if (step === "manufacturing") return ["demo21_industry_supply_shock", "demo22_industry_poka_recall"];
  if (step === "logistics") return ["demo23_industry_wms_outage"];
  if (step === "strategy") return [KAHN_SEGMENT_ID];
  if (step === "education") return ["demo15_edu_startup_cashflow", "demo16_edu_lean_vsm"];
  if (step === "resilience") {
    return [
      "demo11_resilience_saas_outage",
      "demo12_resilience_community_grid",
      "demo13_resilience_home_blackout",
      "demo14_resilience_demography",
    ];
  }
  if (step === "inner") {
    return [
      "demo7_personal_pocket_seasonal_pilot",
      "demo11_resilience_saas_outage",
      "demo12_resilience_community_grid",
      "demo13_resilience_home_blackout",
      "demo14_resilience_demography",
      "demo15_edu_startup_cashflow",
      "demo16_edu_lean_vsm",
    ];
  }
  if (step === "industry") {
    return [
      "demo1_multisite_operator",
      "demo2_premium_nightlife",
      "demo3_specialty_cafe_tea",
      "demo4_fine_dining_bistro",
      "demo5_pastry_gelato",
      "demo6_event_catering_popup",
      "demo20_industry_hospital_blackout",
      "demo21_industry_supply_shock",
      "demo22_industry_poka_recall",
    ];
  }
  return [...CORE_CASE_IDS];
}
