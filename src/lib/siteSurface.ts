export const SITE_VERSION = "0.1.4";
export const MAIN_ORIGIN_PROD = "https://szcenario.hu";
export const HOME_MODE_KEY = "szcenario_home_mode";
export const HOME_MODE_EVENT = "szcenario:home_mode";

export type SiteHostKind = "main" | "bill" | "support" | "docs" | "blog" | "app";
export type HomeMode = "door" | "dashboard";

const WORKSPACE_PREFIXES = [
  "/settings",
  "/logs",
  "/devices",
  "/stats",
  "/report",
  "/connect",
  "/references",
  "/app",
  "/login/activate",
];

function hostOf(hostname?: string): string {
  return (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
}

function isPathPrefix(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** Felület: subdomain vagy útvonal — soha nem belső port. */
export function resolveSiteHost(hostname: string, _port = "", pathname = ""): SiteHostKind {
  const h = hostname.toLowerCase();
  const path = normalizePath(pathname);
  if (h === "app.szcenario.hu" || h.startsWith("app.")) return "app";
  if (h === "bill.szcenario.hu" || h.startsWith("bill.") || isPathPrefix(path, "/bill")) return "bill";
  if (h === "support.szcenario.hu" || h.startsWith("support.") || isPathPrefix(path, "/support")) return "support";
  if (h === "docs.szcenario.hu" || h.startsWith("docs.") || isPathPrefix(path, "/docs")) return "docs";
  if (h === "blog.szcenario.hu" || h.startsWith("blog.") || isPathPrefix(path, "/blog")) return "blog";
  return "main";
}

export function readHomeMode(storage?: Pick<Storage, "getItem"> | null): HomeMode {
  try {
    const v = storage?.getItem(HOME_MODE_KEY);
    return v === "dashboard" ? "dashboard" : "door";
  } catch {
    return "door";
  }
}

export function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  return p || "/";
}

export function isWorkspacePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (path.startsWith("/embed")) return true;
  return WORKSPACE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isPublicMarketingPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (path === "/" || path === "/about" || path === "/gdpr" || path === "/aszf" || path === "/login") return true;
  if (path.startsWith("/f/")) return true;
  return path === "/bcp" || path === "/oktatas" || path === "/strategia" || path === "/kozosseg" || path === "/makro";
}

export function shouldShowSiteFooter(opts: {
  hostname: string;
  port?: string;
  pathname: string;
  homeMode?: HomeMode;
  embed?: boolean;
}): boolean {
  if (opts.embed) return false;
  const kind = resolveSiteHost(opts.hostname, opts.port, opts.pathname);
  if (kind === "app") return false;
  if (kind === "bill" || kind === "support" || kind === "docs" || kind === "blog") {
    return !normalizePath(opts.pathname).startsWith("/embed");
  }
  if (isWorkspacePath(opts.pathname)) return false;
  if (normalizePath(opts.pathname) === "/" && (opts.homeMode ?? "door") === "dashboard") return false;
  return isPublicMarketingPath(opts.pathname);
}

export function mainPublicOrigin(hostname?: string, _port?: string): string {
  const h = hostOf(hostname);
  if ((h === "szcenario.hu" || h === "www.szcenario.hu") && typeof window !== "undefined") {
    if (window.location.hostname.toLowerCase() === h) return window.location.origin;
  }
  return MAIN_ORIGIN_PROD;
}

export function currentLocation(): { hostname: string; port: string; pathname: string } {
  if (typeof window === "undefined") {
    return { hostname: "", port: "", pathname: "/" };
  }
  return {
    hostname: window.location.hostname,
    port: window.location.port,
    pathname: window.location.pathname,
  };
}

/** Aktuális felület: hostname + pathname, port nélkül. */
export function currentSiteHost(loc = currentLocation()): SiteHostKind {
  return resolveSiteHost(loc.hostname, "", loc.pathname);
}

export const SITE_KIND_DATA_ATTR = "data-site-kind";

/** Head boot: hostname + pathname → data-site-kind, port nélkül. */
export const SITE_KIND_BOOT_SCRIPT =
  '(function(){try{var h=location.hostname.toLowerCase();var p=(location.pathname||"/").replace(/\\/+$/,"")||"/";var k="main";if(h==="app.szcenario.hu"||h.indexOf("app.")===0)k="app";else if(h==="bill.szcenario.hu"||h.indexOf("bill.")===0||p==="/bill"||p.indexOf("/bill/")===0)k="bill";else if(h==="support.szcenario.hu"||h.indexOf("support.")===0||p==="/support"||p.indexOf("/support/")===0)k="support";else if(h==="docs.szcenario.hu"||h.indexOf("docs.")===0||p==="/docs"||p.indexOf("/docs/")===0)k="docs";else if(h==="blog.szcenario.hu"||h.indexOf("blog.")===0||p==="/blog"||p.indexOf("/blog/")===0)k="blog";document.documentElement.setAttribute("data-site-kind",k);}catch(e){}})();';

export function readBootSiteKind(): SiteHostKind | null {
  if (typeof document === "undefined") return null;
  const raw = document.documentElement.getAttribute(SITE_KIND_DATA_ATTR);
  if (
    raw === "main" ||
    raw === "bill" ||
    raw === "support" ||
    raw === "docs" ||
    raw === "blog" ||
    raw === "app"
  ) {
    return raw;
  }
  return null;
}
