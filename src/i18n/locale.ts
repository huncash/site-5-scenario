export const LOCALES = ["hu", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export type DisplayCurrency = "HUF" | "EUR";

export const DEFAULT_LOCALE: Locale = "hu";
export const DEFAULT_CURRENCY: DisplayCurrency = "HUF";
export const LOCALE_STORAGE_KEY = "szcenario_locale";
export const CURRENCY_STORAGE_KEY = "szcenario_currency";
export const LOCALE_EVENT = "szcenario:locale";
export const CURRENCY_EVENT = "szcenario:currency";
export const LOCALE_DATA_ATTR = "data-locale";
export const CURRENCY_DATA_ATTR = "data-currency";

export function currencyForLocale(locale: Locale): DisplayCurrency {
  return locale === "en" ? "EUR" : "HUF";
}

export function isLocale(value: unknown): value is Locale {
  return value === "hu" || value === "en";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "hu" ? "en" : "hu";
}

export function localeLabel(locale: Locale): "HU" | "EN" {
  return locale === "hu" ? "HU" : "EN";
}

export function readClientLocale(): Locale {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.getAttribute(LOCALE_DATA_ATTR);
    if (isLocale(fromDom)) return fromDom;
  }
  try {
    if (typeof localStorage === "undefined") return DEFAULT_LOCALE;
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function persistLocale(locale: Locale): void {
  const currency = currencyForLocale(locale);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  } catch {
    /* private mode */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOCALE_EVENT, { detail: locale }));
    window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: currency }));
  }
}

export function applyHtmlLang(locale: Locale): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  const currency = currencyForLocale(locale);
  el.lang = locale;
  el.setAttribute(LOCALE_DATA_ATTR, locale);
  el.setAttribute(CURRENCY_DATA_ATTR, currency);
}

/** Runs in <head> before paint so hu/en and Ft/€ do not flash. Default: hu + HUF. */
export const LOCALE_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.lang="hu";d.setAttribute("data-locale","hu");d.setAttribute("data-currency","HUF");try{var l=localStorage.getItem("szcenario_locale");if(l!=="en")l="hu";var c=l==="en"?"EUR":"HUF";d.lang=l;d.setAttribute("data-locale",l);d.setAttribute("data-currency",c);localStorage.setItem("szcenario_currency",c);}catch(e){}})();`;
