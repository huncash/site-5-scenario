import { applyAttributionSearchParams, type CampaignUtm } from "@/lib/campaignFunnels";
import { readCampaignAttribution } from "@/lib/campaignSession";
import { readClientLocale } from "@/i18n/locale";
import type { BillingInterval } from "@/lib/funnelOrder";

export const BILL_CHECKOUT_ORIGIN = "https://bill.szcenario.hu";

export function billPublicOrigin(): string {
  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return "http://localhost:5110";
  }
  return BILL_CHECKOUT_ORIGIN;
}

export function billCheckoutUrl(opts: {
  tier: string;
  interval?: BillingInterval;
  ref?: string;
  /** Ajánlói kód (REF-…). */
  referral?: string;
  /** Slot bővítő pack (campus kizárva a bill oldalon). */
  slotPack?: string;
  /** JIT egység-modul: case_plus_1 | slot_plus_1 | seat_plus_1 | guest_plus_1 | edge_sensor */
  addon?: string;
  country?: string;
  utm?: CampaignUtm;
}): string {
  const url = new URL("/", billPublicOrigin());
  url.searchParams.set("tier", opts.tier);
  if (opts.interval) url.searchParams.set("interval", opts.interval);
  if (opts.country) url.searchParams.set("country", opts.country);
  const pendingReferral =
    opts.referral?.trim() ||
    (typeof window !== "undefined" ? sessionStorage.getItem("szcenario_pending_referral") : null) ||
    "";
  if (pendingReferral) url.searchParams.set("referral", pendingReferral.toUpperCase());
  if (opts.slotPack) url.searchParams.set("slotPack", opts.slotPack);
  if (opts.addon) url.searchParams.set("addon", opts.addon);
  const stored = typeof window !== "undefined" ? readCampaignAttribution() : null;
  applyAttributionSearchParams(
    url,
    { id: stored?.id, utm: opts.utm ?? stored?.utm },
    opts.ref ? { ref: opts.ref } : undefined,
  );
  url.searchParams.set("lang", readClientLocale());
  return url.toString();
}
