import {
  currencyForLocale,
  readClientLocale,
  type DisplayCurrency,
  type Locale,
} from "@/i18n/locale";
import { FALLBACK_HUF_PER_EUR, getHufPerEur } from "@/lib/mnbRate";

export type { DisplayCurrency };
export { FALLBACK_HUF_PER_EUR, getHufPerEur };

/** Last known MNB mid-rate fallback. Live quote via getHufPerEur(). Model stays HUF. */
export const DISPLAY_HUF_PER_EUR = FALLBACK_HUF_PER_EUR;

export function currencyUnit(locale: Locale = readClientLocale()): "Ft" | "€" {
  return currencyForLocale(locale) === "EUR" ? "€" : "Ft";
}

export function hufToDisplay(valueHuf: number, locale: Locale = readClientLocale()): number {
  if (!Number.isFinite(valueHuf)) return 0;
  return currencyForLocale(locale) === "EUR" ? valueHuf / getHufPerEur() : valueHuf;
}

export function formatCurrency(value: number, currentLanguage: Locale = readClientLocale()): string {
  const locale = currentLanguage;
  const currency: DisplayCurrency = currencyForLocale(locale);
  const amount = hufToDisplay(value, locale);
  const intlLocale = locale === "en" ? "en-IE" : "hu-HU";
  const digits = currency === "EUR" ? 2 : 0;
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    const rounded = currency === "EUR" ? amount.toFixed(2) : String(Math.round(amount));
    return currency === "EUR" ? `€${rounded}` : `${rounded} Ft`;
  }
}

export function compactCurrency(value: number, locale: Locale = readClientLocale()): string {
  const n = hufToDisplay(value, locale);
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (locale === "en") {
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
    return `${sign}${abs.toFixed(abs >= 100 ? 0 : 2)}`;
  }
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)} M`;
  if (abs >= 1_000) return `${sign}${Math.round(abs / 1_000)} e`;
  return `${sign}${Math.round(abs)}`;
}
