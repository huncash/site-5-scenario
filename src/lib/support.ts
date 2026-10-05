import { applyViewPrefsToSearch } from "@/lib/viewPrefs";

export const SUPPORT_ORIGIN_PROD = "https://support.szcenario.hu";
export const SUPPORT_MAIL = "support@szcenario.hu";
export const SUPPORT_SLA =
  "Átlagos válaszadási idő: 24 órán belül, kizárólag írásban a pontosabb és gyorsabb ügyintézés érdekében.";

export type SupportLayer = "tippek" | "gyik" | "ticket";

export function isSupportHost(hostname?: string, pathname?: string): boolean {
  const h = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  const path = (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")).replace(/\/+$/, "") || "/";
  return h === "support.szcenario.hu" || h.startsWith("support.") || path === "/support" || path.startsWith("/support/");
}

export function supportPublicOrigin(hostname?: string, pathname?: string): string {
  const h = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  const path = (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")).replace(/\/+$/, "") || "/";
  if (h === "support.szcenario.hu" || h.startsWith("support.")) {
    if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === h) {
      return window.location.origin;
    }
    return SUPPORT_ORIGIN_PROD;
  }
  if (path === "/support" || path.startsWith("/support/")) {
    return typeof window !== "undefined" ? window.location.origin : SUPPORT_ORIGIN_PROD;
  }
  return SUPPORT_ORIGIN_PROD;
}

/** Support /pricing SSOT horgonyok — részletes árazás / licenc / helyi import. */
export type SupportPricingAnchor =
  | "basic"
  | "pro"
  | "enterprise"
  | "tiered-loyalty"
  | "active-workspaces"
  | "local-import";

export function supportPricingHref(anchor: SupportPricingAnchor): string {
  const url = new URL("/pricing", `${isSupportHost() ? supportPublicOrigin() : SUPPORT_ORIGIN_PROD}/`);
  url.hash = anchor;
  applyViewPrefsToSearch(url);
  return url.toString();
}

export function supportPageUrl(slug: string): string {
  const origin = isSupportHost() ? supportPublicOrigin() : SUPPORT_ORIGIN_PROD;
  const path = !slug || slug === "home" ? "/" : `/${slug.replace(/^\/+/, "")}`;
  const url = new URL(path, `${origin}/`);
  applyViewPrefsToSearch(url);
  return url.toString();
}

export function supportEmbedUrl(slug: string): string {
  const clean = slug.replace(/^\/+/, "");
  const path = clean.startsWith("embed/") ? `/${clean}` : `/embed/${clean}`;
  const url = new URL(path, `${supportPublicOrigin()}/`);
  applyViewPrefsToSearch(url);
  return url.toString();
}

export const SUPPORT_LAYER_SLUG: Record<SupportLayer, string> = {
  tippek: "tippek",
  gyik: "gyik",
  ticket: "ticket",
};

export const ONBOARDING_EMBED_SLUG: Record<string, string> = {
  demo: "lecke-01",
  anatomy: "lecke-02",
  pdca: "lecke-03",
  "welcome-shortcuts": "lecke-04",
  workspaces: "lecke-05",
  "security-close": "lecke-06",
};
