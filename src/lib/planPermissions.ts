import { ACCESS_ROLE, readAccessRole, type AccessRole } from "@/lib/accessRole";
import { isDemoProfileName } from "@/lib/demoSession";
import { readLicense, type LicenseEntitlement } from "@/lib/license";
import {
  ENGINE_VERSION,
  getPlan,
  resolvePlanId,
  type PlanFeatures,
  type PlanId,
} from "@/config/plans";

/** Publikus szerepkör a gatekeeper számára. */
export type PlanActorRole = "SEAT" | "GUEST" | "DEMO";

export type PlanPermission =
  | "RESET_CASE"
  | "RESET_DEMO"
  | "EDIT_MODELS"
  | "SAVE_TO_CLOUD"
  | "EXPORT_RAW"
  | "CONFIGURE_STRUCTURE"
  | "MANAGE_GUESTS"
  | "MULTI_PORTFOLIO"
  | "EXPLORE_SCENARIOS"
  | "BANK_API"
  | "OPTIONAL_SYNC"
  | "RECEIVE_UPDATES";

export type LicenseGate = {
  /** Örökös használat / fizetett entitás érvényes. */
  runtimeOk: boolean;
  /** Motorverzió kompatibilis a licencelt engineVersion-nel. */
  engineOk: boolean;
  /** Frissítési ablak aktív (included years vagy maintenance). */
  updatesActive: boolean;
  engineVersion: string;
  licensedEngineVersion: string | null;
  updatesUntil: string | null;
  licenseExpiryDate: string | null;
  reason: string | null;
};

const FEATURE_BY_PERMISSION: Partial<Record<PlanPermission, keyof PlanFeatures>> = {
  RESET_CASE: "canResetCase",
  RESET_DEMO: "canResetDemo",
  EDIT_MODELS: "canEditModels",
  SAVE_TO_CLOUD: "canSaveToCloud",
  EXPORT_RAW: "canExportRaw",
  CONFIGURE_STRUCTURE: "canConfigureStructure",
  MANAGE_GUESTS: "canManageGuests",
  MULTI_PORTFOLIO: "canMultiPortfolio",
  OPTIONAL_SYNC: "optionalSync",
};

function parseIsoDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const pb = b.split(".").map((x) => Number.parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

export function accessRoleToPlanActor(role: AccessRole, isDemo = false): PlanActorRole {
  if (isDemo) return "DEMO";
  if (role === ACCESS_ROLE.VIEWER_READONLY) return "GUEST";
  return "SEAT";
}

export function resolvePlanActorRole(opts?: {
  accessRole?: AccessRole;
  profileName?: string | null;
  forceDemo?: boolean;
}): PlanActorRole {
  if (opts?.forceDemo) return "DEMO";
  if (opts?.profileName && isDemoProfileName(opts.profileName)) return "DEMO";
  return accessRoleToPlanActor(opts?.accessRole ?? readAccessRole(), false);
}

export function resolveCurrentPlanId(): PlanId {
  const lic = readLicense();
  if (!lic) {
    if (typeof window !== "undefined") {
      const h = window.location.hostname;
      if (/^(localhost|127\.0\.0\.1)$/.test(h)) return "local";
    }
    return "demo";
  }
  return resolvePlanId(lic.tier);
}

/**
 * Verzió- és frissítés-ablak alapú licenckapu (nem havi lejárat).
 * - runtimeOk: örökös használat (paid/local) — lejárat nélkül, kivéve ha licenseExpiryDate meg van adva
 * - engineOk: a futó ENGINE_VERSION ≤ licencelt verzió VAGY updatesActive
 * - updatesActive: updatesUntil a jövőben van
 */
export function evaluateLicenseGate(
  lic: LicenseEntitlement | null = readLicense(),
  engineVersion = ENGINE_VERSION,
): LicenseGate {
  const now = new Date();
  if (!lic) {
    return {
      runtimeOk: false,
      engineOk: false,
      updatesActive: false,
      engineVersion,
      licensedEngineVersion: null,
      updatesUntil: null,
      licenseExpiryDate: null,
      reason: "no_license",
    };
  }

  const statusOk =
    lic.status === "paid" ||
    lic.status === "invoiced" ||
    lic.status === "awaiting_transfer" ||
    lic.status === "local";

  const expiry = parseIsoDate(lic.licenseExpiryDate ?? null);
  const runtimeOk = statusOk && (!expiry || expiry.getTime() >= now.getTime());

  const updatesUntil = parseIsoDate(lic.updatesUntil ?? null);
  const updatesActive = Boolean(updatesUntil && updatesUntil.getTime() >= now.getTime());

  const licensedEngine = lic.engineVersion?.trim() || engineVersion;
  // Frissítés nélkül a motor nem léphet a licencelt verzión túl (JetBrains-szerű).
  const engineOk =
    updatesActive || compareSemver(engineVersion, licensedEngine) <= 0 || lic.status === "local";

  let reason: string | null = null;
  if (!runtimeOk) reason = expiry ? "license_expired" : "license_inactive";
  else if (!engineOk) reason = "engine_version_requires_update_entitlement";

  return {
    runtimeOk,
    engineOk,
    updatesActive,
    engineVersion,
    licensedEngineVersion: licensedEngine,
    updatesUntil: lic.updatesUntil ?? null,
    licenseExpiryDate: lic.licenseExpiryDate ?? null,
    reason,
  };
}

export function hasPermission(
  planId: PlanId,
  role: PlanActorRole,
  permission: PlanPermission,
  lic: LicenseEntitlement | null = readLicense(),
): boolean {
  if (permission === "EXPLORE_SCENARIOS") return true;

  if (role === "GUEST") return false;

  const plan = getPlan(planId);
  const gate = evaluateLicenseGate(lic);

  // Demo / local: teljes feature a plan szerint, verziókapu laza.
  if (planId === "demo" || planId === "local" || lic?.status === "local") {
    if (permission === "RECEIVE_UPDATES") return true;
  } else {
    if (permission === "RECEIVE_UPDATES") return gate.updatesActive;
    // Írás / modell: kell érvényes runtime + kompatibilis engine.
    const writeLike =
      permission === "EDIT_MODELS" ||
      permission === "CONFIGURE_STRUCTURE" ||
      permission === "EXPORT_RAW" ||
      permission === "RESET_CASE" ||
      permission === "MANAGE_GUESTS";
    if (writeLike && (!gate.runtimeOk || !gate.engineOk)) return false;
  }

  if (permission === "BANK_API") return plan.features.bankImport === "api";
  if (permission === "RECEIVE_UPDATES") return gate.updatesActive;

  const featureKey = FEATURE_BY_PERMISSION[permission];
  if (!featureKey) return false;
  return Boolean(plan.features[featureKey]);
}

export function hasCurrentPermission(permission: PlanPermission): boolean {
  return hasPermission(resolveCurrentPlanId(), resolvePlanActorRole(), permission);
}

export function planQuotaLimit(
  planId: PlanId,
  key: "cases" | "slotsPerCase" | "seats" | "guests",
): number | "unlimited" {
  return getPlan(planId).quotas[key];
}
