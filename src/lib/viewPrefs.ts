import type { Locale } from "@/i18n/locale";
import type { UiPalette, UiTheme } from "@/lib/mesh/schema";
import VIEW_PREFS_BOOT_RAW from "./viewPrefsBoot.js?raw";

export const VIEW_PREFS_COOKIE = "szcenario_view";
export const VIEW_PREFS_EVENT = "szcenario:view_prefs";

export type ViewPrefs = {
  theme: UiTheme;
  palette: UiPalette;
  a11y: boolean;
  locale: Locale;
};

const THEME_KEY = "szcenario_theme";
const PALETTE_KEY = "szcenario_palette";
const A11Y_KEY = "szcenario_a11y";
const LOCALE_KEY = "szcenario_locale";
const CURRENCY_KEY = "szcenario_currency";

const DEFAULTS: ViewPrefs = { theme: "dark", palette: "forest", a11y: false, locale: "hu" };

export function isUiTheme(v: unknown): v is UiTheme {
  return v === "light" || v === "dark";
}

export function isUiPaletteId(v: unknown): v is UiPalette {
  return v === "forest" || v === "slate" || v === "bronze";
}

export function isLocaleId(v: unknown): v is Locale {
  return v === "hu" || v === "en";
}

export function cookieDomainForHost(hostname = ""): string | undefined {
  const h = hostname.toLowerCase();
  if (h === "szcenario.hu" || h.endsWith(".szcenario.hu")) return ".szcenario.hu";
  return undefined;
}

export function serializeViewPrefs(prefs: ViewPrefs): string {
  return `${prefs.theme}.${prefs.palette}.${prefs.a11y ? "1" : "0"}.${prefs.locale}`;
}

export function parseViewPrefsToken(raw: string | null | undefined): Partial<ViewPrefs> {
  if (!raw) return {};
  const parts = decodeURIComponent(raw).trim().split(".");
  const out: Partial<ViewPrefs> = {};
  if (isUiTheme(parts[0])) out.theme = parts[0];
  if (isUiPaletteId(parts[1])) out.palette = parts[1];
  if (parts[2] === "1") out.a11y = true;
  if (parts[2] === "0") out.a11y = false;
  if (isLocaleId(parts[3])) out.locale = parts[3];
  return out;
}

export function readViewPrefsFromSearch(search = ""): Partial<ViewPrefs> {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const q = new URLSearchParams(raw);
  const out: Partial<ViewPrefs> = {};
  const theme = q.get("theme");
  const palette = q.get("palette");
  const a11y = q.get("a11y");
  const locale = q.get("lang") || q.get("locale");
  if (isUiTheme(theme)) out.theme = theme;
  if (isUiPaletteId(palette)) out.palette = palette;
  if (a11y === "1") out.a11y = true;
  if (a11y === "0") out.a11y = false;
  if (isLocaleId(locale)) out.locale = locale;
  return out;
}

export function applyViewPrefsToSearch(url: URL, prefs?: Partial<ViewPrefs>): URL {
  const p = prefs ?? resolveViewPrefs();
  if (p.theme) url.searchParams.set("theme", p.theme);
  if (p.palette) url.searchParams.set("palette", p.palette);
  if (p.a11y !== undefined) url.searchParams.set("a11y", p.a11y ? "1" : "0");
  if (p.locale) url.searchParams.set("lang", p.locale);
  return url;
}

function readCookieRaw(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${VIEW_PREFS_COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

export function readViewPrefsCookie(): Partial<ViewPrefs> {
  return parseViewPrefsToken(readCookieRaw());
}

function readStoredViewPrefs(): ViewPrefs {
  const next = { ...DEFAULTS };
  if (typeof window === "undefined") return next;
  try {
    const theme = window.localStorage.getItem(THEME_KEY);
    const palette = window.localStorage.getItem(PALETTE_KEY);
    const a11y = window.localStorage.getItem(A11Y_KEY);
    const locale = window.localStorage.getItem(LOCALE_KEY);
    if (isUiTheme(theme)) next.theme = theme;
    if (isUiPaletteId(palette)) next.palette = palette;
    if (a11y === "1") next.a11y = true;
    if (a11y === "0") next.a11y = false;
    if (isLocaleId(locale)) next.locale = locale;
  } catch {
    /* private mode */
  }
  return next;
}

export function writeViewPrefsCookie(prefs: ViewPrefs, hostname?: string): void {
  if (typeof document === "undefined") return;
  const host = hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");
  const domain = cookieDomainForHost(host);
  const parts = [
    `${VIEW_PREFS_COOKIE}=${serializeViewPrefs(prefs)}`,
    "Path=/",
    "Max-Age=31536000",
    "SameSite=Lax",
  ];
  if (domain) parts.push(`Domain=${domain}`);
  document.cookie = parts.join("; ");
}

export function syncViewPrefsCookie(): ViewPrefs {
  const prefs = readStoredViewPrefs();
  writeViewPrefsCookie(prefs);
  return prefs;
}

export function persistViewPrefs(partial: Partial<ViewPrefs>): ViewPrefs {
  const prefs = { ...readStoredViewPrefs(), ...partial };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_KEY, prefs.theme);
      window.localStorage.setItem(PALETTE_KEY, prefs.palette);
      window.localStorage.setItem(A11Y_KEY, prefs.a11y ? "1" : "0");
      window.localStorage.setItem(LOCALE_KEY, prefs.locale);
      window.localStorage.setItem(CURRENCY_KEY, prefs.locale === "en" ? "EUR" : "HUF");
    } catch {
      /* private mode */
    }
    window.dispatchEvent(new CustomEvent(VIEW_PREFS_EVENT, { detail: prefs }));
  }
  writeViewPrefsCookie(prefs);
  return prefs;
}

export function resolveViewPrefs(input?: { search?: string }): ViewPrefs {
  return {
    ...DEFAULTS,
    ...readViewPrefsCookie(),
    ...readStoredViewPrefs(),
    ...readViewPrefsFromSearch(input?.search ?? (typeof window !== "undefined" ? window.location.search : "")),
  };
}

export function consumeViewPrefsFromLocation(search?: string): ViewPrefs {
  return persistViewPrefs(resolveViewPrefs({ search }));
}

export function withViewPrefs(href: string, prefs?: Partial<ViewPrefs>): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://szcenario.hu";
  const url = new URL(href, `${base}/`);
  applyViewPrefsToSearch(url, prefs);
  if (href.startsWith("/") && !href.startsWith("//")) {
    return `${url.pathname}${url.search}${url.hash}`;
  }
  return url.toString();
}

/** Head boot: query > localStorage > cookie > default. Storage EN wins over a stale HU cookie. */
export const VIEW_PREFS_BOOT_SCRIPT = VIEW_PREFS_BOOT_RAW.trim();
