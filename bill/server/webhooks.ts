import { createHmac, timingSafeEqual } from "node:crypto";

import { billEnv } from "./env.ts";
import { barionPaymentSucceeded } from "./barion.ts";
import { applyReferralOnPaid, ensureOrderReferralCode } from "./referral.ts";
import { issueSzamlazzInvoice } from "./szamlazz.ts";
import { getOrder, getOrderByProviderRef, getOrderByTransferCode, updateOrder, type Order } from "./store.ts";

function stripeOk(payload: string, header: string | null): boolean {
  if (!billEnv.stripeWebhookSecret || !header) return false;
  const items = Object.fromEntries(
    header.split(",").map((p) => {
      const i = p.indexOf("=");
      return [p.slice(0, i), p.slice(i + 1)];
    }),
  );
  const t = items.t;
  const v1 = items.v1;
  if (!t || !v1) return false;
  const expected = createHmac("sha256", billEnv.stripeWebhookSecret).update(`${t}.${payload}`).digest("hex");
  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function markPaidAndInvoice(
  order: Order,
  providerRef?: string,
  cardFingerprint?: string | null,
): Promise<Order> {
  if (order.status === "invoiced") {
    await applyReferralOnPaid(order, { cardFingerprint });
    return order;
  }
  const patch: Partial<Order> = {
    status: "paid",
    providerRef: providerRef ?? order.providerRef,
  };
  if (cardFingerprint) patch.cardFingerprint = cardFingerprint;
  let next = (await updateOrder(order.id, patch)) ?? order;
  await ensureOrderReferralCode(next);
  await applyReferralOnPaid(next, { cardFingerprint });
  next = (await getOrder(order.id)) ?? next;
  if (next.invoiceNumber) return next;
  const inv = await issueSzamlazzInvoice(next);
  if (inv.number) {
    next = (await updateOrder(next.id, { status: "invoiced", invoiceNumber: inv.number })) ?? next;
  } else {
    console.warn("[bill] szamlazz skip/fail", next.id, inv.error);
  }
  return next;
}

export async function handleBillingWebhook(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider") ?? "";
  const raw = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    body = {};
  }

  if (provider === "stripe" || req.headers.get("stripe-signature")) {
    if (!stripeOk(raw, req.headers.get("stripe-signature"))) {
      return Response.json({ ok: false, error: "invalid stripe signature" }, { status: 401 });
    }
    const type = String(body.type ?? "");
    const obj = (body.data as { object?: Record<string, unknown> } | undefined)?.object ?? {};
    const orderId = String(obj.client_reference_id ?? (obj.metadata as { orderId?: string } | undefined)?.orderId ?? "");
    if (type.startsWith("checkout.session.") && orderId) {
      const order = await getOrder(orderId);
      if (order && (obj.payment_status === "paid" || type === "checkout.session.completed")) {
        const cardFp =
          String(
            (obj.metadata as { cardFingerprint?: string } | undefined)?.cardFingerprint ??
              (obj.payment_intent as { payment_method?: string } | undefined)?.payment_method ??
              "",
          ) || null;
        await markPaidAndInvoice(order, String(obj.id ?? ""), cardFp);
      }
    }
    return Response.json({ ok: true });
  }

  if (provider === "barion") {
    const paymentId = String(body.PaymentId ?? url.searchParams.get("paymentId") ?? "");
    if (!paymentId) return Response.json({ ok: false, error: "missing PaymentId" }, { status: 400 });
    const ok = await barionPaymentSucceeded(paymentId);
    if (!ok) return Response.json({ ok: true, pending: true });
    const order = await getOrderByProviderRef(paymentId);
    if (order) await markPaidAndInvoice(order, paymentId);
    return Response.json({ ok: true });
  }

  if (provider === "transfer") {
    const code = String(body.transferCode ?? url.searchParams.get("code") ?? "");
    const secret = req.headers.get("x-bill-transfer-secret") ?? "";
    if (!billEnv.transferWebhookSecret || secret !== billEnv.transferWebhookSecret) {
      return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    const order = code ? await getOrderByTransferCode(code) : null;
    if (!order) return Response.json({ ok: false, error: "order not found" }, { status: 404 });
    await markPaidAndInvoice(order);
    return Response.json({ ok: true, orderId: order.id });
  }

  return Response.json({ ok: false, error: "unknown provider" }, { status: 400 });
}
