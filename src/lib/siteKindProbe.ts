export const BILL_KIND_SUCCESS =
  "SUCCESS: bill.szcenario.hu aktív — Billing & Checkout Origin";
export const SUPPORT_KIND_SUCCESS =
  "SUCCESS: support.szcenario.hu aktív - Knowledge Hub & Decision Tree";

export type SiteKindProbeKind = "bill" | "support";

export function siteKindSuccessLabel(kind: SiteKindProbeKind): string {
  return kind === "bill" ? BILL_KIND_SUCCESS : SUPPORT_KIND_SUCCESS;
}

export function listSearchPairs(search: string): Array<{ key: string; value: string }> {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) return [];
  return [...new URLSearchParams(raw).entries()].map(([key, value]) => ({ key, value }));
}

export function searchFromLocation(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}
