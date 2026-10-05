import { applyViewPrefsToSearch } from "@/lib/viewPrefs";
import { applyAttributionSearchParams, type CampaignUtm } from "@/lib/campaignFunnels";
import { readCampaignAttribution } from "@/lib/campaignSession";
import { readClientLocale } from "@/i18n/locale";
import type { BillingInterval } from "@/lib/funnelOrder";

export const BILL_CHECKOUT_ORIGIN = "https://bill.szcenario.hu";

function hostOf(hostname?: string): string {
  return (hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();
}

function pathOf(pathname?: string): string {
  return (pathname ?? (typeof window !== "undefined" ? window.location.pathname : "")).replace(/\/+$/, "") || "/";
}

export function isBillHost(hostname?: string): boolean {
  const h = hostOf(hostname);
  return h === "bill.szcenario.hu" || h.startsWith("bill.");
}

export function isBillPath(pathname?: string): boolean {
  const path = pathOf(pathname);
  return path === "/bill" || path.startsWith("/bill/");
}

export type BillCheckoutSearch = {
  tier: string | null;
  hasCheckoutIntent: boolean;
  interval: BillingInterval;
  ref: string;
  referral: string;
  slotPack: string;
  addon: string;
  country: string;
  partnerKind: "b2c" | "b2b" | "";
  thanks: boolean;
  order: string;
  lang: string | null;
};

/** Query a számlázási nézethez — hostname/pathname független, nincs port. */
export function readBillCheckoutSearch(search = ""): BillCheckoutSearch {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const q = new URLSearchParams(raw);
  const tier = q.get("tier");
  const partnerKindRaw = q.get("partnerKind");
  return {
    tier,
    hasCheckoutIntent: Boolean(tier),
    interval: q.get("interval") === "monthly" ? "monthly" : "yearly",
    ref: q.get("ref") ?? "",
    referral: q.get("referral") ?? "",
    slotPack: q.get("slotPack") ?? "",
    addon: q.get("addon") ?? "",
    country: (q.get("country") ?? "").toUpperCase(),
    partnerKind: partnerKindRaw === "b2b" || partnerKindRaw === "b2c" ? partnerKindRaw : "",
    thanks: q.get("thanks") === "1",
    order: q.get("order") ?? "",
    lang: q.get("lang") ?? q.get("locale"),
  };
}

export function billSearchFromLocation(): string {
  if (typeof window === "undefined") return "";
  return window.location.search;
}

export function billPublicOrigin(hostname?: string, pathname?: string): string {
  if (isBillHost(hostname)) {
    const h = hostOf(hostname);
    if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === h) {
      return window.location.origin;
    }
    return BILL_CHECKOUT_ORIGIN;
  }
  if (isBillPath(pathname)) {
    const h = hostOf(hostname);
    if (typeof window !== "undefined" && window.location.hostname.toLowerCase() === h) {
      return window.location.origin;
    }
  }
  return BILL_CHECKOUT_ORIGIN;
}

/** Checkout path: bill host → `/`, same-origin `/bill` → `/bill`, egyébként a publikus origin gyökere. */
export function billCheckoutPath(hostname?: string, pathname?: string): string {
  if (isBillHost(hostname)) return "/";
  if (isBillPath(pathname)) return "/bill";
  return "/";
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
  partnerKind?: "b2c" | "b2b";
  utm?: CampaignUtm;
  hostname?: string;
  pathname?: string;
}): string {
  const origin = billPublicOrigin(opts.hostname, opts.pathname);
  const path = billCheckoutPath(opts.hostname, opts.pathname);
  const url = new URL(path, origin.endsWith("/") ? origin : `${origin}/`);
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
  if (opts.partnerKind) url.searchParams.set("partnerKind", opts.partnerKind);
  const stored = typeof window !== "undefined" ? readCampaignAttribution() : null;
  applyAttributionSearchParams(
    url,
    { id: stored?.id, utm: opts.utm ?? stored?.utm },
    opts.ref ? { ref: opts.ref } : undefined,
  );
  url.searchParams.set("lang", readClientLocale());
  applyViewPrefsToSearch(url);
  return url.toString();
}
