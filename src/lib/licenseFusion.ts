/**
 * Off-grid instance-zár: egy helyi adatbázis = egy licenc token.
 * Két token Case / Slot / Edge kerete nem olvadhat össze (nincs házi Enterprise).
 */

export const INSTANCE_BIND_KEY = "szcenario_instance_bind_v1";
export const LICENSE_STORAGE_KEY = "szcenario_license_v1";
export const INSTANCE_DB_NAME = "finance-vault";
export const INSTANCE_MESH_NS = "mesh-repo";
export const FUSION_LOG_PREFIX = "[szcenario:license-fusion]";

export const FUSION_ERROR_HU =
  "Érvénytelen fúzió: két külön licenc tokenje nem olvadhat össze egy Case-ben. Az instance a saját helyi adatbázisához kötött — a Case / Slot / Edge bővítés csak a kötött token keretében érvényes.";

export type InstanceBind = {
  token: string;
  boundAt: string;
  dbName: string;
  meshNamespace: string;
};

export type FusionDecision =
  | { ok: true; mode: "bind" | "refresh" }
  | {
      ok: false;
      reason: "token_mismatch" | "empty_token";
      boundToken: string;
      incomingToken: string;
      message: string;
    };

let lastFusion: Extract<FusionDecision, { ok: false }> | null = null;

function memory(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function maskLicenseToken(token: string): string {
  const t = token.trim();
  if (t.length <= 6) return "…";
  return `${t.slice(0, 4)}…${t.slice(-2)}`;
}

/** Stabil ujjlenyomat — a nyers token nem megy mesh/hello üzenetbe. */
export function licenseFingerprint(token: string): string {
  const s = token.trim();
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function peekLicenseToken(): string | null {
  const s = memory();
  if (!s) return null;
  try {
    const raw = s.getItem(LICENSE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: unknown };
    return typeof parsed.token === "string" && parsed.token.trim() ? parsed.token.trim() : null;
  } catch {
    return null;
  }
}

export function readInstanceBind(): InstanceBind | null {
  const s = memory();
  if (!s) return null;
  try {
    const raw = s.getItem(INSTANCE_BIND_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InstanceBind;
      if (parsed?.token?.trim()) return parsed;
    }
  } catch {
    // fall through to hydrate
  }
  const token = peekLicenseToken();
  if (!token) return null;
  const hydrated: InstanceBind = {
    token,
    boundAt: new Date().toISOString(),
    dbName: INSTANCE_DB_NAME,
    meshNamespace: INSTANCE_MESH_NS,
  };
  writeInstanceBind(hydrated);
  return hydrated;
}

export function writeInstanceBind(bind: InstanceBind): void {
  const s = memory();
  if (!s) return;
  s.setItem(INSTANCE_BIND_KEY, JSON.stringify(bind));
}

/** Csak teljes instance-törlés / teszt. A sima licenc-törlés NEM hívja. */
export function clearInstanceBind(): void {
  memory()?.removeItem(INSTANCE_BIND_KEY);
}

export function resolveBoundToken(): string | null {
  const bind = readInstanceBind();
  return bind?.token?.trim() || peekLicenseToken();
}

export function currentLicenseFingerprint(): string | null {
  const token = resolveBoundToken();
  return token ? licenseFingerprint(token) : null;
}

export function lastLicenseFusionError(): string | null {
  return lastFusion?.message ?? null;
}

export function lastLicenseFusion(): Extract<FusionDecision, { ok: false }> | null {
  return lastFusion;
}

export function evaluateLicenseWrite(input: {
  incomingToken: string;
  boundToken?: string | null;
  currentToken?: string | null;
}): FusionDecision {
  const incoming = input.incomingToken.trim();
  const bound = (input.boundToken ?? input.currentToken ?? "").trim();
  if (!incoming) {
    return {
      ok: false,
      reason: "empty_token",
      boundToken: bound,
      incomingToken: incoming,
      message: FUSION_ERROR_HU,
    };
  }
  if (!bound) return { ok: true, mode: "bind" };
  if (bound === incoming) return { ok: true, mode: "refresh" };
  return {
    ok: false,
    reason: "token_mismatch",
    boundToken: bound,
    incomingToken: incoming,
    message: FUSION_ERROR_HU,
  };
}

export function logFusionAttempt(decision: Extract<FusionDecision, { ok: false }>): void {
  lastFusion = decision;
  const payload = {
    reason: decision.reason,
    boundToken: maskLicenseToken(decision.boundToken),
    incomingToken: maskLicenseToken(decision.incomingToken),
    dbName: INSTANCE_DB_NAME,
    meshNamespace: INSTANCE_MESH_NS,
  };
  console.error(FUSION_LOG_PREFIX, decision.message, payload);
}

export function admitLicenseToken(incomingToken: string): FusionDecision {
  const bound = resolveBoundToken();
  const decision = evaluateLicenseWrite({
    incomingToken,
    boundToken: bound,
    currentToken: bound,
  });
  if (!decision.ok) {
    logFusionAttempt(decision);
    return decision;
  }
  lastFusion = null;
  if (decision.mode === "bind") {
    writeInstanceBind({
      token: incomingToken.trim(),
      boundAt: new Date().toISOString(),
      dbName: INSTANCE_DB_NAME,
      meshNamespace: INSTANCE_MESH_NS,
    });
  }
  return decision;
}

/** Idegen mesh-node Case-adata nem kerül a helyi instance-be. */
export function allowRemoteMeshPayload(remoteFp?: string | null): boolean {
  const localFp = currentLicenseFingerprint();
  if (!remoteFp || !localFp) return true;
  if (remoteFp === localFp) return true;
  logFusionAttempt({
    ok: false,
    reason: "token_mismatch",
    boundToken: localFp,
    incomingToken: remoteFp,
    message: FUSION_ERROR_HU,
  });
  return false;
}
