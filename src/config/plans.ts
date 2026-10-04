/**
 * Csomagok és jogosultságok — Single Source of Truth.
 * Korlátok, jogok és listaárak innen táplálják a UI-t, kapacitást és gatekeeper-t.
 */

export type PublicPlanId = "starter" | "pro" | "expert";
export type PlanId = PublicPlanId | "campus" | "demo" | "local";

export type PlanQuotas = {
  cases: number;
  slotsPerCase: number;
  seats: number;
  guests: number;
  bankAccountsPerSlot: number | "unlimited";
};

export type BankImportMode = "single" | "multi" | "api";
export type ProScenarioLevel = "basic" | "advanced" | "org_audit";

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
};

export type PlanConfig = {
  id: PlanId;
  /** Nyilvános árazási mátrixban megjelenik. */
  public: boolean;
  label: string;
  badge?: "recommended";
  /** Nettó Ft / hó. */
  monthlyPriceHuf: number;
  quotas: PlanQuotas;
  features: PlanFeatures;
};

export type JitAddonId = "case_plus_1" | "slot_plus_1" | "seat_plus_1" | "guest_plus_1";

export const YEARLY_DISCOUNT_PCT = 15;
export const JIT_ADDON_MIN_COMMITMENT_DAYS = 30;
export const MAX_REFERRAL_GIFT_SLOTS = 25;

/** JIT egységárak (nettó Ft / hó / db). */
export const JIT_ADDON_PRICES: Record<JitAddonId, number> = {
  case_plus_1: 4_900,
  slot_plus_1: 2_900,
  seat_plus_1: 6_900,
  guest_plus_1: 1_200,
};

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
} as const;

export const PLANS_CONFIG: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    public: true,
    label: "Basic",
    monthlyPriceHuf: 8_900,
    quotas: { cases: 1, slotsPerCase: 2, seats: 1, guests: 1, bankAccountsPerSlot: 1 },
    features: {
      ...PUBLIC_FEATURES_BASE,
      bankImport: "single",
      proLevel: "basic",
    },
  },
  pro: {
    id: "pro",
    public: true,
    label: "Pro",
    badge: "recommended",
    monthlyPriceHuf: 24_420,
    quotas: { cases: 2, slotsPerCase: 4, seats: 1, guests: 5, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      bankImport: "multi",
      proLevel: "advanced",
    },
  },
  expert: {
    id: "expert",
    public: true,
    label: "Enterprise",
    monthlyPriceHuf: 59_000,
    quotas: { cases: 5, slotsPerCase: 8, seats: 3, guests: 20, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      canMultiPortfolio: true,
      canSaveToCloud: true,
      optionalSync: true,
      bankImport: "api",
      proLevel: "org_audit",
    },
  },
  campus: {
    id: "campus",
    public: false,
    label: "Campus",
    monthlyPriceHuf: 1_490,
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
    monthlyPriceHuf: 0,
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
      bankImport: "single",
      proLevel: "basic",
    },
  },
  local: {
    id: "local",
    public: false,
    label: "Local",
    monthlyPriceHuf: 0,
    /** Összes Slot = 8 (korábbi local ledger alsó határ). */
    quotas: { cases: 2, slotsPerCase: 4, seats: 3, guests: 20, bankAccountsPerSlot: "unlimited" },
    features: {
      ...PUBLIC_FEATURES_BASE,
      canResetDemo: true,
      canMultiPortfolio: true,
      canSaveToCloud: true,
      optionalSync: true,
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

export function totalSlots(plan: PlanConfig): number {
  return plan.quotas.cases * plan.quotas.slotsPerCase;
}

export function yearlyPriceHuf(monthlyHuf: number): number {
  return Math.round(monthlyHuf * 12 * (1 - YEARLY_DISCOUNT_PCT / 100));
}

/** License / ledger tier string → PlanId. */
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

export function planMonthlyPriceHuf(id: PlanId): number {
  return PLANS_CONFIG[id].monthlyPriceHuf;
}
