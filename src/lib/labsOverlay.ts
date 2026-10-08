export const LABS_OVERLAY_OPEN_EVENT = "szcenario:labs-overlay-open";

export function requestLabsOverlayOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LABS_OVERLAY_OPEN_EVENT));
}
