import { toast } from "sonner";

/** Nyilvános szcenárió-verzió: nézni lehet, írni / importálni / kimenteni még nem. */
export const VERSION_WRITE_DENIED = "Ez a funkció a jelenlegi verzióban nem engedélyezett.";

export const SETTINGS_FOCUS_DEMO_RESET = "demo-reset";

export function denyShowcaseWrite(blocked: boolean): boolean {
  if (!blocked) return false;
  toast.warning(VERSION_WRITE_DENIED);
  return true;
}
