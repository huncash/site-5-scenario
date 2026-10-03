import { toast } from "sonner";

import { denyMutateIfViewer, isViewerReadonly } from "@/lib/accessRole";

/** Nyilvános szcenárió-verzió: nézni lehet, írni / importálni / kimenteni még nem. */
export const VERSION_WRITE_DENIED = "Ez a funkció a jelenlegi verzióban nem engedélyezett.";
export const VIEWER_WRITE_DENIED = "Olvasói módban (VIEWER_READONLY) ez a művelet nem engedélyezett.";

export const SETTINGS_FOCUS_DEMO_RESET = "demo-reset";

export function denyShowcaseWrite(blocked: boolean): boolean {
  if (denyMutateIfViewer() || isViewerReadonly()) {
    toast.warning(VIEWER_WRITE_DENIED);
    return true;
  }
  if (!blocked) return false;
  toast.warning(VERSION_WRITE_DENIED);
  return true;
}
