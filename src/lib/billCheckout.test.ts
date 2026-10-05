import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { buyerFromCheckout, checkoutGap, checkoutReady } from "../../bill/server/checkoutReady.ts";
import { isLiveBilling, liveBillingError, liveBillingMissingKeys } from "../../bill/server/env.ts";

import { PLANS_CONFIG } from "@/config/plans";
import {
  chargeHuf,
  invoicePackageName,
  JIT_ADDON_HUF,
  PACKAGE_NET_HUF,
  tierLabel,
} from "../../bill/server/catalog.ts";
import { packageLines, quotePackage } from "../../bill/server/quote.ts";
import { buildSzamlazzXml, linesFromOrder, parseAgentReply } from "../../bill/server/szamlazz.ts";
import type { Order } from "../../bill/server/store.ts";

describe("bill catalog from plans.ts", () => {
  it("uses Basic / Pro / Enterprise year-1 prices, not leftover monthly SaaS names", () => {
    expect(tierLabel("starter")).toBe(PLANS_CONFIG.starter.label);
    expect(tierLabel("pro")).toBe("Pro Szcenárió");
    expect(tierLabel("expert")).toBe("Enterprise & Csapatok");
    expect(PACKAGE_NET_HUF.starter).toBe(199_000);
    expect(PACKAGE_NET_HUF.pro).toBe(399_000);
    expect(PACKAGE_NET_HUF.expert).toBe(799_000);
    expect(chargeHuf("pro", "yearly")).toBe(399_000);
    expect(chargeHuf("pro", "monthly")).toBe(399_000);
    expect(invoicePackageName("pro", "yearly")).toContain("Pro Szcenárió");
    expect(invoicePackageName("pro", "yearly")).toContain("örökös licenc");
    expect(JIT_ADDON_HUF.case_plus_1).toBe(49_000);
  });

  it("quotes the real package plus optional JIT addon", () => {
    const q = quotePackage("pro", "yearly", { country: "HU", addon: "case_plus_1" });
    expect(q.dueNet).toBe(399_000 + 49_000);
    expect(q.lines[0]?.name).toContain("Pro Szcenárió");
    expect(q.lines.some((l) => l.name.includes("Aktív Case"))).toBe(true);
    expect(packageLines("starter", "yearly").at(0)?.netUnitPrice).toBe(199_000);
  });
});

describe("szamlazz dijbekero xml", () => {
  it("puts the real plan name and price on the invoice line", () => {
    const order = {
      id: "ord-test",
      createdAt: "2026-10-05T00:00:00.000Z",
      status: "awaiting_transfer",
      tier: "pro",
      interval: "yearly",
      amountHuf: 506_730,
      netHuf: 399_000,
      vatRate: 27,
      vatCode: "27",
      payMethod: "hu_transfer",
      transferCode: "SZC-TEST1",
      buyer: {
        name: "Teszt Kft.",
        address: "1051 Budapest, Példa utca 1.",
        taxId: "12345678-2-41",
        email: "teszt@example.com",
        partnerKind: "b2b",
      },
      lines: packageLines("pro", "yearly").map((line) => ({
        ...line,
        vat: 27,
      })),
    } satisfies Order;

    const built = linesFromOrder(order);
    expect(built[0]?.name).toBe("Szcenárió — Pro Szcenárió (örökös licenc, 1. év)");
    expect(built[0]?.netUnitPrice).toBe(399_000);

    const xml = buildSzamlazzXml(order, "dijbekero");
    expect(xml).toContain("<dijbekero>true</dijbekero>");
    expect(xml).toContain("<szamlaLetoltes>true</szamlaLetoltes>");
    expect(xml).toContain("Pro Szcenárió");
    expect(xml).toContain("<nettoEgysegar>399000</nettoEgysegar>");
    expect(xml).not.toContain("Basic");
  });

  it("reads díjbekérő szám, PDF and vevői fiók URL from the Agent XML reply", () => {
    const xml = `<?xml version="1.0"?>
<xmlszamlavalasz xmlns="http://www.szamlazz.hu/xmlszamlavalasz">
  <sikeres>true</sikeres>
  <szamlaszam>D-2026-42</szamlaszam>
  <vevoifiokurl>https://www.szamlazz.hu/szamla/?page=vevoifiokpay&amp;partguid=abc</vevoifiokurl>
  <pdf>JVBERi0xLjQK</pdf>
</xmlszamlavalasz>`;
    const parsed = parseAgentReply(xml);
    expect(parsed.number).toBe("D-2026-42");
    expect(parsed.pdfBase64).toBe("JVBERi0xLjQK");
    expect(parsed.buyerAccountUrl).toContain("vevoifiokpay");
    expect(parsed.error).toBeUndefined();
  });

  it("surfaces Agent errors instead of a mock DB-TEST number", () => {
    const xml = `<xmlszamlavalasz><sikeres>false</sikeres><hibakod>3</hibakod><hibauzenet>Agent kulcs hibás</hibauzenet></xmlszamlavalasz>`;
    const parsed = parseAgentReply(xml);
    expect(parsed.error).toBe("Agent kulcs hibás");
    expect(parsed.number).toBeUndefined();
  });
});

const completeCheckout = {
  name: "Teszt Kft.",
  address: "1051 Budapest, Példa utca 1.",
  email: "teszt@example.com",
  taxId: "12345678-2-41",
  country: "HU",
  partnerKind: "b2b" as const,
  immediateConsent: false,
  aszfAccepted: true,
  payMethod: "hu_transfer",
};

describe("poka-yoke checkout fields", () => {
  it("is ready only when every required billing field is filled", () => {
    expect(checkoutReady(completeCheckout)).toBe(true);
    expect(checkoutGap({ ...completeCheckout, name: "" })).toBe("name");
    expect(checkoutGap({ ...completeCheckout, email: "rossz" })).toBe("email");
    expect(checkoutGap({ ...completeCheckout, address: "  " })).toBe("address");
    expect(checkoutGap({ ...completeCheckout, taxId: "12", partnerKind: "b2b" })).toBe("taxId");
    expect(
      checkoutGap({
        ...completeCheckout,
        partnerKind: "b2c",
        taxId: "",
        immediateConsent: false,
      }),
    ).toBe("consent");
    expect(checkoutGap({ ...completeCheckout, aszfAccepted: false })).toBe("aszf");
    expect(checkoutGap({ ...completeCheckout, payMethod: "stripe" })).toBe("pay");
    expect(checkoutReady({ ...completeCheckout, payMethod: "barion" })).toBe(true);
  });

  it("server buyer parser matches the same gates", () => {
    const ok = buyerFromCheckout({ ...completeCheckout, partnerKind: "b2b" });
    expect(ok).toMatchObject({ name: "Teszt Kft.", email: "teszt@example.com" });
    expect(buyerFromCheckout({ ...completeCheckout, name: "" })).toBe("Név, cím és e-mail kell.");
    expect(buyerFromCheckout({ ...completeCheckout, aszfAccepted: false })).toBe(
      "Az ÁSZF és az adatvédelmi tájékoztató elfogadása kötelező.",
    );
  });
});

describe("live billing keys", () => {
  const names = [
    "NODE_ENV",
    "BARION_ENV",
    "SZAMLAZZ_AGENT_KEY",
    "SZAMLAKEZELO_AGENT_KEY",
    "SZAMLAZZ_SANDBOX",
    "BARION_POS_KEY",
    "BARION_POSKEY",
  ] as const;
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const name of names) {
      prev[name] = process.env[name];
      delete process.env[name];
    }
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    for (const name of names) {
      if (prev[name] === undefined) delete process.env[name];
      else process.env[name] = prev[name];
    }
  });

  it("does not require live keys outside production", () => {
    expect(isLiveBilling()).toBe(false);
    expect(liveBillingMissingKeys()).toEqual([]);
    expect(liveBillingError()).toBeNull();
  });

  it("errors loudly in production when SZAMLAZZ_AGENT_KEY or BARION_POS_KEY is missing", () => {
    process.env.NODE_ENV = "production";
    expect(isLiveBilling()).toBe(true);
    expect(liveBillingMissingKeys()).toEqual(["SZAMLAZZ_AGENT_KEY", "BARION_POS_KEY"]);
    expect(liveBillingError()).toContain("SZAMLAZZ_AGENT_KEY");
    expect(liveBillingError()).toContain("BARION_POS_KEY");
  });

  it("flags SZAMLAZZ_SANDBOX=true in production", () => {
    process.env.NODE_ENV = "production";
    process.env.SZAMLAZZ_SANDBOX = "true";
    expect(liveBillingMissingKeys()).toContain("SZAMLAZZ_SANDBOX=false");
  });

  it("accepts BARION_POS_KEY and live Számlázz flags", () => {
    process.env.BARION_ENV = "prod";
    process.env.SZAMLAZZ_AGENT_KEY = "agent-key";
    process.env.SZAMLAZZ_SANDBOX = "false";
    process.env.BARION_POS_KEY = "pos-key";
    expect(liveBillingMissingKeys()).toEqual([]);
    expect(liveBillingError()).toBeNull();
  });
});
