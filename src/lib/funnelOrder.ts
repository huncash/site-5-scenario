import type { TierId } from "@/content/pricing/tiers";
import { TIER_MONTHLY_HUF, yearlyPriceHuf } from "@/content/pricing/tiers";
import type { CampaignId, CampaignUtm } from "@/lib/campaignFunnels";

export type BillingInterval = "yearly" | "monthly";
export type PayMethod = "wise" | "hu_transfer";

export const DEFAULT_BILLING_INTERVAL: BillingInterval = "monthly";
const INTERVAL_KEY = "ui:billingInterval";
export const BILLING_INTERVAL_EVENT = "szcenario:billing_interval";

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "yearly" || value === "monthly";
}

export function readBillingInterval(): BillingInterval {
  if (typeof window === "undefined") return DEFAULT_BILLING_INTERVAL;
  try {
    const raw = sessionStorage.getItem(INTERVAL_KEY);
    return isBillingInterval(raw) ? raw : DEFAULT_BILLING_INTERVAL;
  } catch {
    return DEFAULT_BILLING_INTERVAL;
  }
}

export function writeBillingInterval(interval: BillingInterval) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INTERVAL_KEY, interval);
    window.dispatchEvent(new Event(BILLING_INTERVAL_EVENT));
  } catch {
    /* ignore */
  }
}

const KEY = "szcenario_funnel_activation";

export type ActivationTicket = {
  token: string;
  createdAt: string;
  funnelName: string;
  tierId: TierId;
  tierLabel: string;
  interval: BillingInterval;
  payMethod: PayMethod;
  amountHuf: number;
  emailHint: string;
  profileLabel: string;
  used: boolean;
  campaignId?: CampaignId;
  utm?: CampaignUtm;
};

export function chargeHuf(tierId: TierId, interval: BillingInterval): number {
  const m = TIER_MONTHLY_HUF[tierId];
  return interval === "yearly" ? yearlyPriceHuf(m) : m;
}

export function readActivationTicket(): ActivationTicket | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as ActivationTicket;
    if (!t?.token) return null;
    return t;
  } catch {
    return null;
  }
}

export function writeActivationTicket(t: ActivationTicket): void {
  sessionStorage.setItem(KEY, JSON.stringify(t));
}

export function peekActivationTicket(token: string): ActivationTicket | null {
  const t = readActivationTicket();
  if (!t || t.token !== token || t.used) return null;
  return t;
}

export function consumeActivationTicket(token: string): ActivationTicket | null {
  const t = peekActivationTicket(token);
  if (!t) return null;
  writeActivationTicket({ ...t, used: true });
  return t;
}

export function newToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
