/** Client-side conversion helpers for the listing enquiry form. */

export type ConversionEvent =
  | "listing_phone_click"
  | "listing_cta_click"
  | "listing_phone_reveal"
  | "listing_enquiry_submit_success"
  | "listing_enquiry_submit_error"
  | "listing_gdpr_accept"
  | "listing_gdpr_decline";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function trackConversion(
  event: ConversionEvent,
  params?: Record<string, string | undefined>
): void {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    ...params,
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);

  try {
    window.dispatchEvent(new CustomEvent("eladoingatlan:conversion", { detail: payload }));
  } catch {
    // ignore
  }
}
