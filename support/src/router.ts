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

/** /support vagy /support/* → support SPA gyökér (hostname nélkül, port nélkül). */
export function stripSupportMount(pathname: string): string {
  const path = pathOf(pathname);
  if (path === "/support") return "/";
  if (path.startsWith("/support/")) return path.slice("/support".length) || "/";
  return path;
}

export function supportMountPrefix(pathname?: string): string {
  const path = pathOf(pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
  if (path === "/support" || path.startsWith("/support/")) return "/support";
  return "";
}

export function parseSupportPath(pathname: string): { embed: boolean; slug: SupportSlug } {
  const path = stripSupportMount(pathname);
  const embed = path === "/embed" || path.startsWith("/embed/");
  if (path === "/" || path === "/embed") return { embed, slug: "home" };
  if (path.startsWith("/embed/")) return { embed: true, slug: path.slice("/embed/".length) };
  return { embed: false, slug: path.replace(/^\//, "") };
}

import { applyViewPrefsToSearch, withViewPrefs } from "@/lib/viewPrefs";

export function supportHref(slug: SupportSlug | "", opts?: { embed?: boolean; lang?: string }): string {
  const mount = supportMountPrefix();
  const inner = opts?.embed
    ? slug && slug !== "home"
      ? `/embed/${slug}`
      : "/embed"
    : slug && slug !== "home"
      ? `/${slug}`
      : "/";
  const base = inner === "/" ? mount || "/" : `${mount}${inner}`;
  let href = base;
  if (opts?.lang) {
    const url = new URL(base, "https://support.local");
    url.searchParams.set("lang", opts.lang);
    href = `${url.pathname}${url.search}`;
  }
  if (typeof window === "undefined") return href;
  return withViewPrefs(href);
}

export function navigateTo(path: string) {
  const url = new URL(path, window.location.origin);
  applyViewPrefsToSearch(url);
  window.history.pushState({}, "", `${url.pathname}${url.search}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
