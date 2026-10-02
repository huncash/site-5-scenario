import type { BillingInterval } from "@/lib/funnelOrder";

export const BILL_CHECKOUT_ORIGIN = "https://bill.szcenario.hu";

export function billPublicOrigin(): string {
  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return "http://localhost:4110";
  }
  return BILL_CHECKOUT_ORIGIN;
}

export function billCheckoutUrl(opts: {
  tier: string;
  interval?: BillingInterval;
  ref?: string;
  country?: string;
}): string {
  const url = new URL("/", billPublicOrigin());
  url.searchParams.set("tier", opts.tier);
  if (opts.interval) url.searchParams.set("interval", opts.interval);
  if (opts.ref) url.searchParams.set("ref", opts.ref);
  if (opts.country) url.searchParams.set("country", opts.country);
  return url.toString();
}
