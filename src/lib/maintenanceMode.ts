/**
 * Hétvégi zárás. Hétfőn: `MAINTENANCE_MODE = false`, vagy env `VITE_MAINTENANCE_MODE=0`.
 * Kód törlés nélkül nyílik a nyilvános felület.
 */
export const MAINTENANCE_MODE = true;

export function readMaintenanceEnv(raw: string | undefined | null): boolean | null {
  const env = String(raw ?? "").trim().toLowerCase();
  if (env === "0" || env === "off" || env === "false" || env === "no") return false;
  if (env === "1" || env === "on" || env === "true" || env === "yes") return true;
  return null;
}

export function maintenanceModeFromEnv(raw: string | undefined | null): boolean {
  const parsed = readMaintenanceEnv(raw);
  if (parsed !== null) return parsed;
  return MAINTENANCE_MODE;
}
