/**
 * Éles host E2E — csak GET / hiányos POST / hamis token.
 * Teljes checkout TILOS (élő Számlázz Agent).
 */
import { describe, expect, it } from "vitest";

import { parseBillingJson } from "../../bill/src/parseBillingJson.ts";
import { PLANS_CONFIG } from "@/config/plans";
import { hu } from "@/i18n/hu";

const RUN = process.env.LIVE_E2E === "1" || process.env.npm_lifecycle_event === "test:live";

const BILL = "https://bill.szcenario.hu";
const MAIN = "https://szcenario.hu";
const SUPPORT = "https://support.szcenario.hu";

async function liveFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, redirect: "follow" });
}

async function liveJson<T>(url: string, init?: RequestInit): Promise<{
  status: number;
  ct: string;
  data: T;
}> {
  const res = await liveFetch(url, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  return { status: res.status, ct, data: parseBillingJson<T>(text, ct) };
}

describe.skipIf(!RUN)("Éles E2E — bill API routing + katalógus (nincs valós rendelés)", () => {
  it("GET /api/billing/config JSON, nem SPA HTML", async () => {
    const { status, data } = await liveJson<{
      ok?: boolean;
      error?: string;
      transfer?: boolean;
      sandbox?: boolean;
      missingKeys?: string[];
    }>(`${BILL}/api/billing/config`);
    expect([200, 503]).toContain(status);
    expect(data.transfer).toBe(true);
    if (status === 503) {
      expect(data.error).toMatch(/kulcs/i);
      expect(data.missingKeys?.length).toBeGreaterThan(0);
    }
  });

  it("hivatalos nettó / bruttó ár a quote API-n", async () => {
    const cases = [
      { tier: "starter", net: PLANS_CONFIG.starter.priceHuf },
      { tier: "pro", net: PLANS_CONFIG.pro.priceHuf },
      { tier: "expert", net: PLANS_CONFIG.expert.priceHuf },
    ] as const;
    for (const row of cases) {
      const { status, data } = await liveJson<{
        ok?: boolean;
        net?: number;
        vat?: number;
        gross?: number;
        rate?: number;
        country?: string;
      }>(`${BILL}/api/billing/quote?tier=${row.tier}&interval=yearly`);
      expect(status).toBe(200);
      expect(data).toMatchObject({ ok: true, country: "HU", rate: 27, net: row.net });
      expect(data.vat).toBe(Math.round(row.net * 0.27));
      expect(data.gross).toBe(row.net + (data.vat ?? 0));
    }
  });

  it("ismeretlen csomag JSON 400, nem HTML", async () => {
    const { status, data } = await liveJson<{ ok?: boolean; error?: string }>(
      `${BILL}/api/billing/quote?tier=nope&interval=yearly`,
    );
    expect(status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.error).toMatch(/csomag/i);
  });

  it("hiányos checkout JSON 400/503 — nem hoz létre díjbekérőt", async () => {
    const { status, data } = await liveJson<{
      ok?: boolean;
      error?: string;
      orderId?: string;
      proformaNumber?: string;
    }>(`${BILL}/api/billing/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tier: "starter",
        interval: "yearly",
        payMethod: "hu_transfer",
        partnerKind: "b2c",
      }),
    });
    expect([400, 503]).toContain(status);
    expect(data.ok).toBe(false);
    expect(data.orderId).toBeUndefined();
    expect(data.proformaNumber).toBeUndefined();
    expect(data.error).toBeTruthy();
  });

  it("hamis licenc token 404 JSON", async () => {
    const { status, data } = await liveJson<{ ok?: boolean }>(
      `${BILL}/api/billing/license?token=SZC-NINCSILYEN`,
    );
    expect(status).toBe(404);
    expect(data.ok).toBe(false);
  });

  it("transfer webhook titok nélkül 401 JSON", async () => {
    const { status, data } = await liveJson<{ ok?: boolean; error?: string }>(
      `${BILL}/api/billing/webhook?provider=transfer`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transferCode: "SZC-NINCSILYEN" }),
      },
    );
    expect(status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toMatch(/unauthorized/i);
  });

  it("ismeretlen /api JSON 404, nem SPA", async () => {
    const { status, data } = await liveJson<{ ok?: boolean; error?: string }>(`${BILL}/api/billing/nincsilyen`);
    expect(status).toBe(404);
    expect(data.ok).toBe(false);
  });
});

describe.skipIf(!RUN)("Éles E2E — nyilvános felületek", () => {
  it("bill.szcenario.hu a pénztár SPA — új űrlap a bundle-ben", async () => {
    const res = await liveFetch(`${BILL}/`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type") ?? "").toMatch(/html/i);
    expect(html).toMatch(/Szcenárió|Billing|fizetés|Checkout/i);
    const jsPath = [...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]).find((s) => s.includes("assets/"));
    expect(jsPath).toBeTruthy();
    const js = await (await liveFetch(new URL(jsPath!, BILL).href)).text();
    expect(js).toContain("lastName");
    expect(js).toContain("Vezetéknév");
    expect(js).toContain("installment2");
    expect(js).toContain("API végpont nem elérhető");
    expect(js).not.toContain("Cégnév / név");
  });

  it("deploy SHA a főoldalon", async () => {
    const { status, data } = await liveJson<{ sha?: string; builtAt?: string }>(`${MAIN}/version.json`);
    expect(status).toBe(200);
    expect(data.sha).toMatch(/^[0-9a-f]{40}$/i);
    expect(data.builtAt).toBeTruthy();
  });

  it("szcenario.hu/support keresős tudástár", async () => {
    const res = await liveFetch(`${MAIN}/support`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toContain(hu.supportDoor.kbSearch);
    expect(html).toMatch(/Gyakran Ismételt|GYIK|munkautasítás/i);
  });

  it("support /pricing SSOT él", async () => {
    const res = await liveFetch(`${SUPPORT}/pricing`);
    const html = await res.text();
    expect(res.status).toBe(200);
    expect(html).toMatch(/Support|árazás|pricing|Szcenárió/i);
  });
});
