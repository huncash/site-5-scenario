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

/** Support /pricing SSOT horgonyok — részletes árazás / licenc / helyi import / munkamenet / asztali és speciális motorok. */
export type SupportPricingAnchor =
  | "basic"
  | "pro"
  | "enterprise"
  | "tiered-loyalty"
  | "active-workspaces"
  | "workflow"
  | "local-import"
  | "addons"
  | "desktop-engines"
  | "desktop"
  | "economic-engine"
  | "bcp"
  | "education-engine";

export type SupportPlanId = "basic" | "pro" | "enterprise";

export type SupportHrefLoc = { hostname?: string; pathname?: string };

/** Főoldali /support útvonal — a support aldomainen üres. */
export function supportMountPrefix(hostname?: string, pathname?: string): string {
  const h = (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
  if (h === "support.szcenario.hu" || h.startsWith("support.")) return "";
  const path = (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")).replace(/\/+$/, "") || "/";
  if (path === "/support" || path.startsWith("/support/")) return "/support";
  return "";
}

function serializeSupportHref(inner: string, hash: string, origin?: string): string {
  const url = new URL(inner, `${origin ?? "https://support.local"}/`);
  if (hash) url.hash = hash;
  applyViewPrefsToSearch(url);
  if (origin) return url.toString();
  return `${url.pathname}${url.search}${url.hash}`;
}

function supportOriginHref(pathname: string, hash: string, loc?: SupportHrefLoc): string {
  const onSupport = isSupportHost(loc?.hostname, loc?.pathname);
  const mount = supportMountPrefix(loc?.hostname, loc?.pathname);
  const inner = pathname === "/" ? mount || "/" : `${mount}${pathname}`;
  if (onSupport) return serializeSupportHref(inner, hash);
  return serializeSupportHref(inner, hash, SUPPORT_ORIGIN_PROD);
}

export function supportPricingHref(anchor: SupportPricingAnchor, loc?: SupportHrefLoc): string {
  return supportOriginHref("/pricing", anchor, loc);
}

/** Támogatási kártya a support főoldalon — Basic / Standard / Priority. */
export function supportTierHref(plan: SupportPlanId, loc?: SupportHrefLoc): string {
  return supportOriginHref("/", `support-${plan}`, loc);
}

export function supportTierDomId(plan: SupportPlanId): string {
  return `support-${plan}`;
}

export function supportPageUrl(slug: string, loc?: SupportHrefLoc): string {
  const canonical = !slug || slug === "home" ? "home" : canonicalizeSupportSlug(slug);
  const path = canonical === "home" ? "/" : `/${canonical.replace(/^\/+/, "")}`;
  return supportOriginHref(path, "", loc);
}

export function supportTicketHref(opts?: { subject?: string } & SupportHrefLoc): string {
  const page = supportPageUrl("ticket", opts);
  const url = new URL(page, "https://support.local");
  const subject = opts?.subject?.trim();
  if (subject) url.searchParams.set("subject", subject);
  if (page.startsWith("http")) return url.toString();
  return `${url.pathname}${url.search}${url.hash}`;
}

export function readSupportTicketSearch(search = ""): { subject: string } {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const q = new URLSearchParams(raw);
  return { subject: (q.get("subject") ?? "").trim() };
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
