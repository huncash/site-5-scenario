import "./loadenv.ts";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";

import { barionConfigured, createBarionPayment } from "./barion.ts";
import {
  isBillInterval,
  isBillTier,
  isSlotPackId,
  slotPackAllowedForTier,
  SLOT_PACK_HUF,
  SLOT_PACK_LABELS,
  tierLabel,
  type BillInterval,
  type BillTier,
} from "./catalog.ts";
import { billEnv } from "./env.ts";
import { quotePackage } from "./quote.ts";
import { ensureOrderReferralCode } from "./referral.ts";
import { createStripeCheckout, stripeConfigured } from "./stripe.ts";
import { createOrder, getOrder, getOrderByLicenseToken, newTransferCode, updateOrder, type Buyer, type InvoiceLine, type Order, type PayMethod } from "./store.ts";
import { grossFromLines, issueSzamlazzProforma } from "./szamlazz.ts";
import { countryFromTaxId, SELLER_COUNTRY, splitVat } from "./vat.ts";
import { lookupCompany } from "./vies.ts";
import { handleBillingWebhook } from "./webhooks.ts";

const BILL_ROOT = fileURLToPath(new URL("..", import.meta.url));


function nodeToWeb(req: IncomingMessage): Request {
  const host = req.headers.host ?? `127.0.0.1:${billEnv.port}`;
  const url = new URL(req.url ?? "/", `http://${host}`);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v) continue;
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else headers.set(k, v);
  }
  const method = req.method ?? "GET";
  if (method === "GET" || method === "HEAD") return new Request(url, { method, headers });
  return new Request(url, { method, headers, body: req as unknown as BodyInit, duplex: "half" } as RequestInit);
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function inferTier(name: string): BillTier {
  const n = name.toLowerCase();
  if (n.includes("campus") || n.includes("hallgató")) return "campus";
  if (n.includes("enterprise") || n.includes("nagyvállalat") || n.includes("nagyvallalat")) return "expert";
  if (n.includes("alap")) return "starter";
  return "pro";
}

function inferInterval(name: string): BillInterval {
  return /hó|havi|month/i.test(name) ? "monthly" : "yearly";
}

function vatHint(order: Order): string {
  if (order.vatTreatment === "reverse_charge") return "0% ÁFA · fordított adózás";
  if (order.vatTreatment === "export") return "0% ÁFA · export";
  if (order.vatRate != null) return `${order.vatRate}% ÁFA`;
  if (order.vatCode) return `${order.vatCode} ÁFA`;
  return "ÁFA";
}

function transferPayload(order: Order) {
  return {
    amountHuf: order.amountHuf,
    netHuf: order.netHuf,
    vatRate: order.vatRate,
    vatCode: order.vatCode,
    vatTreatment: order.vatTreatment,
    vatLabel: vatHint(order),
    buyerCountry: order.buyerCountry,
    iban: billEnv.transferIban,
    name: billEnv.transferName,
    bank: billEnv.transferBank,
    code: order.transferCode,
    label: tierLabel(order.tier),
    proformaNumber: order.proformaNumber,
  };
}

function parseVatField(raw: unknown, fallback: number): number | string | { error: string } {
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "string" && /[A-Za-z.]/.test(raw)) return raw.trim();
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return { error: "A tétel áfája hibás." };
  return n;
}

async function attachProforma(order: Order): Promise<Order> {
  if (order.proformaNumber) return order;
  const issued = await issueSzamlazzProforma(order);
  if (!issued.number) {
    console.warn("[bill] dijbekero skip/fail", order.id, issued.error);
    return order;
  }
  return (await updateOrder(order.id, { proformaNumber: issued.number })) ?? order;
}

function invoiceLinesFrom(raw: unknown): InvoiceLine[] | string {
  if (!Array.isArray(raw) || raw.length === 0) return "Legalább egy tétel kell.";
  const lines: InvoiceLine[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") return "Hibás tétel.";
    const item = row as Record<string, unknown>;
    const name = String(item.name ?? "").trim();
    const quantity = Number(item.quantity);
    const netUnitPrice = Number(item.netUnitPrice);
    const vat = parseVatField(item.vat, billEnv.szamlazzVat);
    if (!name) return "A tétel megnevezése hiányzik.";
    if (!Number.isFinite(quantity) || quantity <= 0) return "A tétel mennyisége hibás.";
    if (!Number.isFinite(netUnitPrice) || netUnitPrice < 0) return "A tétel nettó ára hibás.";
    if (typeof vat === "object") return vat.error;
    lines.push({
      name,
      quantity,
      unit: String(item.unit ?? "db").trim() || "db",
      netUnitPrice,
      vat,
    });
  }
  return lines;
}

function buyerFromStructured(raw: unknown): Buyer | string {
  if (!raw || typeof raw !== "object") return "A vevő adatai hiányoznak.";
  const b = raw as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  const zip = String(b.zip ?? "").trim();
  const city = String(b.city ?? "").trim();
  const street = String(b.address ?? "").trim();
  const email = String(b.email ?? "").trim();
  const taxId = String(b.taxNumber ?? b.taxId ?? "").trim();
  const country = String(b.country ?? "").trim() || countryFromTaxId(taxId) || undefined;
  const address = [zip, city, street].filter(Boolean).join(" ") || street;
  if (!name || !address || !email) return "Név, cím és e-mail kell.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Az e-mail formája hibás.";
  return { name, address, zip, city, country, taxId, email };
}

function buyerFrom(body: Record<string, unknown>): Buyer | string {
  const name = String(body.name ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const taxId = String(body.taxId ?? "").trim();
  const country = String(body.country ?? "").trim() || countryFromTaxId(taxId) || undefined;
  if (!name || !address || !email) return "Név, cím és e-mail kell.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Az e-mail formája hibás.";
  return { name, address, email, taxId, country };
}

async function handleApi(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const p = url.pathname;

  if (req.method === "POST" && p === "/api/billing/lookup") {
    const body = await readJson(req);
    const taxId = String(body.taxId ?? "");
    const result = await lookupCompany(taxId, billEnv.navLookupUrl || undefined);
    return Response.json(result);
  }

  if (req.method === "GET" && p.startsWith("/api/billing/order/")) {
    const id = p.slice("/api/billing/order/".length);
    const order = await getOrder(id);
    if (!order) return Response.json({ ok: false }, { status: 404 });
    return Response.json({
      ok: true,
      order: {
        id: order.id,
        status: order.status,
        amountHuf: order.amountHuf,
        netHuf: order.netHuf,
        vatRate: order.vatRate,
        vatCode: order.vatCode,
        vatTreatment: order.vatTreatment,
        buyerCountry: order.buyerCountry,
        tier: order.tier,
        interval: order.interval,
        payMethod: order.payMethod,
        transferCode: order.transferCode,
        invoiceNumber: order.invoiceNumber,
        proformaNumber: order.proformaNumber,
      },
    });
  }

  if (req.method === "POST" && p === "/api/billing/dijbekero") {
    const body = await readJson(req);
    const buyer = buyerFromStructured(body.buyer);
    if (typeof buyer === "string") return Response.json({ ok: false, error: buyer }, { status: 400 });
    const lines = invoiceLinesFrom(body.items);
    if (typeof lines === "string") return Response.json({ ok: false, error: lines }, { status: 400 });
    const amountHuf = grossFromLines(lines);
    if (amountHuf <= 0) return Response.json({ ok: false, error: "A tételösszeg nulla." }, { status: 400 });

    const requestedId = String(body.orderId ?? "").trim();
    let order = requestedId ? await getOrder(requestedId) : null;
    if (order) {
      if (order.status === "paid" || order.status === "invoiced") {
        return Response.json({
          ok: true,
          orderId: order.id,
          proformaNumber: order.proformaNumber,
          invoiceNumber: order.invoiceNumber,
          status: order.status,
          transfer: transferPayload(order),
        });
      }
      if (!order.proformaNumber) {
        order =
          (await updateOrder(order.id, { buyer, lines, amountHuf, payMethod: "hu_transfer" })) ?? order;
      }
    } else {
      const firstName = lines[0]?.name ?? "";
      try {
        order = await createOrder({
          id: requestedId || undefined,
          status: "awaiting_transfer",
          tier: inferTier(firstName),
          interval: inferInterval(firstName),
          amountHuf,
          payMethod: "hu_transfer",
          transferCode: requestedId && requestedId.startsWith("SZC-") ? requestedId : newTransferCode(),
          buyer,
          lines,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "A rendelést nem sikerült rögzíteni.";
        return Response.json({ ok: false, error: msg }, { status: 409 });
      }
    }

    const before = order.proformaNumber;
    order = await attachProforma(order);
    return Response.json({
      ok: true,
      orderId: order.id,
      proformaNumber: order.proformaNumber,
      issued: Boolean(order.proformaNumber && order.proformaNumber !== before),
      transfer: transferPayload(order),
      warning: order.proformaNumber ? undefined : "A díjbekérő Agent-hívás nem sikerült; a rendelés megvan, az átutalás ettől függetlenül elindítható.",
    });
  }

  if (req.method === "POST" && p === "/api/billing/checkout") {
    const body = await readJson(req);
    const tier = body.tier;
    const interval = body.interval;
    const pay = body.payMethod;
    if (!isBillTier(tier) || !isBillInterval(interval)) {
      return Response.json({ ok: false, error: "Ismeretlen csomag vagy gyakoriság." }, { status: 400 });
    }
    if (pay !== "stripe" && pay !== "barion" && pay !== "hu_transfer") {
      return Response.json({ ok: false, error: "Ismeretlen fizetési mód." }, { status: 400 });
    }
    const buyer = buyerFrom(body);
    if (typeof buyer === "string") return Response.json({ ok: false, error: buyer }, { status: 400 });

    const quote = quotePackage(tier, interval, { country: buyer.country, taxId: buyer.taxId });
    buyer.country = quote.vat.country;
    const amountHuf = quote.due.gross;
    const intervalLabel = interval === "yearly" ? "1 év" : "1 hó";
    const lines: InvoiceLine[] = [
      {
        name: `Szcenárió — ${tierLabel(tier)} (${intervalLabel})`,
        quantity: 1,
        unit: "db",
        netUnitPrice: quote.dueNet,
        vat: quote.vat.vatCode,
      },
    ];
    const payMethod = pay as PayMethod;
    let order = await createOrder({
      status: payMethod === "hu_transfer" ? "awaiting_transfer" : "pending",
      tier,
      interval,
      ref: typeof body.ref === "string" ? body.ref : undefined,
      amountHuf,
      netHuf: quote.dueNet,
      vatRate: quote.vat.rate,
      vatCode: quote.vat.vatCode,
      vatTreatment: quote.vat.treatment,
      buyerCountry: quote.vat.country,
      payMethod,
      transferCode: payMethod === "hu_transfer" ? newTransferCode() : undefined,
      buyer,
      lines,
    });

    if (payMethod === "hu_transfer") {
      order = await attachProforma(order);
      return Response.json({
        ok: true,
        orderId: order.id,
        method: "hu_transfer",
        proformaNumber: order.proformaNumber,
        transfer: transferPayload(order),
      });
    }

    if (payMethod === "stripe") {
      const session = await createStripeCheckout(order);
      if ("error" in session) return Response.json({ ok: false, orderId: order.id, error: session.error }, { status: 503 });
      await updateOrder(order.id, { providerRef: session.url });
      return Response.json({ ok: true, orderId: order.id, hostedUrl: session.url });
    }

    const session = await createBarionPayment(order);
    if ("error" in session) return Response.json({ ok: false, orderId: order.id, error: session.error }, { status: 503 });
    if (session.paymentId) await updateOrder(order.id, { providerRef: session.paymentId });
    return Response.json({ ok: true, orderId: order.id, hostedUrl: session.url });
  }

  if (p === "/api/billing/webhook") {
    if (req.method !== "POST") return new Response("method", { status: 405 });
    return handleBillingWebhook(req);
  }

  if (req.method === "GET" && p === "/api/billing/license") {
    const token = url.searchParams.get("token") ?? "";
    let order = await getOrderByLicenseToken(token);
    if (!order) return Response.json({ ok: false }, { status: 404 });
    const allowed = order.status === "paid" || order.status === "invoiced" || order.status === "awaiting_transfer";
    if (!allowed) return Response.json({ ok: false, status: order.status }, { status: 403 });
    order = await ensureOrderReferralCode(order);
    const packs: string[] = [];
    if (order.slotPack && isSlotPackId(order.slotPack)) packs.push(order.slotPack);
    return Response.json({
      ok: true,
      token: order.transferCode || order.id,
      tier: order.tier,
      interval: order.interval,
      status: order.status,
      referralCode: order.referralCode,
      permanentSlots: order.permanentSlots ?? 0,
      slotPacks: packs,
      referralAwarded: Boolean(order.referralAwarded),
    });
  }

  if (req.method === "GET" && p === "/api/billing/quote") {
    const tier = url.searchParams.get("tier");
    const interval = url.searchParams.get("interval") === "monthly" ? "monthly" : "yearly";
    const country = url.searchParams.get("country") || SELLER_COUNTRY;
    const taxId = url.searchParams.get("taxId") ?? "";
    if (!isBillTier(tier)) return Response.json({ ok: false, error: "Ismeretlen csomag." }, { status: 400 });
    const q = quotePackage(tier, interval, { country, taxId });
    return Response.json({
      ok: true,
      country: q.vat.country,
      rate: q.vat.rate,
      vatCode: q.vat.vatCode,
      treatment: q.vat.treatment,
      labelHu: q.vat.labelHu,
      net: q.due.net,
      vat: q.due.vat,
      gross: q.due.gross,
    });
  }

  if (req.method === "GET" && p === "/api/billing/config") {
    return Response.json({
      stripe: stripeConfigured(),
      barion: barionConfigured(),
      transfer: true,
    });
  }

  return Response.json({ ok: false, error: "not found" }, { status: 404 });
}

function send(res: ServerResponse, web: Response): void {
  res.statusCode = web.status;
  web.headers.forEach((v, k) => res.setHeader(k, v));
  if (!web.body) {
    res.end();
    return;
  }
  void web.arrayBuffer().then((buf) => res.end(Buffer.from(buf)));
}

const isProd = process.env.NODE_ENV === "production";
let vite: ViteDevServer | null = null;

async function start() {
  if (!isProd) {
    vite = await createViteServer({
      configFile: path.join(BILL_ROOT, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
  }

  const server = createServer((req, res) => {
    const url = req.url ?? "/";
    if (url.startsWith("/api/")) {
      const webReq = nodeToWeb(req);
      void handleApi(webReq)
        .then((web) => send(res, web))
        .catch((err) => {
          console.error(err);
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: "server" }));
        });
      return;
    }

    if (vite) {
      vite.middlewares(req, res, () => {
        res.statusCode = 404;
        res.end();
      });
      return;
    }

    const file = url === "/" ? "/index.html" : url.split("?")[0];
    const abs = path.join(BILL_ROOT, "dist", file);
    void readFile(abs)
      .then((buf) => {
        const ext = path.extname(abs);
        res.setHeader(
          "content-type",
          ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "text/html; charset=utf-8",
        );
        res.end(buf);
      })
      .catch(() => {
        void readFile(path.join(BILL_ROOT, "dist", "index.html")).then(
          (buf) => {
            res.setHeader("content-type", "text/html; charset=utf-8");
            res.end(buf);
          },
          () => {
            res.statusCode = 404;
            res.end("not found");
          },
        );
      });
  });

  server.listen(billEnv.port, "0.0.0.0", () => {
    console.log(`[bill] listening on ${billEnv.port} · ${billEnv.publicUrl}`);
  });
}

void start();
