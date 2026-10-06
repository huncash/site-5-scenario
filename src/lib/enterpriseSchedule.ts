import type { Locale } from "@/i18n/locale";
import { supportTicketHref, type SupportHrefLoc } from "@/lib/support";

/** Enterprise csomag: látható értékhorgony, nincs önkiszolgáló checkout. */
export const ENTERPRISE_SELF_SERVE_CHECKOUT = false as const;

export function isEnterprisePlanId(id: string | null | undefined): boolean {
  const v = (id ?? "").toLowerCase();
  return v === "expert" || v === "enterprise";
}

export function enterpriseInquirySubject(locale: Locale = "hu"): string {
  return locale === "en"
    ? "Enterprise & teams quote request"
    : "Enterprise & Csapatok ajánlatkérés";
}

/** Belső Support jegyűrlap — nincs mailto, nem lép ki a böngészőből. */
export function enterpriseInquiryHref(opts?: { locale?: Locale } & SupportHrefLoc): string {
  return supportTicketHref({
    subject: enterpriseInquirySubject(opts?.locale ?? "hu"),
    hostname: opts?.hostname,
    pathname: opts?.pathname,
  });
}
