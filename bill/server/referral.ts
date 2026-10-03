import { listOrdersByReferralCode, updateOrder, type Order } from "./store.ts";

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

export function validateReferralAward(input: {
  referrerFingerprint: string;
  refereeFingerprint: string;
  paymentOk: boolean;
}): { ok: true } | { ok: false; reason: "payment_required" | "same_billing" } {
  if (!input.paymentOk) return { ok: false, reason: "payment_required" };
  if (input.referrerFingerprint && input.refereeFingerprint && input.referrerFingerprint === input.refereeFingerprint) {
    return { ok: false, reason: "same_billing" };
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

/** Sikeres fizetés után: +1 permanent mindkét félnek, ha a fingerprint nem egyezik. */
export async function applyReferralOnPaid(
  order: Order,
  opts?: { cardFingerprint?: string | null },
): Promise<{ awarded: boolean; reason?: string }> {
  if (order.referralAwarded) return { awarded: false, reason: "already_awarded" };
  const code = (order.referredBy ?? "").trim().toUpperCase();
  if (!code) return { awarded: false, reason: "no_referral" };

  const paymentOk = order.status === "paid" || order.status === "invoiced";
  if (!paymentOk) return { awarded: false, reason: "payment_required" };

  const referrers = await listOrdersByReferralCode(code);
  const referrer = referrers.find((o) => o.id !== order.id && (o.status === "paid" || o.status === "invoiced"));
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
  const check = validateReferralAward({
    referrerFingerprint: refFp,
    refereeFingerprint: newFp,
    paymentOk: true,
  });
  if (!check.ok) {
    await updateOrder(order.id, { referralRejectedReason: check.reason });
    return { awarded: false, reason: check.reason };
  }

  const referrerSlots = (referrer.permanentSlots ?? 0) + 1;
  const refereeSlots = (order.permanentSlots ?? 0) + 1;
  await updateOrder(referrer.id, { permanentSlots: referrerSlots });
  await updateOrder(order.id, {
    permanentSlots: refereeSlots,
    referralAwarded: true,
    cardFingerprint: opts?.cardFingerprint ?? order.cardFingerprint,
  });
  return { awarded: true };
}
