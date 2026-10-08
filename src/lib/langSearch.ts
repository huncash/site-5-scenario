import { isLocale, persistLocale, readClientLocale, type Locale } from "@/i18n/locale";
import { persistViewPrefs, resolveViewPrefs } from "@/lib/viewPrefs";

export type LangSearch = { lang?: Locale };

/** Poka-Yoke: lang query every route validateSearch-be. Extra kulcs ne dobjon 404-et. */
export function parseLangSearch(s: Record<string, unknown>): LangSearch {
  const raw = s.lang ?? s.locale;
  return { lang: isLocale(raw) ? raw : undefined };
}

export function inheritedLang(prev?: Record<string, unknown> | null): Locale {
  return parseLangSearch(prev ?? {}).lang ?? readClientLocale();
}

export function withInheritedLang<T extends Record<string, unknown>>(
  extra: T,
  prev?: Record<string, unknown> | null,
): T & LangSearch {
  return { ...extra, lang: inheritedLang({ ...prev, ...extra }) };
}

/** Csak lang — főoldal / Navigate. */
export function langSearch(prev?: Record<string, unknown> | null): LangSearch {
  return { lang: inheritedLang(prev) };
}

/** Meglévő search kulcsok + lang zárolás. */
export function keepLang<T extends Record<string, unknown>>(prev: T): T & LangSearch {
  return { ...prev, lang: inheritedLang(prev) };
}

export function persistLocaleTrio(locale: Locale): Locale {
  persistViewPrefs({ locale });
  persistLocale(locale);
  return locale;
}

/** Cookie + localStorage + ?lang= — oldalváltás után is megmarad. */
export function syncLocaleToLocation(locale: Locale): void {
  persistLocaleTrio(locale);
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") === locale) return;
    url.searchParams.set("lang", locale);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* private mode */
  }
}

/**
 * Hiányzó ?lang= → perzisztens tároló. Query nyer; különben storage/cookie.
 * Nem ír HU-t SSR-en az URL-be.
 */
export function restoreLangFromPersistence(search?: string): Locale {
  const prefs = resolveViewPrefs({ search });
  persistLocaleTrio(prefs.locale);
  return prefs.locale;
}

export function langHrefNeedsRestore(href: string, locale: Locale): boolean {
  try {
    const url = new URL(href, "https://szcenario.hu");
    return url.searchParams.get("lang") !== locale;
  } catch {
    return true;
  }
}

export function hrefWithLang(href: string, locale: Locale): string {
  const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://szcenario.hu");
  url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Query + cookie + storage egybe, hiányzó ?lang= azonnal vissza. */
export function lockLocaleUrl(locale: Locale, replace?: (href: string) => void): void {
  persistLocaleTrio(locale);
  if (typeof window === "undefined") return;
  if (!langHrefNeedsRestore(window.location.href, locale)) return;
  const next = hrefWithLang(window.location.href, locale);
  if (replace) replace(next);
  else window.history.replaceState(window.history.state, "", next);
}
