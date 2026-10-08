import { useEffect, useState } from "react";

export const LEAN_VIEW_KEY = "ui:leanView";
export const LEAN_VIEW_EVENT = "szcenario:lean_view";

/** Alap: egyszerű kisvállalkozói nézet. Szakértői / Lean csak kapcsolóra. */
export const DEFAULT_LEAN_VIEW = false;

function readStoredLeanView(): boolean {
  if (typeof window === "undefined") return DEFAULT_LEAN_VIEW;
  try {
    const v = window.sessionStorage.getItem(LEAN_VIEW_KEY);
    if (v == null) return DEFAULT_LEAN_VIEW;
    return v === "1";
  } catch {
    return DEFAULT_LEAN_VIEW;
  }
}

export function readLeanView(): boolean {
  return readStoredLeanView();
}

export function writeLeanView(on: boolean): boolean {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(LEAN_VIEW_KEY, on ? "1" : "0");
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new CustomEvent(LEAN_VIEW_EVENT, { detail: on }));
  }
  return on;
}

export function useLeanView() {
  const [lean, setLeanState] = useState(DEFAULT_LEAN_VIEW);
  useEffect(() => {
    setLeanState(readStoredLeanView());
    const on = (event: Event) => {
      const next = (event as CustomEvent<boolean>).detail;
      setLeanState(Boolean(next));
    };
    window.addEventListener(LEAN_VIEW_EVENT, on);
    return () => window.removeEventListener(LEAN_VIEW_EVENT, on);
  }, []);
  const setLean = (on: boolean) => {
    setLeanState(on);
    writeLeanView(on);
  };
  return {
    lean,
    setLean,
    toggle: () => setLean(!lean),
  };
}
