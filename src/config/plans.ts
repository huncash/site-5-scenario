/**
 * Csomagok és jogosultságok — Single Source of Truth.
 * Üzleti modell: Perpetual (örökös licenc + opcionális éves frissítés) + JIT modulok.
 *
 * Kapacitás-elv: a kvóták az *egyidejűleg aktív* Case-ek és Slotok (éles munkaterületek)
 * számát korlátozzák — nem a felhalmozott / valaha importált adatok mennyiségét.
 * Inaktív Case/Slot törölhető vagy felülírható díj nélkül; új párhuzamos éles
 * munkaterülethez JIT add-on (Case / Slot / Seat) vásárolható.
 */

export type PublicPlanId = "starter" | "pro" | "expert";
export type PlanId = PublicPlanId | "campus" | "demo" | "local";

export type QuotaCount = number | "unlimited";

/** Egyidejűleg aktív (concurrent) munkaterület-keretek. */
export type PlanQuotas = {
  /** Egyidejűleg aktív Case-ek (projektek) száma. */
  cases: QuotaCount;
  /** Egyidejűleg aktív Slotok Case-enként. */
  slotsPerCase: number;
  seats: number;
  guests: number;
  bankAccountsPerSlot: number | "unlimited";
};

export type BankImportMode = "single" | "multi" | "api";
export type ProScenarioLevel = "basic" | "advanced" | "org_audit";
export type LicenseModel = "perpetual" | "custom" | "token" | "demo";

export type PlanFeatures = {
  canResetCase: boolean;
  canResetDemo: boolean;
  canSaveToCloud: boolean;
  canEditModels: boolean;
  canExportRaw: boolean;
  canConfigureStructure: boolean;
  canManageGuests: boolean;
  canMultiPortfolio: boolean;
  optionalSync: boolean;
  bankImport: BankImportMode;
  proLevel: ProScenarioLevel;
  /** Dedikált offline / egyedi integráció (Enterprise). */
  dedicatedOfflineIntegration: boolean;
};

/** Nettó listaár Ft + tájékoztató EUR. */
export type MoneyPair = { huf: number; eur: number };

/**
 * 3 éves lépcsőzetes hűség (Tiered Loyalty Perpetual).
 * Kedvezmény mindig az 1. évi alapárhoz viszonyított fix arány (nem kamatos):
 * Y1 = 100%, Y2 = 75% (−25%), Y3 = 60% (−40%), Y4+ = 0.
 */
export type LoyaltyLadder = {
  year1: MoneyPair;
  year2: MoneyPair;
  year3: MoneyPair;
  lifetimeFreeFromYear: 4;
};

/** Az 1. évi alapár hányada — SSOT a hűségdíjakhoz. */
export const LOYALTY_SHARE_OF_YEAR1 = {
  year1: 1,
  year2: 0.75,
  year3: 0.6,
  year4Plus: 0,
} as const;

/** Hűség Ft: legközelebbi 1000 Ft (199k→149k / 119k). */
export function roundLoyaltyHuf(n: number): number {
  return Math.round(n / 1000) * 1000;
}

/** Y2 / Y3 frissítési díj az 1. évi alapárból (fix %, nem halmozott). */
export function loyaltyFeesFromYear1Huf(year1Huf: number): { y2: number; y3: number; y4: 0 } {
  return {
    y2: roundLoyaltyHuf(year1Huf * LOYALTY_SHARE_OF_YEAR1.year2),
    y3: roundLoyaltyHuf(year1Huf * LOYALTY_SHARE_OF_YEAR1.year3),
    y4: 0,
  };
}

export function buildLoyaltyLadder(year1: MoneyPair): LoyaltyLadder {
  const fees = loyaltyFeesFromYear1Huf(year1.huf);
  return {
    year1,
    year2: {
      huf: fees.y2,
      eur: Math.round(year1.eur * LOYALTY_SHARE_OF_YEAR1.year2),
    },
    year3: {
      huf: fees.y3,
      eur: Math.round(year1.eur * LOYALTY_SHARE_OF_YEAR1.year3),
    },
    lifetimeFreeFromYear: 4,
  };
}

export type PlanConfig = {
  id: PlanId;
  public: boolean;
  label: string;
  badge?: "recommended";
  licenseModel: LicenseModel;
  /** Egyedi árazás (nincs publikus listaár). */
  customPricing: boolean;
  /** 1. évi hűség-licenc / vásárlás (nettó Ft) — megegyezik loyaltyLadder.year1.huf-fal. */
  priceHuf: number;
  /** 1. évi hűség-licenc (EUR, tájékoztató). */
  priceEur: number;
  /**
   * @deprecated Havi előfizetés kivezetve — campus token díjhoz / legacy façade.
   * Perpetual csomagoknál 0.
   */
  monthlyPriceHuf: number;
  /** Első N év frissítés a licencben (hűségmodell: 1). */
  includedUpdateYears: number;
  /**
   * @deprecated Használd: loyaltyLadder.year2 — legacy façade (2. évi frissítés).
   */
  annualMaintenanceHuf: number | null;
  /** Lépcsőzetes hűségárak; null = nincs (campus / demo / local). */
  loyaltyLadder: LoyaltyLadder | null;
  quotas: PlanQuotas;
  features: PlanFeatures;
};

export type JitAddonId =
  | "case_plus_1"
  | "slot_plus_1"
  | "seat_plus_1"
  | "guest_plus_1"
  | "edge_sensor";

/** Aktuális motor / engine verzió (licenc kompatibilitás). */
export const ENGINE_VERSION = "0.1.4";

/** @deprecated Perpetual modellben nincs éves előfizetés-kedvezmény. */
export const YEARLY_DISCOUNT_PCT = 0;

/** JIT örökös modulok — nincs havi elköteleződés. */
export const JIT_ADDON_MIN_COMMITMENT_DAYS = 0;
export const MAX_REFERRAL_GIFT_SLOTS = 25;

/** Soft cap unlimited Case mellett a slot-ledger alsó határhoz (Case × Slot/Case). */
const UNLIMITED_CASES_SOFT = 24;

/** JIT egységárak (nettó Ft / örökös modul) — Pro Case upsell listaár. */
export const JIT_ADDON_PRICES: Record<JitAddonId, number> = {
  case_plus_1: 49_000,
  slot_plus_1: 49_000,
  seat_plus_1: 79_000,
  guest_plus_1: 19_000,
  edge_sensor: 99_000,
};

/** Enterprise önkiszolgáló Case modul (eltér a Pro Case upsell-től). */
export const ENTERPRISE_CASE_ADDON_HUF = 39_000;

export function jitAddonPriceForPlan(addon: JitAddonId, planId: PlanId): number {
  if (addon === "case_plus_1" && planId === "expert") return ENTERPRISE_CASE_ADDON_HUF;
  return JIT_ADDON_PRICES[addon];
}

const PUBLIC_FEATURES_BASE = {
  canResetCase: true,
  canResetDemo: false,
  canSaveToCloud: false,
  canEditModels: true,
  canExportRaw: true,
  canConfigureStructure: true,
  canManageGuests: true,
  canMultiPortfolio: false,
  optionalSync: false,
  dedicatedOfflineIntegration: false,
} as const;

const LOYALTY_STARTER = buildLoyaltyLadder({ huf: 199_000, eur: 199 });
const LOYALTY_PRO = buildLoyaltyLadder({ huf: 399_000, eur: 399 });
const LOYALTY_ENTERPRISE = buildLoyaltyLadder({ huf: 799_000, eur: 799 });

export const PLANS_CONFIG: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    public: true,
    label: "Solo",
    licenseModel: "perpetual",
    customPricing: false,
    priceHuf: LOYALTY_STARTER.year1.huf,
    priceEur: LOYALTY_STARTER.year1.eur,
    monthlyPriceHuf: 0,
    includedUpdateYears: 1,
    annualMaintenanceHuf: LOYALTY_STARTER.year2.huf,
    loyaltyLadder: LOYALTY_STARTER,
    quotas: { cases: 1, slotsPerCase: 3, seats: 1, guests: 1, bankAccountsPerSlot: 1 },
    features: {
      ...PUBLIC_FEATURES_BASE,
      bankImport: "single",
      proLevel: "basic",
    },
  },
  pro: {
    id: "pro",
    public: true,
    label: "Pro Szcenárió",
    badge: "recommended",
    licenseModel: "perpetual",
    customPricing: false,
    priceHuf: LOYALTY_PRO.year1.huf,
    priceEur: LOYALTY_PRO.year1.eur,
    monthlyPriceHuf: 0,
    includedUpdateYears: 1,
    annualMaintenanceHuf: LOYALTY_PRO.year2.huf,
    loyaltyLadder: LOYALTY_PRO,
    quotas: { cases: 2, slotsPerCase: 3, seats: 1, guests: 5, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      bankImport: "multi",
      proLevel: "advanced",
    },
  },
  expert: {
    id: "expert",
    public: true,
    label: "Enterprise & Csapatok",
    licenseModel: "perpetual",
    customPricing: false,
    priceHuf: LOYALTY_ENTERPRISE.year1.huf,
    priceEur: LOYALTY_ENTERPRISE.year1.eur,
    monthlyPriceHuf: 0,
    includedUpdateYears: 1,
    annualMaintenanceHuf: LOYALTY_ENTERPRISE.year2.huf,
    loyaltyLadder: LOYALTY_ENTERPRISE,
    quotas: { cases: 5, slotsPerCase: 4, seats: 3, guests: 20, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      canMultiPortfolio: true,
      canSaveToCloud: true,
      optionalSync: true,
      dedicatedOfflineIntegration: true,
      bankImport: "api",
      proLevel: "org_audit",
    },
  },
  campus: {
    id: "campus",
    public: false,
    label: "Campus",
    licenseModel: "token",
    customPricing: false,
    priceHuf: 0,
    priceEur: 0,
    monthlyPriceHuf: 1_490,
    includedUpdateYears: 0,
    annualMaintenanceHuf: null,
    loyaltyLadder: null,
    quotas: { cases: 1, slotsPerCase: 5, seats: 1, guests: 1, bankAccountsPerSlot: 1 },
    features: {
      ...PUBLIC_FEATURES_BASE,
      canManageGuests: true,
      bankImport: "single",
      proLevel: "basic",
    },
  },
  demo: {
    id: "demo",
    public: false,
    label: "Demo",
    licenseModel: "demo",
    customPricing: false,
    priceHuf: 0,
    priceEur: 0,
    monthlyPriceHuf: 0,
    includedUpdateYears: 0,
    annualMaintenanceHuf: null,
    loyaltyLadder: null,
    quotas: { cases: 1, slotsPerCase: 3, seats: 1, guests: 0, bankAccountsPerSlot: 1 },
    features: {
      canResetCase: true,
      canResetDemo: true,
      canSaveToCloud: false,
      canEditModels: true,
      canExportRaw: false,
      canConfigureStructure: true,
      canManageGuests: false,
      canMultiPortfolio: false,
      optionalSync: false,
      dedicatedOfflineIntegration: false,
      bankImport: "single",
      proLevel: "basic",
    },
  },
  local: {
    id: "local",
    public: false,
    label: "Local",
    licenseModel: "perpetual",
    customPricing: false,
    priceHuf: 0,
    priceEur: 0,
    monthlyPriceHuf: 0,
    includedUpdateYears: 99,
    annualMaintenanceHuf: null,
    loyaltyLadder: null,
    quotas: { cases: "unlimited", slotsPerCase: 4, seats: 3, guests: 20, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      canResetDemo: true,
      canMultiPortfolio: true,
      canSaveToCloud: true,
      optionalSync: true,
      dedicatedOfflineIntegration: true,
      bankImport: "api",
      proLevel: "org_audit",
    },
  },
};

export const PUBLIC_PLAN_IDS: PublicPlanId[] = ["starter", "pro", "expert"];

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === "string" && v in PLANS_CONFIG;
}

export function isPublicPlanId(v: unknown): v is PublicPlanId {
  return v === "starter" || v === "pro" || v === "expert";
}

export function getPlan(id: PlanId): PlanConfig {
  return PLANS_CONFIG[id];
}

export function getPublicPlans(): PlanConfig[] {
  return PUBLIC_PLAN_IDS.map((id) => PLANS_CONFIG[id]);
}

export function formatQuota(n: QuotaCount): string {
  return n === "unlimited" ? "∞" : String(n);
}

/** Slot-ledger alsó határ (Case × Slot/Case; unlimited Case → soft cap). */
export function totalSlots(plan: PlanConfig): number {
  const cases = plan.quotas.cases === "unlimited" ? UNLIMITED_CASES_SOFT : plan.quotas.cases;
  return cases * plan.quotas.slotsPerCase;
}

/** @deprecated Perpetual: egyösszegű ár = priceHuf; ez passthrough a legacy hívókhoz. */
export function yearlyPriceHuf(huf: number): number {
  return huf;
}

export function resolvePlanId(tier: string | null | undefined): PlanId {
  if (tier === "starter" || tier === "pro" || tier === "expert" || tier === "campus") return tier;
  if (tier === "demo") return "demo";
  if (!tier || tier === "local") return "local";
  return "local";
}

export function planQuotas(id: PlanId): PlanQuotas {
  return PLANS_CONFIG[id].quotas;
}

export function planFeatures(id: PlanId): PlanFeatures {
  return PLANS_CONFIG[id].features;
}

export function planPriceHuf(id: PlanId): number {
  return PLANS_CONFIG[id].priceHuf;
}

/** @deprecated Használd: planPriceHuf. */
export function planMonthlyPriceHuf(id: PlanId): number {
  return PLANS_CONFIG[id].monthlyPriceHuf;
}

export function compareQuota(a: QuotaCount, b: number): boolean {
  if (a === "unlimited") return true;
  return b <= a;
}

/** Hűségév szerinti frissítési díj (1–3); 4+ → 0 (Lifetime Free). */
export function loyaltyFeeForYear(plan: PlanConfig, year: number): MoneyPair | null {
  const L = plan.loyaltyLadder;
  if (!L) return null;
  if (year <= 1) return L.year1;
  if (year === 2) return L.year2;
  if (year === 3) return L.year3;
  return { huf: 0, eur: 0 };
}

/** Havi egyenletes frissítési bevétel a 36 hónapos szimulációhoz (Y2 / Y3; Y4+ = 0). */
export function loyaltyMonthlyRenewalHuf(plan: PlanConfig, month: number): number {
  const L = plan.loyaltyLadder;
  if (!L || month <= 12) return 0;
  if (month <= 24) return L.year2.huf / 12;
  if (month <= 36) return L.year3.huf / 12;
  return 0;
}

export function hasLoyaltyLadder(plan: PlanConfig): boolean {
  return plan.loyaltyLadder != null;
}
