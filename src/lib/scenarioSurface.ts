import { educationCaseById, isEducationSegment } from "@/lib/educationCases";
import { industryCaseById, industryShowsPhysical, isIndustrySegment } from "@/lib/industryCases";
import type { MasterBaselineContext, OrgKind } from "@/lib/masterBaseline";
import { inheritMasterBaseline, MASTER_BASELINE } from "@/lib/masterBaseline";
import { isResilienceSegment, resilienceCaseById } from "@/lib/resilienceCases";
import { scenarioLens } from "@/lib/scenarioLens";
import { isStrategySegment } from "@/lib/strategyCases";

export type ScenarioFamily = "finance" | "strategy" | "resilience" | "education" | "industry";

export type ScenarioSurface = {
  family: ScenarioFamily;
  /** Ft cash-flow, what-if, tartozás, persely, Valóság-Sokk. */
  showFinanceModules: boolean;
  /** ResourceRunway, EnergyAutonomy, TTR, kWh, izoláció. */
  showPhysicalKpis: boolean;
  /** Lean / Poka-Yoke / MUDA (nem Ft-oszlop). */
  showLean: boolean;
  inheritMasterBaseline: boolean;
};

export function scenarioSurface(segmentId: string | null | undefined): ScenarioSurface {
  if (isResilienceSegment(segmentId)) {
    return {
      family: "resilience",
      showFinanceModules: true,
      showPhysicalKpis: true,
      showLean: false,
      inheritMasterBaseline: true,
    };
  }
  if (isEducationSegment(segmentId)) {
    const kind = educationCaseById(segmentId).kind;
    if (kind === "startup") {
      return {
        family: "education",
        showFinanceModules: true,
        showPhysicalKpis: false,
        showLean: true,
        inheritMasterBaseline: true,
      };
    }
    if (kind === "ops") {
      return {
        family: "education",
        showFinanceModules: true,
        showPhysicalKpis: false,
        showLean: true,
        inheritMasterBaseline: true,
      };
    }
    return {
      family: "education",
      showFinanceModules: true,
      showPhysicalKpis: true,
      showLean: false,
      inheritMasterBaseline: true,
    };
  }
  if (isIndustrySegment(segmentId)) {
    const kind = industryCaseById(segmentId).kind;
    return {
      family: "industry",
      showFinanceModules: true,
      showPhysicalKpis: industryShowsPhysical(kind),
      showLean: kind !== "wms",
      inheritMasterBaseline: true,
    };
  }
  if (isStrategySegment(segmentId)) {
    return {
      family: "strategy",
      showFinanceModules: true,
      showPhysicalKpis: false,
      showLean: false,
      inheritMasterBaseline: true,
    };
  }
  return {
    family: "finance",
    showFinanceModules: true,
    showPhysicalKpis: false,
    showLean: true,
    inheritMasterBaseline: true,
  };
}

export function pdcaPhaseExact(
  phase: "PLAN" | "DO" | "CHECK" | "ACT",
  _surface: ScenarioSurface,
  segmentId?: string | null,
): string {
  return scenarioLens(segmentId).pdca[phase];
}

export function baselineForSegment(segmentId: string | null | undefined): MasterBaselineContext {
  const surface = scenarioSurface(segmentId);
  if (isResilienceSegment(segmentId)) {
    const cse = resilienceCaseById(segmentId);
    if (cse.kind === "household") {
      return {
        orgKind: "household",
        orgLabel: cse.businessAlias,
        headcount: 4,
        sizeHint: "4 fős háztartás",
        startingResources: { energyKwh: 8.4, stockDays: 5, autonomyHours: 72, cashHuf: 180_000 },
        monthlyRevenueNet: null,
      };
    }
    if (cse.kind === "community") {
      return {
        orgKind: "community",
        orgLabel: cse.businessAlias,
        headcount: 86,
        sizeHint: "86 fős kisközösség",
        startingResources: { waterLiters: 4_800, energyKwh: 42, stockDays: 3, autonomyHours: 72 },
        monthlyRevenueNet: null,
      };
    }
    if (cse.kind === "macro") {
      return {
        orgKind: "macro",
        orgLabel: cse.businessAlias,
        headcount: 0,
        sizeHint: "Nemzeti / strukturális modell",
        startingResources: {},
        monthlyRevenueNet: null,
      };
    }
    return {
      orgKind: "business",
      orgLabel: cse.businessAlias,
      headcount: 18,
      sizeHint: "18 fős üzem, 2 telephely",
      startingResources: { autonomyHours: 4, stockDays: 7, cashHuf: 2_100_000 },
      monthlyRevenueNet: cse.baseRevenueNetHuf,
    };
  }
  if (isEducationSegment(segmentId)) {
    const cse = educationCaseById(segmentId);
    const kindToOrg: Record<typeof cse.kind, OrgKind> = {
      startup: "business",
      ops: "business",
      campus: "campus",
      cyber: "campus",
    };
    const size =
      cse.kind === "startup"
        ? { headcount: 3, sizeHint: "3 fős hallgatói csapat" }
        : cse.kind === "ops"
          ? { headcount: 9, sizeHint: "9 fős tanműhely / kis sor" }
          : { headcount: 420, sizeHint: "Campus / kar lépték" };
    return {
      orgKind: kindToOrg[cse.kind],
      orgLabel: cse.businessAlias,
      ...size,
      startingResources:
        cse.kind === "campus"
          ? { energyKwh: 1_860, stockDays: 2 }
          : cse.kind === "cyber"
            ? { autonomyHours: 4, cashHuf: 0 }
            : { cashHuf: cse.kind === "startup" ? 420_000 : 1_200_000, stockDays: cse.kind === "ops" ? 6 : 4 },
      monthlyRevenueNet: cse.baseRevenueNetHuf || null,
    };
  }
  if (isIndustrySegment(segmentId)) {
    const cse = industryCaseById(segmentId);
    if (cse.kind === "hospital") {
      return {
        orgKind: "hospital",
        orgLabel: cse.businessAlias,
        headcount: 86,
        sizeHint: "Regionális intézmény — ICU / műtő / NICU",
        startingResources: { energyKwh: 420, autonomyHours: 8, stockDays: 2 },
        monthlyRevenueNet: null,
      };
    }
    if (cse.kind === "wms") {
      return {
        orgKind: "business",
        orgLabel: cse.businessAlias,
        headcount: 42,
        sizeHint: "42 fős cross-dock",
        startingResources: { stockDays: 1, autonomyHours: 6, cashHuf: 1_800_000 },
        monthlyRevenueNet: cse.baseRevenueNetHuf,
      };
    }
    return {
      orgKind: "business",
      orgLabel: cse.businessAlias,
      headcount: cse.kind === "saas" ? 18 : 64,
      sizeHint: cse.kind === "saas" ? "18 fős üzem, local-first node" : "64 fős gyártás / flotta",
      startingResources: { cashHuf: cse.kind === "tax" ? MASTER_BASELINE.startingCashHuf : 3_200_000, stockDays: 8 },
      monthlyRevenueNet: cse.baseRevenueNetHuf || MASTER_BASELINE.monthlyRevenueNet,
      inheritedFrom: cse.kind === "tax" ? MASTER_BASELINE.businessAlias : null,
    };
  }
  return {
    orgKind: "business",
    orgLabel: MASTER_BASELINE.businessAlias,
    headcount: MASTER_BASELINE.headcount,
    sizeHint: MASTER_BASELINE.sizeHint,
    startingResources: { cashHuf: MASTER_BASELINE.startingCashHuf, stockDays: MASTER_BASELINE.stockDays },
    monthlyRevenueNet: MASTER_BASELINE.monthlyRevenueNet,
    inheritedFrom: surface.inheritMasterBaseline ? MASTER_BASELINE.businessAlias : null,
  };
}

export function childBaselineFromParent(
  parent: MasterBaselineContext,
  childLabel: string,
): MasterBaselineContext {
  return inheritMasterBaseline(parent, childLabel);
}
