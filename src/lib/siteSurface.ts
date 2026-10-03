export const SITE_VERSION = "0.1.3";
export const MAIN_ORIGIN_PROD = "https://szcenario.hu";
export const HOME_MODE_KEY = "szcenario_home_mode";
export const HOME_MODE_EVENT = "szcenario:home_mode";

export type SiteHostKind = "main" | "bill" | "support" | "app";
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

function isLocalHost(hostname: string): boolean {
  return /^(localhost|127\.0\.0\.1)$/.test(hostname);
}

export function resolveSiteHost(hostname: string, port = ""): SiteHostKind {
  const h = hostname.toLowerCase();
  const p = String(port);
  if (h === "app.szcenario.hu" || h.startsWith("app.")) return "app";
  if (h === "bill.szcenario.hu" || h.startsWith("bill.") || (isLocalHost(h) && p === "5110")) return "bill";
  if (h === "support.szcenario.hu" || h.startsWith("support.") || (isLocalHost(h) && p === "5120")) return "support";
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
  if (path === "/" || path === "/about" || path === "/login") return true;
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
  const kind = resolveSiteHost(opts.hostname, opts.port);
  if (kind === "app") return false;
  if (kind === "bill" || kind === "support") {
    return !normalizePath(opts.pathname).startsWith("/embed");
  }
  if (isWorkspacePath(opts.pathname)) return false;
  if (normalizePath(opts.pathname) === "/" && (opts.homeMode ?? "door") === "dashboard") return false;
  return isPublicMarketingPath(opts.pathname);
}

export function mainPublicOrigin(hostname?: string, port?: string): string {
  const h = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
  if (isLocalHost(h)) return "http://localhost:5100";
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
