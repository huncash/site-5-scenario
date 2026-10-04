import { ACCESS_ROLE, readAccessRole, type AccessRole } from "@/lib/accessRole";
import { isDemoProfileName } from "@/lib/demoSession";
import { readLicense } from "@/lib/license";
import {
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
  | "OPTIONAL_SYNC";

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

export function hasPermission(
  planId: PlanId,
  role: PlanActorRole,
  permission: PlanPermission,
): boolean {
  if (permission === "EXPLORE_SCENARIOS") return true;

  // Guest: csak olvasás / nézelődés.
  if (role === "GUEST") return false;

  const plan = getPlan(planId);
  const { features } = plan;

  if (permission === "BANK_API") return features.bankImport === "api";

  const featureKey = FEATURE_BY_PERMISSION[permission];
  if (!featureKey) return false;
  return Boolean(features[featureKey]);
}

export function hasCurrentPermission(permission: PlanPermission): boolean {
  return hasPermission(resolveCurrentPlanId(), resolvePlanActorRole(), permission);
}

export function planQuotaLimit(
  planId: PlanId,
  key: "cases" | "slotsPerCase" | "seats" | "guests",
): number {
  return getPlan(planId).quotas[key];
}
