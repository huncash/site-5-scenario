/** Poka-Yoke hozzáférés: szerkesztő vs. ingyenes olvasói vendég. */

export const ACCESS_ROLE = {
  OWNER_EDITOR: "OWNER_EDITOR",
  VIEWER_READONLY: "VIEWER_READONLY",
} as const;

export type AccessRole = (typeof ACCESS_ROLE)[keyof typeof ACCESS_ROLE];

const ROLE_KEY = "szcenario_access_role_v1";
const VIEWER_TOKEN_KEY = "szcenario_viewer_token_v1";

export function isAccessRole(v: unknown): v is AccessRole {
  return v === ACCESS_ROLE.OWNER_EDITOR || v === ACCESS_ROLE.VIEWER_READONLY;
}

export function readAccessRole(): AccessRole {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(ROLE_KEY) : null;
    if (isAccessRole(raw)) return raw;
  } catch {
    // ignore
  }
  return ACCESS_ROLE.OWNER_EDITOR;
}

export function writeAccessRole(role: AccessRole): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
    window.dispatchEvent(new CustomEvent("szcenario:access_role", { detail: { role } }));
  } catch {
    // ignore
  }
}

export function clearAccessRole(): void {
  try {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(VIEWER_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent("szcenario:access_role", { detail: { role: ACCESS_ROLE.OWNER_EDITOR } }));
  } catch {
    // ignore
  }
}

export function readViewerToken(): string | null {
  try {
    return localStorage.getItem(VIEWER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeViewerToken(token: string): void {
  try {
    localStorage.setItem(VIEWER_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function isViewerReadonly(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.VIEWER_READONLY;
}

/** Adatbevitel, módosítás, törlés — olvasónál tiltva. */
export function canMutateData(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.OWNER_EDITOR;
}

/** Nyers JSON/CSV export és szerkezeti konfiguráció — olvasónál tiltva. */
export function canExportRaw(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.OWNER_EDITOR;
}

export function canConfigureStructure(role: AccessRole = readAccessRole()): boolean {
  return role === ACCESS_ROLE.OWNER_EDITOR;
}

/** Szcenárióváltás, csúszkák, elemzés — olvasónál is. */
export function canExploreScenarios(role: AccessRole = readAccessRole()): boolean {
  void role;
  return true;
}

export function denyMutateIfViewer(role: AccessRole = readAccessRole()): boolean {
  return isViewerReadonly(role);
}
