import { MAINTENANCE_MODE, maintenanceModeFromEnv } from "@/lib/maintenanceMode";

/**
 * Hétvégi kapu — a nyilvános felület elé.
 * Élesítés: `MAINTENANCE_MODE = false`, vagy `VITE_MAINTENANCE_MODE=0`.
 */
export { MAINTENANCE_MODE };
export const CONSTRUCTION_GATE_ON = MAINTENANCE_MODE;

export const CONSTRUCTION_EVENT = "szcenario:construction-gate";

/** A kérés szerinti munkamenet-jelző. Önmagában nem elég — kell a proof is. */
export const ADMIN_AUTH_FLAG = "is_admin_authenticated";
export const ADMIN_PROOF_KEY = "szcenario_admin_proof";
export const CONSTRUCTION_SESSION_KEY = ADMIN_AUTH_FLAG;

/** sha256 — a kulcs nincs a forrásban. Teszt / hétvégi fallback: SzcenarioHetvege */
const FALLBACK_ADMIN_HASH = "fa6b4f6194628e64f90b5b75e7bed0229e9378c1e6babc6afe0c2cbc68dbeb67";

let memAuth = false;
let memProof = "";

export function constructionGateOn(): boolean {
  return maintenanceModeOn();
}

export function maintenanceModeOn(): boolean {
  const meta = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const proc = typeof process !== "undefined" ? process.env : undefined;
  const raw =
    meta?.VITE_MAINTENANCE_MODE ||
    meta?.VITE_CONSTRUCTION_GATE ||
    proc?.VITE_MAINTENANCE_MODE ||
    proc?.MAINTENANCE_MODE ||
    proc?.VITE_CONSTRUCTION_GATE ||
    "";
  return maintenanceModeFromEnv(raw);
}

function injectedAdminHash(): string {
  try {
    return String(typeof __MAINTENANCE_ADMIN_HASH__ === "string" ? __MAINTENANCE_ADMIN_HASH__ : "")
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

function acceptedHashes(): string[] {
  return [FALLBACK_ADMIN_HASH, injectedAdminHash()].filter(Boolean);
}

function readStore(key: string): string | null {
  if (typeof window !== "undefined") {
    try {
      const v = window.localStorage.getItem(key);
      if (v != null) return v;
    } catch {
      /* ignore */
    }
  }
  if (key === ADMIN_AUTH_FLAG) return memAuth ? "true" : null;
  if (key === ADMIN_PROOF_KEY) return memProof || null;
  return null;
}

function writeStore(key: string, value: string | null) {
  if (typeof window !== "undefined") {
    try {
      if (value == null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch {
      /* ignore */
    }
  }
  if (key === ADMIN_AUTH_FLAG) memAuth = value === "true";
  if (key === ADMIN_PROOF_KEY) memProof = value ?? "";
}

function writeAuthCookie(on: boolean) {
  if (typeof document === "undefined") return;
  document.cookie = on
    ? `${ADMIN_AUTH_FLAG}=true; Path=/; SameSite=Lax; Max-Age=604800`
    : `${ADMIN_AUTH_FLAG}=; Path=/; Max-Age=0`;
}

export function isConstructionUnlocked(): boolean {
  const flag = readStore(ADMIN_AUTH_FLAG) === "true";
  const proof = String(readStore(ADMIN_PROOF_KEY) ?? "").trim().toLowerCase();
  return flag && acceptedHashes().includes(proof);
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CONSTRUCTION_EVENT));
}

function stamp(proof: string) {
  writeStore(ADMIN_AUTH_FLAG, "true");
  writeStore(ADMIN_PROOF_KEY, proof);
  writeAuthCookie(true);
  emit();
}

export function lockConstructionGate() {
  writeStore(ADMIN_AUTH_FLAG, null);
  writeStore(ADMIN_PROOF_KEY, null);
  writeAuthCookie(false);
  emit();
}

export async function tryConstructionUnlock(pass: string): Promise<boolean> {
  const typed = pass.trim();
  if (!typed) return false;
  const { sha256Hex } = await import("@/lib/hash");
  const digest = (await sha256Hex(typed)).toLowerCase();
  if (acceptedHashes().includes(digest)) {
    stamp(digest);
    return true;
  }
  return false;
}

export function isAdminEntryPath(pathname?: string): boolean {
  const raw =
    pathname ??
    (typeof window === "undefined" ? "" : window.location.pathname);
  const p = raw.replace(/\/+$/, "") || "/";
  if (p === "/admin") return true;
  if (typeof window !== "undefined" && window.location.hash.replace(/^#/, "") === "admin") {
    return true;
  }
  return false;
}
