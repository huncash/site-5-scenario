import type { Locale } from "@/i18n/locale";
import type { BillingInterval } from "@/lib/funnelOrder";

/** Következő fordulónap: éves +1 év, havi +1 hónap a tranzakció napjától. */
export function nextRenewalDate(interval: BillingInterval, from: Date = new Date()): Date {
  const d = new Date(from.getTime());
  if (interval === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

/** HU: `2027. október 3.` · EN: `3 October 2027` */
export function formatRenewalDate(date: Date, locale: Locale): string {
  const intlLocale = locale === "en" ? "en-GB" : "hu-HU";
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
