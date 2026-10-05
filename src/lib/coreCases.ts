import {
  BASE_CASE_IDS,
  CORE_CASE_IDS,
  KAHN_SEGMENT_ID,
  LENS_CASE_IDS,
  PUBLIC_DEMO_SEGMENTS,
  isCoreCaseId as catalogIsCore,
  publicDemoSegments as catalogPublicDemoSegments,
  type BaseCaseId,
  type CoreCaseId,
  type DemoSegmentId,
  type DemoSegmentMeta,
  type LensCaseId,
} from "@/lib/demoCatalog";
import type { ScenarioDoorStep } from "@/lib/doorStep";
import { industryCaseById, isIndustrySegment } from "@/lib/industryCases";
import { isEducationSegment } from "@/lib/educationCases";
import { filterPublicCases } from "@/lib/private/publicCaseFilter";
import { isResilienceSegment } from "@/lib/resilienceCases";
import { isStrategySegment } from "@/lib/strategyCases";

export {
  BASE_CASE_IDS,
  CORE_CASE_IDS,
  KAHN_SEGMENT_ID,
  LENS_CASE_IDS,
  demoSerialFromId,
} from "@/lib/demoCatalog";

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
  demo18_personal_pocket_seasonal_pilot: "base",
  demo12_resilience_saas_outage: "lens",
  demo13_resilience_community_grid: "lens",
  demo14_resilience_home_blackout: "lens",
  demo15_resilience_demography: "lens",
  demo16_edu_startup_cashflow: "lens",
  demo17_edu_ops_process: "lens",
  demo11_strategy_kahn_fork: "lens",
  demo7_industry_hospital_blackout: "lens",
  demo8_industry_supply_shock: "lens",
  demo9_industry_poka_recall: "lens",
  demo10_industry_wms_outage: "lens",
};

export const PILLAR_OF: Record<CoreCaseId, CasePillar> = {
  demo1_multisite_operator: "corporate",
  demo2_premium_nightlife: "corporate",
  demo3_specialty_cafe_tea: "corporate",
  demo4_fine_dining_bistro: "corporate",
  demo5_pastry_gelato: "corporate",
  demo6_event_catering_popup: "corporate",
  demo18_personal_pocket_seasonal_pilot: "personal",
  demo12_resilience_saas_outage: "corporate",
  demo13_resilience_community_grid: "civil",
  demo14_resilience_home_blackout: "personal",
  demo15_resilience_demography: "demographics",
  demo16_edu_startup_cashflow: "education",
  demo17_edu_ops_process: "education",
  demo11_strategy_kahn_fork: "corporate",
  demo7_industry_hospital_blackout: "corporate",
  demo8_industry_supply_shock: "corporate",
  demo9_industry_poka_recall: "corporate",
  demo10_industry_wms_outage: "corporate",
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
  return catalogPublicDemoSegments();
}

/** Eset / Szituáció fajta (ajtó „type” réteg) a login demó indító csoportosításához. */
export type DemoCatalogKind = "economic" | "resilience" | "education" | "inner";

/** Iparági / altípus jelölés a fajta-halmazon belül. */
export type DemoCatalogIndustry =
  | "hospitality"
  | "healthcare"
  | "manufacturing"
  | "logistics"
  | "strategy"
  | "education"
  | "firmBcp"
  | "community"
  | "household"
  | "demography"
  | "personal";

export type DemoCatalogIndustryBucket = {
  industry: DemoCatalogIndustry;
  segments: DemoSegmentMeta[];
};

export type DemoCatalogKindGroup = {
  kind: DemoCatalogKind;
  industries: DemoCatalogIndustryBucket[];
};

export function scenarioKindOf(id: DemoSegmentId): DemoCatalogKind {
  return catalogPlacement(id).kind;
}

function catalogPlacement(id: DemoSegmentId): { kind: DemoCatalogKind; industry: DemoCatalogIndustry } {
  if (isEducationSegment(id)) return { kind: "education", industry: "education" };
  if (isResilienceSegment(id)) {
    if (id === "demo13_resilience_community_grid") return { kind: "resilience", industry: "community" };
    if (id === "demo14_resilience_home_blackout") return { kind: "resilience", industry: "household" };
    if (id === "demo15_resilience_demography") return { kind: "resilience", industry: "demography" };
    return { kind: "resilience", industry: "firmBcp" };
  }
  if (isStrategySegment(id)) return { kind: "economic", industry: "strategy" };
  if (isIndustrySegment(id)) {
    const door = industryCaseById(id).door;
    if (door === "healthcare") return { kind: "economic", industry: "healthcare" };
    if (door === "manufacturing") return { kind: "economic", industry: "manufacturing" };
    if (door === "logistics") return { kind: "economic", industry: "logistics" };
    return { kind: "economic", industry: "strategy" };
  }
  if (id === "demo18_personal_pocket_seasonal_pilot") return { kind: "inner", industry: "personal" };
  return { kind: "economic", industry: "hospitality" };
}

const KIND_ORDER: DemoCatalogKind[] = ["economic", "resilience", "education", "inner"];
const INDUSTRY_ORDER: DemoCatalogIndustry[] = [
  "hospitality",
  "healthcare",
  "manufacturing",
  "logistics",
  "strategy",
  "firmBcp",
  "community",
  "household",
  "demography",
  "education",
  "personal",
];

/** Nyilvános demók: fajta-halmaz → iparági jelölés → esetek (nem ömlesztett lista). */
export function groupPublicDemoSegments(): DemoCatalogKindGroup[] {
  const byKind = new Map<DemoCatalogKind, Map<DemoCatalogIndustry, DemoSegmentMeta[]>>();
  for (const kind of KIND_ORDER) byKind.set(kind, new Map());

  for (const seg of filterPublicCases(PUBLIC_DEMO_SEGMENTS)) {
    const { kind, industry } = catalogPlacement(seg.id);
    const indMap = byKind.get(kind)!;
    const list = indMap.get(industry) ?? [];
    list.push(seg);
    indMap.set(industry, list);
  }

  return KIND_ORDER.map((kind) => {
    const indMap = byKind.get(kind)!;
    const industries = INDUSTRY_ORDER.filter((industry) => indMap.has(industry)).map((industry) => ({
      industry,
      segments: [...(indMap.get(industry) ?? [])].sort((a, b) => {
        const na = Number(String(a.id).match(/^demo(\d+)_/)?.[1] ?? 999);
        const nb = Number(String(b.id).match(/^demo(\d+)_/)?.[1] ?? 999);
        return na - nb;
      }),
    }));
    return { kind, industries };
  }).filter((g) => g.industries.length > 0);
}

export function coreCasesOnStep(step: ScenarioDoorStep): DemoSegmentId[] {
  if (step === "hospitality") return segmentsOfIndustry("hospitality");
  if (step === "healthcare") return segmentsOfIndustry("healthcare");
  if (step === "manufacturing") return segmentsOfIndustry("manufacturing");
  if (step === "logistics") return segmentsOfIndustry("logistics");
  if (step === "strategy") return segmentsOfIndustry("strategy");
  if (step === "education") return segmentsOfKind("education");
  if (step === "resilience") return segmentsOfKind("resilience");
  if (step === "inner") {
    return segmentsOfIndustry("personal");
  }
  if (step === "economic" || step === "industry") {
    return segmentsOfKind("economic");
  }
  return [...CORE_CASE_IDS];
}

function segmentsOfIndustry(industry: DemoCatalogIndustry): DemoSegmentId[] {
  for (const g of groupPublicDemoSegments()) {
    const bucket = g.industries.find((b) => b.industry === industry);
    if (bucket) return bucket.segments.map((s) => s.id);
  }
  return [];
}

function segmentsOfKind(kind: DemoCatalogKind): DemoSegmentId[] {
  const g = groupPublicDemoSegments().find((x) => x.kind === kind);
  if (!g) return [];
  return g.industries.flatMap((b) => b.segments.map((s) => s.id));
}
