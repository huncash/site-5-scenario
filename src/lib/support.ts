import { canonicalizeSupportSlug } from "@/lib/supportRoutes";
import { applyViewPrefsToSearch } from "@/lib/viewPrefs";

export const SUPPORT_ORIGIN_PROD = "https://support.szcenario.hu";
export const SUPPORT_MAIL = "support@szcenario.hu";
export const SUPPORT_SLA =
  "Átlagos válaszadási idő: 24 órán belül, kizárólag írásban a pontosabb és gyorsabb ügyintézés érdekében.";

export type SupportLayer = "tippek" | "gyik" | "ticket";

/** /support vagy /support/* → belső slug (home | pricing | lecke-…). */
export function supportPathSlug(pathname: string): string {
  const path = (pathname.replace(/\/+$/, "") || "/");
  const inner = path === "/support" ? "/" : path.startsWith("/support/") ? path.slice("/support".length) : path;
  const slug = inner.replace(/^\//, "");
  return slug || "home";
}

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

export type SupportPlanId = "basic" | "pro" | "enterprise";

/** Főoldali /support útvonal — a support aldomainen üres. */
export function supportMountPrefix(hostname?: string, pathname?: string): string {
  const h = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  if (h === "support.szcenario.hu" || h.startsWith("support.")) return "";
  const path = (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")).replace(/\/+$/, "") || "/";
  if (path === "/support" || path.startsWith("/support/")) return "/support";
  return "";
}

function supportOriginHref(pathname: string, hash: string): string {
  const origin = isSupportHost() ? supportPublicOrigin() : SUPPORT_ORIGIN_PROD;
  const mount = supportMountPrefix();
  const inner = pathname === "/" ? mount || "/" : `${mount}${pathname}`;
  const url = new URL(inner, `${origin}/`);
  if (hash) url.hash = hash;
  applyViewPrefsToSearch(url);
  return url.toString();
}

export function supportPricingHref(anchor: SupportPricingAnchor): string {
  return supportOriginHref("/pricing", anchor);
}

/** Támogatási kártya a support főoldalon — Basic / Standard / Priority. */
export function supportTierHref(plan: SupportPlanId): string {
  return supportOriginHref("/", `support-${plan}`);
}

export function supportTierDomId(plan: SupportPlanId): string {
  return `support-${plan}`;
}

export function supportPageUrl(slug: string): string {
  const origin = isSupportHost() ? supportPublicOrigin() : SUPPORT_ORIGIN_PROD;
  const canonical = !slug || slug === "home" ? "home" : canonicalizeSupportSlug(slug);
  const path = canonical === "home" ? "/" : `/${canonical.replace(/^\/+/, "")}`;
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
