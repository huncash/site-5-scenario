import { evaluateEntitlement, type EntitlementId } from "@/lib/entitlement";
import type { LicenseEntitlement } from "@/lib/license";
import type { PlanId } from "@/config/plans";
import { resolveLabSurface } from "@/lib/dashboardLabs";

export type LabLicenseLed = "green" | "red";
export type LabBerryClickKind = "pin" | "funnel";

export function labLicenseLed(entitled: boolean): LabLicenseLed {
  return entitled ? "green" : "red";
}

export function labEyeOpen(input: { entitled: boolean; pipedToDashboard: boolean }): boolean {
  return resolveLabSurface(input).onDashboard;
}

export function labBerryClickKind(entitled: boolean): LabBerryClickKind {
  return entitled ? "pin" : "funnel";
}

/** Piros LED: a modul saját értékesítési / pénztári útja. */
export function labModuleFunnelHref(
  id: EntitlementId,
  opts?: { license?: LicenseEntitlement | null; planId?: PlanId },
): string {
  const decision = evaluateEntitlement(id, opts);
  return decision.ok ? "" : decision.checkoutHref;
}
