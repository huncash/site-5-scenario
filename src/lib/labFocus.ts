import { useEffect } from "react";

import { isDashboardLabId, type DashboardLabId } from "@/lib/dashboardLabs";

export const LAB_FOCUS_EVENT = "szcenario:lab-focus";
export const LAB_FOCUS_SESSION = "szcenario_lab_focus";
export const SZUMMA_ENTER_EVENT = "szcenario:szumma-enter";
export const SZUMMA_ENTER_SESSION = "szcenario_szumma_enter";
export const HOME_MODE_KEY = "szcenario_home_mode";

export const LAB_FOCUS_MS = 2400;

export type LabFocusMode = "highlight" | "jump";

let lastFocus: { id: DashboardLabId; at: number } | null = null;

export function peekLabFocus(id: DashboardLabId): boolean {
  return Boolean(lastFocus && lastFocus.id === id && Date.now() - lastFocus.at < LAB_FOCUS_MS);
}

export function ensureDashboardHome(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HOME_MODE_KEY, "dashboard");
    window.dispatchEvent(new Event("szcenario:home_mode"));
  } catch {
    /* ignore */
  }
}

export function requestLabFocus(id: DashboardLabId, mode: LabFocusMode = "jump"): void {
  lastFocus = { id, at: Date.now() };
  if (typeof window === "undefined") return;
  if (mode === "jump") {
    try {
      window.sessionStorage.setItem(LAB_FOCUS_SESSION, id);
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new CustomEvent(LAB_FOCUS_EVENT, { detail: { id, mode } }));
}

export function consumeLabFocus(): DashboardLabId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(LAB_FOCUS_SESSION);
    window.sessionStorage.removeItem(LAB_FOCUS_SESSION);
    return raw && isDashboardLabId(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function requestSzummaEnter(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SZUMMA_ENTER_SESSION, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(SZUMMA_ENTER_EVENT));
}

export function consumeSzummaEnter(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem(SZUMMA_ENTER_SESSION);
    window.sessionStorage.removeItem(SZUMMA_ENTER_SESSION);
    return raw === "1";
  } catch {
    return false;
  }
}

export function applyLabFocus(id: DashboardLabId, mode: LabFocusMode = "jump"): boolean {
  if (typeof document === "undefined") return false;
  const el = document.querySelector<HTMLElement>(`[data-lab-section="${id}"]`);
  if (!el) return false;
  if (mode === "jump") {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return true;
}

export function scheduleLabFocus(id: DashboardLabId, mode: LabFocusMode = "jump", attempts = 40): void {
  let n = 0;
  let applied = false;
  const tick = () => {
    if (applyLabFocus(id, mode)) {
      if (!applied && mode === "jump") {
        applied = true;
        window.setTimeout(() => applyLabFocus(id, mode), 400);
      }
      return;
    }
    if (n++ >= attempts) return;
    window.setTimeout(tick, 80);
  };
  tick();
}

function focusModeOf(raw: unknown): LabFocusMode {
  return raw === "highlight" ? "highlight" : "jump";
}

export function useLabFocusListener(): void {
  useEffect(() => {
    const onEvt = (e: Event) => {
      const detail = (e as CustomEvent<{ id?: string; mode?: LabFocusMode }>).detail;
      const id = detail?.id;
      if (id && isDashboardLabId(id)) scheduleLabFocus(id, focusModeOf(detail?.mode));
    };
    window.addEventListener(LAB_FOCUS_EVENT, onEvt as EventListener);
    const pending = consumeLabFocus();
    if (pending) scheduleLabFocus(pending, "jump");
    return () => window.removeEventListener(LAB_FOCUS_EVENT, onEvt as EventListener);
  }, []);
}
