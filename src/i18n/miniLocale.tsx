import { useCallback, useState } from "react";

import {
  applyHtmlLang,
  isLocale,
  localeLabel,
  persistLocale,
  readClientLocale,
  type Locale,
} from "@/i18n/locale";

export type { Locale };

export function readSiteLocale(): Locale {
  if (typeof window !== "undefined") {
    try {
      const q = new URLSearchParams(window.location.search);
      const raw = q.get("lang") || q.get("locale");
      if (isLocale(raw)) {
        persistLocale(raw);
        applyHtmlLang(raw);
        return raw;
      }
    } catch {
      /* ignore */
    }
  }
  const loc = readClientLocale();
  applyHtmlLang(loc);
  return loc;
}

function writeLocaleQuery(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

export function useSiteLocale() {
  const [locale, setLocaleState] = useState<Locale>(readSiteLocale);
  const setLocale = useCallback((next: Locale) => {
    persistLocale(next);
    applyHtmlLang(next);
    writeLocaleQuery(next);
    setLocaleState(next);
  }, []);
  const toggleLocale = useCallback(() => {
    setLocale(locale === "hu" ? "en" : "hu");
  }, [locale, setLocale]);
  return { locale, setLocale, toggleLocale, label: localeLabel(locale) };
}

export function LangSwitch(props: { locale: Locale; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={props.className ?? "lang-btn"}
      onClick={props.onToggle}
      aria-label={props.locale === "hu" ? "Switch language: Hungarian / English" : "Nyelv váltása: magyar / English"}
      title={props.locale === "hu" ? "Nyelv" : "Language"}
    >
      {localeLabel(props.locale)}
    </button>
  );
}
