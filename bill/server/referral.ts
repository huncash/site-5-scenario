import { getOrder, listOrdersByReferralCode, updateOrder, type Order } from "./store.ts";

export const MAX_REFERRAL_GIFT_SLOTS = 25;

export type ReferralGiftLink = {
  peerOrderId: string;
  at: string;
};

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

export function isPaidSubscriptionActive(order: Order): boolean {
  return order.status === "paid" || order.status === "invoiced";
}

export function validateReferralAward(input: {
  referrerFingerprint: string;
  refereeFingerprint: string;
  paymentOk: boolean;
  bothSubscriptionsActive: boolean;
  referrerActiveGifts?: number;
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
  if (
    input.referrerFingerprint &&
    input.refereeFingerprint &&
    input.referrerFingerprint === input.refereeFingerprint
  ) {
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

function newReferralCode(): string {
  const n = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `REF-${n.slice(0, 4)}-${n.slice(4, 10)}`;
}

export async function ensureOrderReferralCode(order: Order): Promise<Order> {
  if (order.referralCode) return order;
  return (await updateOrder(order.id, { referralCode: newReferralCode() })) ?? order;
}

/** Aktív ajándék slotok: csak ha mindkét fél fizetett előfizetése él. Cap: 25. */
export async function activeReferralGiftSlots(order: Order): Promise<number> {
  if (!isPaidSubscriptionActive(order)) return 0;
  const gifts = order.referralGifts ?? [];
  if (gifts.length === 0) {
    // Legacy mező: permanentSlots — csak saját aktív státusz mellett.
    return Math.min(MAX_REFERRAL_GIFT_SLOTS, Math.max(0, order.permanentSlots ?? 0));
  }
  let n = 0;
  for (const g of gifts) {
    const peer = await getOrder(g.peerOrderId);
    if (peer && isPaidSubscriptionActive(peer)) n += 1;
  }
  return Math.min(MAX_REFERRAL_GIFT_SLOTS, n);
}

/**
 * Sikeres fizetés után: mindkét fél +1 ajándék slotot kap,
 * amíg mindkettő aktív előfizetést tart (max 25 / fél).
 */
export async function applyReferralOnPaid(
  order: Order,
  opts?: { cardFingerprint?: string | null },
): Promise<{ awarded: boolean; reason?: string }> {
  if (order.referralAwarded) return { awarded: false, reason: "already_awarded" };
  const code = (order.referredBy ?? "").trim().toUpperCase();
  if (!code) return { awarded: false, reason: "no_referral" };

  const paymentOk = isPaidSubscriptionActive(order);
  if (!paymentOk) return { awarded: false, reason: "payment_required" };

  const referrers = await listOrdersByReferralCode(code);
  const referrer = referrers.find((o) => o.id !== order.id && isPaidSubscriptionActive(o));
  if (!referrer) return { awarded: false, reason: "referrer_not_found" };

  const refFp = billingFingerprint({
    email: referrer.buyer.email,
    taxId: referrer.buyer.taxId,
    cardFingerprint: referrer.cardFingerprint,
  });
  const newFp = billingFingerprint({
    email: order.buyer.email,
    taxId: order.buyer.taxId,
    cardFingerprint: opts?.cardFingerprint ?? order.cardFingerprint,
  });

  const referrerActive = await activeReferralGiftSlots(referrer);
  const refereeActive = await activeReferralGiftSlots(order);

  const check = validateReferralAward({
    referrerFingerprint: refFp,
    refereeFingerprint: newFp,
    paymentOk: true,
    bothSubscriptionsActive: isPaidSubscriptionActive(referrer) && isPaidSubscriptionActive(order),
    referrerActiveGifts: referrerActive,
    refereeActiveGifts: refereeActive,
  });
  if (!check.ok) {
    await updateOrder(order.id, { referralRejectedReason: check.reason });
    return { awarded: false, reason: check.reason };
  }

  const at = new Date().toISOString();
  const referrerGifts = [...(referrer.referralGifts ?? []), { peerOrderId: order.id, at }];
  const refereeGifts = [...(order.referralGifts ?? []), { peerOrderId: referrer.id, at }];

  const referrerNext = Math.min(MAX_REFERRAL_GIFT_SLOTS, referrerActive + 1);
  const refereeNext = Math.min(MAX_REFERRAL_GIFT_SLOTS, refereeActive + 1);

  await updateOrder(referrer.id, {
    referralGifts: referrerGifts,
    permanentSlots: referrerNext,
  });
  await updateOrder(order.id, {
    referralGifts: refereeGifts,
    permanentSlots: refereeNext,
    referralAwarded: true,
    cardFingerprint: opts?.cardFingerprint ?? order.cardFingerprint,
  });
  return { awarded: true };
}
