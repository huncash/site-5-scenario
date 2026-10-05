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
  isJitAddonId,
  isSlotPackId,
  slotPackAllowedForTier,
  tierLabel,
  type BillInterval,
  type BillTier,
} from "./catalog.ts";
import { buyerFromCheckout } from "./checkoutReady.ts";
import { billEnv, isLiveBilling, liveBillingError, liveBillingMissingKeys } from "./env.ts";
import { quotePackage } from "./quote.ts";
import { activeReferralGiftSlots, ensureOrderReferralCode } from "./referral.ts";
import { stripeConfigured } from "./stripe.ts";
import { createOrder, getOrder, getOrderByLicenseToken, newTransferCode, updateOrder, type Buyer, type InvoiceLine, type Order, type PayMethod } from "./store.ts";
import { grossFromLines, issueSzamlazzProforma, proformaPdfPath } from "./szamlazz.ts";
import { countryFromTaxId, SELLER_COUNTRY } from "./vat.ts";
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
  if (n.includes("enterprise") || n.includes("nagyvállalat") || n.includes("nagyvallalat") || n.includes("csapat")) return "expert";
  if (n.includes("solo") || n.includes("starter") || n.includes("basic") || n.includes("alap")) return "starter";
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
    pdfUrl: order.pdfUrl,
    buyerAccountUrl: order.pdfUrl?.startsWith("https://") ? order.pdfUrl : undefined,
  };
}

function parseVatField(raw: unknown, fallback: number): number | string | { error: string } {
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "string" && /[A-Za-z.]/.test(raw)) return raw.trim();
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return { error: "A tétel áfája hibás." };
  return n;
}

async function attachProforma(order: Order): Promise<{ order: Order; issued: Awaited<ReturnType<typeof issueSzamlazzProforma>> }> {
  if (order.proformaNumber) {
    return { order, issued: { number: order.proformaNumber, pdfUrl: order.pdfUrl } };
  }
  const issued = await issueSzamlazzProforma(order);
  if (!issued.number) {
    console.warn("[bill] dijbekero skip/fail", order.id, issued.error);
    return { order, issued };
  }
  const pdfUrl = issued.buyerAccountUrl || issued.pdfUrl;
  const next =
    (await updateOrder(order.id, { proformaNumber: issued.number, pdfUrl })) ?? order;
  return { order: next, issued: { ...issued, pdfUrl } };
}

function refuseAgent(): Response | null {
  if (billEnv.szamlazzSandbox) return null;
  if (billEnv.szamlazzAgentKey) return null;
  return Response.json(
    { ok: false, error: "Számlázz.hu Agent kulcs hiányzik (SZAMLAZZ_AGENT_KEY)." },
    { status: 503 },
  );
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

function refuseLiveKeys(): Response | null {
  const error = liveBillingError();
  if (!error) return null;
  return Response.json({ ok: false, error, missingKeys: liveBillingMissingKeys() }, { status: 503 });
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
    const id = decodeURIComponent(p.slice("/api/billing/order/".length));
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return Response.json({ ok: false, error: "email_required" }, { status: 400 });
    }
    const order = (await getOrder(id)) ?? (await getOrderByLicenseToken(id));
    if (!order) return Response.json({ ok: false }, { status: 404 });
    if ((order.buyer.email ?? "").trim().toLowerCase() !== email) {
      return Response.json({ ok: false, error: "mismatch" }, { status: 403 });
    }
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
        buyerEmail: order.buyer.email,
        buyerName: order.buyer.name,
        transfer: order.payMethod === "hu_transfer" ? transferPayload(order) : undefined,
      },
    });
  }

  /** Poka-yoke belépő: token + megrendelő e-mail együtt kell. */
  if (req.method === "POST" && p === "/api/billing/portal") {
    const body = await readJson(req);
    const token = String(body.token ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!token || !email || !email.includes("@")) {
      return Response.json({ ok: false, error: "token_email_required" }, { status: 400 });
    }
    const order = await getOrderByLicenseToken(token);
    if (!order) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
    if ((order.buyer.email ?? "").trim().toLowerCase() !== email) {
      // Lean: ne áruljuk el, hogy a token létezik-e.
      return Response.json({ ok: false, error: "mismatch" }, { status: 403 });
    }
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
        buyerEmail: order.buyer.email,
        buyerName: order.buyer.name,
        transfer: order.payMethod === "hu_transfer" ? transferPayload(order) : undefined,
      },
    });
  }

  if (req.method === "POST" && p === "/api/billing/dijbekero") {
    const live = refuseLiveKeys();
    if (live) return live;
    const agent = refuseAgent();
    if (agent) return agent;
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
    const attached = await attachProforma(order);
    order = attached.order;
    if (!order.proformaNumber && !billEnv.szamlazzSandbox) {
      return Response.json(
        { ok: false, orderId: order.id, error: attached.issued.error || "A díjbekérő kiállítása sikertelen." },
        { status: 503 },
      );
    }
    return Response.json({
      ok: true,
      orderId: order.id,
      proformaNumber: order.proformaNumber,
      pdfUrl: attached.issued.pdfUrl,
      pdfBase64: attached.issued.pdfBase64,
      sandbox: attached.issued.sandbox || billEnv.szamlazzSandbox,
      issued: Boolean(order.proformaNumber && order.proformaNumber !== before),
      transfer: transferPayload(order),
      warning: order.proformaNumber ? undefined : attached.issued.error || "A díjbekérő Agent-hívás nem sikerült; a rendelés megvan, az átutalás ettől függetlenül elindítható.",
    });
  }

  if (req.method === "POST" && p === "/api/billing/checkout") {
    const live = refuseLiveKeys();
    if (live) return live;
    const agent = refuseAgent();
    if (agent) return agent;
    const body = await readJson(req);
    const tier = body.tier;
    const interval = body.interval;
    const pay = body.payMethod;
    if (!isBillTier(tier) || !isBillInterval(interval)) {
      return Response.json({ ok: false, error: "Ismeretlen csomag vagy gyakoriság." }, { status: 400 });
    }
    if (pay !== "barion" && pay !== "hu_transfer") {
      return Response.json({ ok: false, error: "Ismeretlen fizetési mód." }, { status: 400 });
    }
    if (pay === "barion" && !barionConfigured()) {
      return Response.json({ ok: false, error: "Barion nincs bekötve (BARION_POS_KEY)." }, { status: 503 });
    }
    const buyer = buyerFromCheckout(body);
    if (typeof buyer === "string") return Response.json({ ok: false, error: buyer }, { status: 400 });

    const addon = typeof body.addon === "string" && isJitAddonId(body.addon) ? body.addon : undefined;
    const slotPack =
      typeof body.slotPack === "string" && isSlotPackId(body.slotPack) && slotPackAllowedForTier(tier)
        ? body.slotPack
        : undefined;
    const quote = quotePackage(tier, interval, {
      country: buyer.country,
      taxId: buyer.taxId,
      addon,
      slotPack,
    });
    buyer.country = quote.vat.country;
    const amountHuf = quote.due.gross;
    const lines: InvoiceLine[] = quote.lines.map((line) => ({
      name: line.name,
      quantity: line.quantity,
      unit: line.unit,
      netUnitPrice: line.netUnitPrice,
      vat: quote.vat.vatCode,
    }));
    const payMethod = pay as PayMethod;
    let order = await createOrder({
      status: payMethod === "hu_transfer" ? "awaiting_transfer" : "pending",
      tier,
      interval,
      ref: typeof body.ref === "string" ? body.ref : undefined,
      slotPack,
      addon,
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
      const attached = await attachProforma(order);
      order = attached.order;
      if (!order.proformaNumber && !billEnv.szamlazzSandbox) {
        return Response.json(
          { ok: false, orderId: order.id, error: attached.issued.error || "A díjbekérő kiállítása sikertelen." },
          { status: 503 },
        );
      }
      return Response.json({
        ok: true,
        orderId: order.id,
        method: "hu_transfer",
        proformaNumber: order.proformaNumber,
        pdfUrl: attached.issued.pdfUrl,
        pdfBase64: attached.issued.pdfBase64,
        buyerAccountUrl: attached.issued.buyerAccountUrl,
        sandbox: attached.issued.sandbox || billEnv.szamlazzSandbox,
        warning: order.proformaNumber
          ? undefined
          : attached.issued.error || "A díjbekérő Agent-hívás nem sikerült; a rendelés megvan, az átutalás ettől függetlenül elindítható.",
        transfer: {
          ...transferPayload(order),
          pdfUrl: attached.issued.pdfUrl,
          pdfBase64: attached.issued.pdfBase64,
          buyerAccountUrl: attached.issued.buyerAccountUrl,
        },
      });
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
    const giftSlots = await activeReferralGiftSlots(order);
    return Response.json({
      ok: true,
      token: order.transferCode || order.id,
      tier: order.tier,
      interval: order.interval,
      status: order.status,
      referralCode: order.referralCode,
      permanentSlots: giftSlots,
      giftSlots,
      slotPacks: packs,
      referralAwarded: Boolean(order.referralAwarded),
    });
  }

  if (req.method === "GET" && p.startsWith("/api/billing/proforma/")) {
    const id = decodeURIComponent(p.slice("/api/billing/proforma/".length).replace(/\/+$/, ""));
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return Response.json({ ok: false, error: "email_required" }, { status: 400 });
    }
    const order = (await getOrder(id)) ?? (await getOrderByLicenseToken(id));
    if (!order) return Response.json({ ok: false }, { status: 404 });
    if ((order.buyer.email ?? "").trim().toLowerCase() !== email) {
      return Response.json({ ok: false, error: "mismatch" }, { status: 403 });
    }
    const pdf = await readFile(proformaPdfPath(order.id)).catch(() => null);
    if (!pdf?.length) return Response.json({ ok: false, error: "pdf_missing" }, { status: 404 });
    const name = encodeURIComponent(order.proformaNumber || order.id);
    return new Response(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="dijbekero-${name}.pdf"`,
      },
    });
  }

  if (req.method === "GET" && p === "/api/billing/quote") {
    const tier = url.searchParams.get("tier");
    const interval = url.searchParams.get("interval") === "monthly" ? "monthly" : "yearly";
    const country = url.searchParams.get("country") || SELLER_COUNTRY;
    const taxId = url.searchParams.get("taxId") ?? "";
    if (!isBillTier(tier)) return Response.json({ ok: false, error: "Ismeretlen csomag." }, { status: 400 });
    const q = quotePackage(tier, interval, {
      country,
      taxId,
      addon: url.searchParams.get("addon") || undefined,
      slotPack: url.searchParams.get("slotPack") || undefined,
    });
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
    const missingKeys = liveBillingMissingKeys();
    const agentMissing = !billEnv.szamlazzSandbox && !billEnv.szamlazzAgentKey;
    const error =
      liveBillingError() ??
      (agentMissing ? "Számlázz.hu Agent kulcs hiányzik (SZAMLAZZ_AGENT_KEY)." : undefined);
    return Response.json({
      stripe: stripeConfigured(),
      barion: barionConfigured(),
      transfer: true,
      sandbox: billEnv.szamlazzSandbox,
      szamlazz: Boolean(billEnv.szamlazzAgentKey),
      live: isLiveBilling() || !billEnv.szamlazzSandbox,
      missingKeys: agentMissing && !missingKeys.includes("SZAMLAZZ_AGENT_KEY")
        ? [...missingKeys, "SZAMLAZZ_AGENT_KEY"]
        : missingKeys,
      error,
    }, { status: liveBillingError() ? 503 : 200 });
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
    const missing = liveBillingMissingKeys();
    if (missing.length) {
      console.error(`[bill] ÉLES KULCSOK HIÁNYOZNAK: ${missing.join(", ")}`);
    }
  });
}

void start();
