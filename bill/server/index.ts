import "./loadenv.ts";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";

import { barionConfigured, createBarionPayment } from "./barion.ts";
import { chargeHuf, isBillInterval, isBillTier, tierLabel } from "./catalog.ts";
import { billEnv } from "./env.ts";
import { createStripeCheckout, stripeConfigured } from "./stripe.ts";
import { createOrder, getOrder, getOrderByLicenseToken, newTransferCode, updateOrder, type Buyer, type PayMethod } from "./store.ts";
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

function buyerFrom(body: Record<string, unknown>): Buyer | string {
  const name = String(body.name ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const taxId = String(body.taxId ?? "").trim();
  if (!name || !address || !email) return "Név, cím és e-mail kell.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Az e-mail formája hibás.";
  return { name, address, email, taxId };
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
        tier: order.tier,
        interval: order.interval,
        payMethod: order.payMethod,
        transferCode: order.transferCode,
        invoiceNumber: order.invoiceNumber,
      },
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

    const amountHuf = chargeHuf(tier, interval);
    const payMethod = pay as PayMethod;
    const order = await createOrder({
      status: payMethod === "hu_transfer" ? "awaiting_transfer" : "pending",
      tier,
      interval,
      ref: typeof body.ref === "string" ? body.ref : undefined,
      amountHuf,
      payMethod,
      transferCode: payMethod === "hu_transfer" ? newTransferCode() : undefined,
      buyer,
    });

    if (payMethod === "hu_transfer") {
      return Response.json({
        ok: true,
        orderId: order.id,
        method: "hu_transfer",
        transfer: {
          amountHuf: order.amountHuf,
          iban: billEnv.transferIban,
          name: billEnv.transferName,
          bank: billEnv.transferBank,
          code: order.transferCode,
          label: tierLabel(tier),
        },
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
    const order = await getOrderByLicenseToken(token);
    if (!order) return Response.json({ ok: false }, { status: 404 });
    const allowed = order.status === "paid" || order.status === "invoiced" || order.status === "awaiting_transfer";
    if (!allowed) return Response.json({ ok: false, status: order.status }, { status: 403 });
    return Response.json({
      ok: true,
      token: order.transferCode || order.id,
      tier: order.tier,
      interval: order.interval,
      status: order.status,
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
