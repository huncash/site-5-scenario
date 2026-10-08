import { licensedEngines } from "@/lib/engineFrames";
import { labLicenseLed, type LabLicenseLed } from "@/lib/labBerrySignals";
import { isLabsEngineId, type LabsEngineId } from "@/lib/labsTechTree";
import { readLicense, type LicenseEntitlement } from "@/lib/license";
import { supportPricingHref } from "@/lib/support";

export const ENGINE_VIEW_EVENT = "szcenario:engine-view";
export const ENGINE_VIEW_STORAGE_KEY = "ui:engineViewFocus";
export const LABS_MESH_DESK_PATH = "/labs/desk";

export type EngineViewFocus = LabsEngineId;

export function clampEngineViewFocus(
  id: EngineViewFocus,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): EngineViewFocus {
  return isEngineLicensed(id, lic) ? id : "economic";
}

export function readEngineViewFocus(
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): EngineViewFocus {
  if (typeof window === "undefined") return "economic";
  try {
    const raw = window.localStorage.getItem(ENGINE_VIEW_STORAGE_KEY);
    if (raw && isLabsEngineId(raw)) return clampEngineViewFocus(raw, lic);
  } catch {
    // ignore
  }
  return "economic";
}

export function writeEngineViewFocus(
  id: EngineViewFocus,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): EngineViewFocus {
  const next = clampEngineViewFocus(id, lic);
  if (typeof window === "undefined") return next;
  try {
    window.localStorage.setItem(ENGINE_VIEW_STORAGE_KEY, next);
    window.dispatchEvent(new CustomEvent(ENGINE_VIEW_EVENT, { detail: next }));
  } catch {
    // ignore
  }
  return next;
}

export const ENGINE_SECTION_ID: Record<LabsEngineId, string> = {
  economic: "engine-economic-section",
  education: "engine-edu-section",
  resilience: "engine-bcp-section",
};

export function scrollEngineSection(id: EngineViewFocus): void {
  if (typeof document === "undefined") return;
  const el =
    document.getElementById(ENGINE_SECTION_ID[id]) ??
    document.getElementById(ENGINE_SECTION_ID.economic);
  el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/** Stabil dashboard: egyszerre egy motor nézet. A mesh asztal külön kísérlet. */
export function exclusiveEngineView(focus: EngineViewFocus, candidate: LabsEngineId): boolean {
  return focus === candidate;
}

/** Motor-szem: csak licencelt motor lehet látó — a választott nyílik, a komplementer zár. */
export function applyExclusiveEngineEye(
  current: EngineViewFocus,
  pick: LabsEngineId,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): EngineViewFocus {
  if (isEngineLicensed(pick, lic)) return pick;
  if (isEngineLicensed(current, lic)) return current;
  return "economic";
}

export function engineEyeOpen(
  focus: EngineViewFocus,
  id: LabsEngineId,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): boolean {
  return isEngineLicensed(id, lic) && exclusiveEngineView(focus, id);
}

export function isEngineLicensed(
  id: LabsEngineId,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): boolean {
  return licensedEngines(lic !== undefined ? (lic as LicenseEntitlement) : readLicense()).includes(id);
}

export function engineLicenseLed(
  id: LabsEngineId,
  lic?: Pick<LicenseEntitlement, "engines"> | null,
): LabLicenseLed {
  return labLicenseLed(isEngineLicensed(id, lic));
}

export function engineFunnelHref(id: LabsEngineId): string {
  if (id === "economic") return "";
  if (id === "resilience") return supportPricingHref("bcp");
  return supportPricingHref("education-engine");
}
