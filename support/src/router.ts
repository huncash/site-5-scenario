/** Support SPA útvonalak — skálázható slug tábla (App Router-szerű szerep). */

export type SupportSlug =
  | "home"
  | "tippek"
  | "gyik"
  | "ticket"
  | "pricing"
  | "kb/kahn-rand"
  | (string & {});

export function pathOf(pathname = typeof window !== "undefined" ? window.location.pathname : "/"): string {
  return pathname.replace(/\/+$/, "") || "/";
}

export function parseSupportPath(pathname: string): { embed: boolean; slug: SupportSlug } {
  const path = pathOf(pathname);
  const embed = path === "/embed" || path.startsWith("/embed/");
  if (path === "/" || path === "/embed") return { embed, slug: "home" };
  if (path.startsWith("/embed/")) return { embed: true, slug: path.slice("/embed/".length) };
  return { embed: false, slug: path.replace(/^\//, "") };
}

export function supportHref(slug: SupportSlug | "", opts?: { embed?: boolean; lang?: string }): string {
  const base = opts?.embed ? (slug && slug !== "home" ? `/embed/${slug}` : "/embed") : slug && slug !== "home" ? `/${slug}` : "/";
  if (!opts?.lang) return base;
  const url = new URL(base, "https://support.local");
  url.searchParams.set("lang", opts.lang);
  return `${url.pathname}${url.search}`;
}

export function navigateTo(path: string) {
  const url = new URL(path, window.location.origin);
  if (window.location.search) {
    const lang = new URLSearchParams(window.location.search).get("lang");
    if (lang && !url.searchParams.has("lang")) url.searchParams.set("lang", lang);
  }
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
