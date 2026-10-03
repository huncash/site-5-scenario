import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { en } from "@/i18n/en";
import { hu } from "@/i18n/hu";
import { formatCurrency } from "@/i18n/currency";
import {
  applyHtmlLang,
  currencyForLocale,
  DEFAULT_LOCALE,
  otherLocale,
  persistLocale,
  readClientLocale,
  type DisplayCurrency,
  type Locale,
} from "@/i18n/locale";

export type { Locale, DisplayCurrency } from "@/i18n/locale";
export { DEFAULT_LOCALE, localeLabel, otherLocale, currencyForLocale } from "@/i18n/locale";
export { formatCurrency, currencyUnit, DISPLAY_HUF_PER_EUR } from "@/i18n/currency";
export { TERMS } from "@/i18n/terms";

const DICTS = { hu, en } as const;

type Dict = typeof hu;
type NestedKey<T, P extends string = ""> = T extends string
  ? P
  : {
      [K in keyof T & string]: NestedKey<T[K], P extends "" ? K : `${P}.${K}`>;
    }[keyof T & string];

export type MessageKey = NestedKey<Dict>;

function lookup(dict: unknown, path: string): string | undefined {
  let cur: unknown = dict;
  for (const part of path.split(".")) {
    if (!cur || typeof cur !== "object" || !(part in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const raw = lookup(DICTS[locale], key) ?? lookup(DICTS[DEFAULT_LOCALE], key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export function paletteName(locale: Locale, palette: "forest" | "slate" | "bronze"): string {
  return translate(locale, `view.${palette}`);
}

type I18nValue = {
  locale: Locale;
  currency: DisplayCurrency;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  money: (value: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readClientLocale);

  useLayoutEffect(() => {
    const initial = readClientLocale();
    setLocaleState(initial);
    applyHtmlLang(initial);
    persistLocale(initial);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    applyHtmlLang(next);
    persistLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(otherLocale(locale));
  }, [locale, setLocale]);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const money = useCallback((value: number) => formatCurrency(value, locale), [locale]);
  const currency = currencyForLocale(locale);

  const value = useMemo(
    () => ({ locale, currency, setLocale, toggleLocale, t, money }),
    [locale, currency, setLocale, toggleLocale, t, money],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

const idle: I18nValue = {
  locale: DEFAULT_LOCALE,
  currency: currencyForLocale(DEFAULT_LOCALE),
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  money: (value) => formatCurrency(value, DEFAULT_LOCALE),
};

export function useI18n(): I18nValue {
  return useContext(I18nContext) ?? idle;
}
