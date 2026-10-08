export type ReferencesTabId = "partners" | "bank" | "resources" | "buckets" | "debts";

export const REFERENCES_TABS: Array<{ id: ReferencesTabId; key: "ref.tabPartners" | "ref.tabBank" | "ref.tabResources" | "ref.tabBuckets" | "ref.tabDebts" }> = [
  { id: "partners", key: "ref.tabPartners" },
  { id: "bank", key: "ref.tabBank" },
  { id: "resources", key: "ref.tabResources" },
  { id: "buckets", key: "ref.tabBuckets" },
  { id: "debts", key: "ref.tabDebts" },
];

export type ReferencesReturnState = {
  previousView: string;
  activeTab: string;
  activeWs: string;
  middleWs: string;
  pdcaMode: string;
  scrollPosition: number;
  profile: string;
  workspace: string;
  highlightIds?: string[];
};

const RETURN_KEY = "ui:referencesReturn";
const RESTORE_KEY = "ui:referencesRestore";
const HIGHLIGHT_KEY = "ui:referencesHighlightIds";

export function isReferencesTab(v: string): v is ReferencesTabId {
  return REFERENCES_TABS.some((t) => t.id === v);
}

export function pushReferencesReturn(state: ReferencesReturnState) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(RETURN_KEY, JSON.stringify(state));
  if (state.highlightIds?.length) {
    sessionStorage.setItem(HIGHLIGHT_KEY, JSON.stringify(state.highlightIds));
  }
}

export function peekReferencesReturn(): ReferencesReturnState | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReferencesReturnState;
  } catch {
    return null;
  }
}

export function consumeReferencesReturn(): ReferencesReturnState | null {
  const st = peekReferencesReturn();
  if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(RETURN_KEY);
  return st;
}

export function stageReferencesRestore(state: ReferencesReturnState) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(RESTORE_KEY, JSON.stringify(state));
}

export function consumeReferencesRestore(): ReferencesReturnState | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RESTORE_KEY);
    sessionStorage.removeItem(RESTORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ReferencesReturnState;
  } catch {
    return null;
  }
}

export function consumeReferencesHighlightIds(): string[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(HIGHLIGHT_KEY);
    sessionStorage.removeItem(HIGHLIGHT_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

export function captureScrollPosition(): number {
  if (typeof window === "undefined") return 0;
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) return main.scrollTop;
  return window.scrollY || 0;
}

export function restoreScrollPosition(pos: number) {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => {
    const main = document.querySelector("main");
    if (main instanceof HTMLElement) main.scrollTop = pos;
    else window.scrollTo({ top: pos, behavior: "auto" });
  });
}
