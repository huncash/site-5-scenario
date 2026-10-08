/**
 * Poka-Yoke SSOT: vendég ki a gépházból és a nyers másolatból,
 * egyirányú gazdasági→motor csatorna, helyi .szc vágólap — nincs hálózat.
 */
import { ACCESS_ROLE, canExportRaw, canMutateData, type AccessRole } from "@/lib/accessRole";
import {
  bcpWriteAllowed,
  resolveBcpViewMode,
  type BcpViewMode,
} from "@/lib/bcpEconomicOverlay";

export const POKA_YOKE_LOCK_V = 1 as const;

export const POKA_YOKE_LOCK = Object.freeze({
  v: POKA_YOKE_LOCK_V,
  guestEngineRoom: false,
  guestRawCopy: false,
  guestDisableAnonymizer: false,
  oneWayEducation: "anonymized" as const,
  oneWayBcp: "read_overlay" as const,
  reverseBlocked: true,
  szcClipboardLocal: true,
  szcNetwork: false,
});

export type PokaYokeLockSnapshot = typeof POKA_YOKE_LOCK;

let cachedBcpMode: BcpViewMode = "isolated";

export function rememberBcpViewMode(mode: BcpViewMode): void {
  cachedBcpMode = mode;
}

export function readCachedBcpViewMode(): BcpViewMode {
  return cachedBcpMode;
}

export function effectiveBcpViewMode(
  overlayOn: boolean,
  engineRoomOn: boolean,
  role: AccessRole,
): BcpViewMode {
  const raw = resolveBcpViewMode(overlayOn, engineRoomOn);
  if (role === ACCESS_ROLE.VIEWER_READONLY && raw === "engine-room") {
    return overlayOn ? "overlay" : "isolated";
  }
  return raw;
}

export function economicLayerWriteAllowed(
  mode: BcpViewMode = cachedBcpMode,
  role?: AccessRole,
): boolean {
  if (!canMutateData(role)) return false;
  return bcpWriteAllowed(mode);
}

export function rawCopyAllowed(role?: AccessRole): boolean {
  return canExportRaw(role);
}

export function pokaYokeLockSnapshot(): PokaYokeLockSnapshot {
  return POKA_YOKE_LOCK;
}
