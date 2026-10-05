import type { Locale } from "@/i18n/locale";
import { SUPPORT_MAIL } from "@/lib/support";

/** Enterprise csomag: látható értékhorgony, nincs önkiszolgáló checkout. */
export const ENTERPRISE_SELF_SERVE_CHECKOUT = false as const;

export function isEnterprisePlanId(id: string | null | undefined): boolean {
  const v = (id ?? "").toLowerCase();
  return v === "expert" || v === "enterprise";
}

export function enterpriseInquiryMailto(opts?: {
  locale?: Locale;
  name?: string;
  email?: string;
  message?: string;
}): string {
  const locale = opts?.locale ?? "hu";
  const subject =
    locale === "en" ? "Szcenárió — Enterprise quote request" : "Szcenárió — Enterprise ajánlatkérés";
  const intro = locale === "en" ? "Enterprise plan quote request" : "Enterprise csomag ajánlatkérés";
  const nameLine = opts?.name?.trim()
    ? `${locale === "en" ? "Name" : "Név"}: ${opts.name.trim()}`
    : "";
  const emailLine = opts?.email?.trim() ? `E-mail: ${opts.email.trim()}` : "";
  const body = [intro, nameLine, emailLine, opts?.message?.trim() ? `\n${opts.message.trim()}` : ""]
    .filter((line) => line.length > 0)
    .join("\n");
  return `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
