import { barionApiBase, billEnv } from "./env.ts";
import { formatHuf, tierLabel } from "./catalog.ts";
import type { Order } from "./store.ts";

export function barionConfigured(): boolean {
  return Boolean(billEnv.barionPosKey);
}

export async function createBarionPayment(order: Order): Promise<{ url: string; paymentId?: string } | { error: string }> {
  if (!billEnv.barionPosKey) return { error: "Barion nincs bekötve (BARION_POSKEY)." };
  const payload = {
    POSKey: billEnv.barionPosKey,
    PaymentType: "Immediate",
    GuestCheckOut: true,
    FundingSources: ["All"],
    PaymentRequestId: order.id,
    Locale: "hu-HU",
    Currency: "HUF",
    RedirectUrl: `${billEnv.publicUrl}/?thanks=1&order=${encodeURIComponent(order.id)}`,
    CallbackUrl: `${billEnv.publicUrl}/api/billing/webhook?provider=barion`,
    Transactions: [
      {
        POSTransactionId: order.id,
        Payee: billEnv.barionPayee || order.buyer.email,
        Total: order.amountHuf,
        Comment: `Szcenárió ${tierLabel(order.tier)} · ${formatHuf(order.amountHuf)}`,
        Items: [
          {
            Name: `Szcenárió — ${tierLabel(order.tier)}`,
            Description: order.interval === "yearly" ? "Éves előfizetés" : "Havi előfizetés",
            Quantity: 1,
            Unit: "csomag",
            UnitPrice: order.amountHuf,
            ItemTotal: order.amountHuf,
          },
        ],
      },
    ],
  };

  const res = await fetch(`${barionApiBase()}/v2/Payment/Start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as {
    GatewayUrl?: string;
    PaymentId?: string;
    Errors?: Array<{ Title?: string; Description?: string }>;
  };
  if (!res.ok || !data.GatewayUrl) {
    const msg = data.Errors?.map((e) => e.Description || e.Title).filter(Boolean).join("; ");
    return { error: msg || `Barion ${res.status}` };
  }
  return { url: data.GatewayUrl, paymentId: data.PaymentId };
}

export async function barionPaymentSucceeded(paymentId: string): Promise<boolean> {
  if (!billEnv.barionPosKey) return false;
  const url = new URL(`${barionApiBase()}/v2/Payment/GetPaymentState`);
  url.searchParams.set("POSKey", billEnv.barionPosKey);
  url.searchParams.set("PaymentId", paymentId);
  const res = await fetch(url);
  if (!res.ok) return false;
  const data = (await res.json()) as { Status?: string; PaymentRequestId?: string };
  return data.Status === "Succeeded" || data.Status === "Reserved";
}
