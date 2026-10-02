import { billEnv } from "./env.ts";
import { formatHuf, tierLabel, type BillInterval, type BillTier } from "./catalog.ts";
import type { Order } from "./store.ts";

export async function createStripeCheckout(order: Order): Promise<{ url: string } | { error: string }> {
  if (!billEnv.stripeSecret) return { error: "Stripe nincs bekötve (STRIPE_SECRET_KEY)." };
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${billEnv.publicUrl}/?thanks=1&order=${encodeURIComponent(order.id)}`);
  body.set("cancel_url", `${billEnv.publicUrl}/?tier=${order.tier}&interval=${order.interval}&canceled=1`);
  body.set("customer_email", order.buyer.email);
  body.set("client_reference_id", order.id);
  body.set("metadata[orderId]", order.id);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "huf");
  body.set("line_items[0][price_data][unit_amount]", String(order.amountHuf));
  body.set("line_items[0][price_data][product_data][name]", `Szcenárió — ${tierLabel(order.tier as BillTier)}`);
  body.set(
    "line_items[0][price_data][product_data][description]",
    `${order.interval === "yearly" ? "Éves" : "Havi"} · ${formatHuf(order.amountHuf)}`,
  );
  // Hosted Checkout: card + wallets (Apple Pay / Google Pay a Stripe Dashboard + domain után).
  body.append("payment_method_types[]", "card");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${billEnv.stripeSecret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await res.json()) as { url?: string; error?: { message?: string }; id?: string };
  if (!res.ok || !data.url) return { error: data.error?.message || `Stripe ${res.status}` };
  return { url: data.url };
}

export function stripeConfigured(): boolean {
  return Boolean(billEnv.stripeSecret);
}

export type { BillInterval };
