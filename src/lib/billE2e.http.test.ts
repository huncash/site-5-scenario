import { spawn, type ChildProcess } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PORT = 5119;
const SECRET = "e2e-transfer-secret";
const BASE = `http://127.0.0.1:${PORT}`;

async function waitHealth(timeoutMs = 25000) {
  const t0 = Date.now();
  let last = "";
  while (Date.now() - t0 < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/api/billing/config`);
      last = await res.text();
      if (last.startsWith("{")) return JSON.parse(last) as { sandbox?: boolean };
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`bill e2e nem indult: ${last.slice(0, 180)}`);
}

describe("E2E HTTP — checkout → díjbekérő mock → webhook → licenc", () => {
  let child: ChildProcess | undefined;
  let dataDir = "";

  beforeAll(async () => {
    dataDir = mkdtempSync(path.join(os.tmpdir(), "bill-e2e-"));
    const env = {
      ...process.env,
      BILL_PORT: String(PORT),
      BILL_PUBLIC_URL: BASE,
      BILL_DATA_DIR: dataDir,
      BILL_TRANSFER_SECRET: SECRET,
      SZAMLAZZ_SANDBOX: "true",
      SZAMLAZZ_AGENT_KEY: "",
      SZAMLAKEZELO_AGENT_KEY: "",
      BARION_POS_KEY: "",
      BARION_ENV: "test",
      NODE_ENV: "test",
    };
    child = spawn(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["tsx", "--tsconfig", "bill/tsconfig.json", "bill/server/index.ts"],
      { env, cwd: process.cwd(), stdio: "pipe", shell: process.platform === "win32" },
    );
    await waitHealth();
  }, 35000);

  afterAll(() => {
    child?.kill();
    if (dataDir) rmSync(dataDir, { recursive: true, force: true });
  });

  it("átutalásos Basic: mock díjbekérő, tokennel licenc, titkos webhook élesít", async () => {
    const checkout = await fetch(`${BASE}/api/billing/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lastName: "Teszt",
        firstName: "E2e",
        name: "Teszt E2e",
        zip: "1051",
        city: "Budapest",
        address: "Példa utca 1",
        country: "HU",
        email: "e2e-bill@example.invalid",
        tier: "starter",
        interval: "yearly",
        payMethod: "hu_transfer",
        payPlan: "full",
        partnerKind: "b2c",
        immediateConsent: true,
        aszfAccepted: true,
      }),
    });
    const created = (await checkout.json()) as {
      ok?: boolean;
      error?: string;
      orderId?: string;
      sandbox?: boolean;
      proformaNumber?: string;
      transfer?: { code?: string };
    };
    expect(checkout.status).toBe(200);
    expect(created.ok).toBe(true);
    expect(created.sandbox).toBe(true);
    expect(created.proformaNumber).toMatch(/^DB-TEST-/);
    const token = created.transfer?.code;
    expect(token).toBeTruthy();

    const beforePay = await fetch(`${BASE}/api/billing/license?token=${encodeURIComponent(token!)}`);
    const awaiting = (await beforePay.json()) as { ok?: boolean; status?: string; tier?: string };
    expect(beforePay.status).toBe(200);
    expect(awaiting).toMatchObject({ ok: true, status: "awaiting_transfer", tier: "starter" });

    const denied = await fetch(`${BASE}/api/billing/webhook?provider=transfer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ transferCode: token }),
    });
    expect(denied.status).toBe(401);

    const paidHook = await fetch(`${BASE}/api/billing/webhook?provider=transfer`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-bill-transfer-secret": SECRET },
      body: JSON.stringify({ transferCode: token }),
    });
    const hookBody = (await paidHook.json()) as { ok?: boolean; orderId?: string };
    expect(paidHook.status).toBe(200);
    expect(hookBody.ok).toBe(true);
    expect(hookBody.orderId).toBe(created.orderId);

    const afterPay = await fetch(`${BASE}/api/billing/license?token=${encodeURIComponent(token!)}`);
    const paid = (await afterPay.json()) as { ok?: boolean; status?: string; tier?: string };
    expect(afterPay.status).toBe(200);
    expect(paid.ok).toBe(true);
    expect(paid.tier).toBe("starter");
    expect(["paid", "invoiced"]).toContain(paid.status);

    const fake = await fetch(`${BASE}/api/billing/license?token=SZC-NINCSILYEN`);
    expect(fake.status).toBe(404);
  });
});
