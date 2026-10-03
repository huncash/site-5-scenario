/** Ajánlói azonosító + local-first jóváírás-tükör (a bill webhook a forrásigazság fizetésnél). */

const REF_KEY = "szcenario_referral_code_v1";
const CREDITS_KEY = "szcenario_referral_credits_v1";

export type ReferralCreditEvent = {
  id: string;
  at: string;
  /** Ajánló vagy új előfizető oldalán. */
  side: "referrer" | "referee";
  orderId: string;
  slots: number;
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
}): { ok: true } | { ok: false; reason: "payment_required" | "same_billing" } {
  if (!input.paymentOk) return { ok: false, reason: "payment_required" };
  if (fingerprintsMatch(input.referrerFingerprint, input.refereeFingerprint)) {
    return { ok: false, reason: "same_billing" };
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

export function recordReferralCredit(ev: Omit<ReferralCreditEvent, "id" | "at"> & { id?: string; at?: string }): ReferralCreditEvent {
  const row: ReferralCreditEvent = {
    id: ev.id ?? crypto.randomUUID(),
    at: ev.at ?? new Date().toISOString(),
    side: ev.side,
    orderId: ev.orderId,
    slots: ev.slots,
  };
  const rows = listReferralCredits();
  if (rows.some((r) => r.orderId === row.orderId && r.side === row.side)) return row;
  rows.unshift(row);
  localStorage.setItem(CREDITS_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("szcenario:referral_credits"));
  return row;
}

export function permanentSlotsFromCredits(): number {
  return listReferralCredits().reduce((s, r) => s + (r.slots || 0), 0);
}
