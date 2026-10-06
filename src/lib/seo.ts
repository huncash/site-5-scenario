import { SEO_PAGES, type SeoPageId } from "@/content/seo";
import { MAIN_ORIGIN_PROD } from "@/lib/siteSurface";
import { SCHOOL_ORIGIN_PROD } from "@/lib/school";
import { SUPPORT_ORIGIN_PROD } from "@/lib/support";

function originFor(page: SeoPageId): string {
  const kind = SEO_PAGES[page].origin;
  if (kind === "school") return SCHOOL_ORIGIN_PROD;
  if (kind === "support") return SUPPORT_ORIGIN_PROD;
  return MAIN_ORIGIN_PROD;
}

export function seoCanonicalUrl(page: SeoPageId): string {
  const { path } = SEO_PAGES[page];
  const origin = originFor(page);
  if (path === "/") return origin;
  return `${origin}${path}`;
}

export function publicSeoHead(page: SeoPageId) {
  const p = SEO_PAGES[page];
  const url = seoCanonicalUrl(page);
  return {
    meta: [
      { title: p.title },
      { name: "description", content: p.description },
      { property: "og:title", content: p.ogTitle },
      { property: "og:description", content: p.ogDescription },
      { property: "og:type", content: "website" as const },
      { property: "og:url", content: url },
      { property: "og:locale", content: "hu_HU" },
      { name: "twitter:title", content: p.ogTitle },
      { name: "twitter:description", content: p.ogDescription },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function supportSeoPageFromPath(pathname: string): SeoPageId {
  const inner = pathname.replace(/\/+$/, "") || "/";
  if (inner.endsWith("/pricing") || inner === "/pricing") return "pricing";
  return "support";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  const sel = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Support SPA / client navigáció — a head a TanStack Start nélkül is követi a slugot. */
export function applyPublicSeo(page: SeoPageId) {
  if (typeof document === "undefined") return;
  const p = SEO_PAGES[page];
  const url = seoCanonicalUrl(page);
  document.title = p.title;
  upsertMeta("name", "description", p.description);
  upsertMeta("property", "og:title", p.ogTitle);
  upsertMeta("property", "og:description", p.ogDescription);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:locale", "hu_HU");
  upsertMeta("name", "twitter:title", p.ogTitle);
  upsertMeta("name", "twitter:description", p.ogDescription);
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);
}
