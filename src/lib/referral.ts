/** Ajánlói azonosító + local-first ajándék-slot tükör (a bill webhook a forrásigazság fizetésnél). */

import { MAX_REFERRAL_GIFT_SLOTS } from "@/lib/scenarioSlots";

const REF_KEY = "szcenario_referral_code_v1";
const CREDITS_KEY = "szcenario_referral_credits_v1";

export { MAX_REFERRAL_GIFT_SLOTS };

export type ReferralCreditEvent = {
  id: string;
  at: string;
  /** Ajánló vagy új előfizető oldalán. */
  side: "referrer" | "referee";
  orderId: string;
  slots: number;
  /** Ha true: a pár / saját előfizetés már nem tartja aktívan a bónuszt. */
  revoked?: boolean;
};

function randomRefCode(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `REF-${hex.slice(0, 4)}-${hex.slice(4, 10)}`;
}

/** Minden előfizetőhöz egyedi ajánlói azonosító (helyben generált, bill-en is tárolható). */
export function ensureReferralCode(): string {
  try {
    const existing = localStorage.getItem(REF_KEY);
    if (existing && /^REF-[A-Z0-9]{4}-[A-Z0-9]{6}$/i.test(existing)) return existing.toUpperCase();
    const code = randomRefCode();
    localStorage.setItem(REF_KEY, code);
    return code;
  } catch {
    return randomRefCode();
  }
}

export function readReferralCode(): string | null {
  try {
    const v = localStorage.getItem(REF_KEY);
    return v ? v.toUpperCase() : null;
  } catch {
    return null;
  }
}

export function writeReferralCode(code: string): void {
  try {
    localStorage.setItem(REF_KEY, code.trim().toUpperCase());
  } catch {
    // ignore
  }
}

/** Számlázási / kártya-ujjlenyomat normalizálás (Poka-Yoke). */
export function billingFingerprint(input: {
  email?: string | null;
  taxId?: string | null;
  cardFingerprint?: string | null;
}): string {
  const email = (input.email ?? "").trim().toLowerCase();
  const tax = (input.taxId ?? "").replace(/[\s./-]/g, "").toUpperCase();
  const card = (input.cardFingerprint ?? "").trim().toLowerCase();
  return [email, tax, card].filter(Boolean).join("|");
}

export function fingerprintsMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  return a === b;
}

/**
 * Poka-Yoke: azonos számlázási vagy kártyaadatok → visszautasítás.
 * A bill webhook hívja; a kliens csak tükrözi a sikeres eseményt.
 */
export function validateReferralAward(input: {
  referrerFingerprint: string;
  refereeFingerprint: string;
  paymentOk: boolean;
  /** Mindkét fél aktív, fizetett előfizetése. */
  bothSubscriptionsActive: boolean;
  /** Ajánló aktuális aktív ajándék slotjai (cap előtt). */
  referrerActiveGifts?: number;
  /** Új előfizető aktuális aktív ajándék slotjai (cap előtt). */
  refereeActiveGifts?: number;
}):
  | { ok: true }
  | {
      ok: false;
      reason:
        | "payment_required"
        | "same_billing"
        | "subscription_inactive"
        | "cap_reached_referrer"
        | "cap_reached_referee";
    } {
  if (!input.paymentOk) return { ok: false, reason: "payment_required" };
  if (!input.bothSubscriptionsActive) return { ok: false, reason: "subscription_inactive" };
  if (fingerprintsMatch(input.referrerFingerprint, input.refereeFingerprint)) {
    return { ok: false, reason: "same_billing" };
  }
  if ((input.referrerActiveGifts ?? 0) >= MAX_REFERRAL_GIFT_SLOTS) {
    return { ok: false, reason: "cap_reached_referrer" };
  }
  if ((input.refereeActiveGifts ?? 0) >= MAX_REFERRAL_GIFT_SLOTS) {
    return { ok: false, reason: "cap_reached_referee" };
  }
  return { ok: true };
}

export function listReferralCredits(): ReferralCreditEvent[] {
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as ReferralCreditEvent[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function persistCredits(rows: ReferralCreditEvent[]): void {
  localStorage.setItem(CREDITS_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("szcenario:referral_credits"));
}

export function recordReferralCredit(
  ev: Omit<ReferralCreditEvent, "id" | "at"> & { id?: string; at?: string },
): ReferralCreditEvent {
  const row: ReferralCreditEvent = {
    id: ev.id ?? crypto.randomUUID(),
    at: ev.at ?? new Date().toISOString(),
    side: ev.side,
    orderId: ev.orderId,
    slots: ev.slots,
    revoked: ev.revoked,
  };
  const rows = listReferralCredits();
  if (rows.some((r) => r.orderId === row.orderId && r.side === row.side)) return row;
  if (activeGiftSlotsFromCredits() >= MAX_REFERRAL_GIFT_SLOTS) {
    return { ...row, revoked: true };
  }
  rows.unshift(row);
  persistCredits(rows);
  return row;
}

/** Aktív (nem visszavont) ajándék slotok — hard cap 25. */
export function activeGiftSlotsFromCredits(): number {
  const sum = listReferralCredits()
    .filter((r) => !r.revoked)
    .reduce((s, r) => s + (r.slots || 0), 0);
  return Math.min(MAX_REFERRAL_GIFT_SLOTS, sum);
}

/** @deprecated Használd: activeGiftSlotsFromCredits — a bónusz nem „permanent”. */
export function permanentSlotsFromCredits(): number {
  return activeGiftSlotsFromCredits();
}

/** Saját / pár előfizetés megszűnésekor a helyi tükör visszavonása. */
export function revokeAllReferralCredits(): void {
  const rows = listReferralCredits().map((r) => ({ ...r, revoked: true }));
  persistCredits(rows);
}

export function restoreReferralCreditsFromServer(activeCount: number): void {
  const capped = Math.min(MAX_REFERRAL_GIFT_SLOTS, Math.max(0, Math.floor(activeCount)));
  const rows = listReferralCredits();
  if (!rows.length && capped > 0) {
    persistCredits([
      {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        side: "referrer",
        orderId: "license-sync",
        slots: capped,
      },
    ]);
    return;
  }
  let remaining = capped;
  const next = rows.map((r) => {
    if (remaining <= 0) return { ...r, revoked: true };
    const take = Math.min(r.slots || 0, remaining);
    remaining -= take;
    return { ...r, revoked: false, slots: take || r.slots };
  });
  persistCredits(next);
}
