import { describe, expect, it } from "vitest";

import {
  BILL_CHECKOUT_ORIGIN,
  billCheckoutPath,
  billCheckoutUrl,
  billPublicOrigin,
  isBillHost,
  isBillPath,
  readBillCheckoutSearch,
} from "@/lib/billing";

describe("billing origins", () => {
  it("classifies bill host and /bill path without ports", () => {
    expect(isBillHost("bill.szcenario.hu")).toBe(true);
    expect(isBillHost("szcenario.hu")).toBe(false);
    expect(isBillPath("/bill")).toBe(true);
    expect(isBillPath("/bill/checkout")).toBe(true);
    expect(isBillPath("/")).toBe(false);
  });

  it("sends main-domain checkout to bill.szcenario.hu", () => {
    expect(billPublicOrigin("szcenario.hu", "/")).toBe(BILL_CHECKOUT_ORIGIN);
    expect(billCheckoutPath("szcenario.hu", "/")).toBe("/");
    const href = billCheckoutUrl({
      tier: "pro",
      interval: "yearly",
      hostname: "szcenario.hu",
      pathname: "/",
    });
    expect(href.startsWith(`${BILL_CHECKOUT_ORIGIN}/?`)).toBe(true);
    expect(href).toContain("tier=pro");
    expect(href).toContain("interval=yearly");
    expect(href).not.toMatch(/localhost:\d+/);
    expect(new URL(href).port).toBe("");
  });

  it("keeps same-origin /bill path for path-based entry", () => {
    expect(billCheckoutPath("localhost", "/bill")).toBe("/bill");
    const href = billCheckoutUrl({
      tier: "starter",
      interval: "monthly",
      hostname: "localhost",
      pathname: "/bill",
    });
    expect(href).toContain("/bill?");
    expect(href).toContain("tier=starter");
    expect(href).not.toMatch(/localhost:51\d{2}/);
  });

  it("reads funnel query into the billing form", () => {
    const q = readBillCheckoutSearch(
      "?tier=pro&interval=yearly&lang=hu&addon=slot_plus_1&ref=kampany&partnerKind=b2b",
    );
    expect(q.hasCheckoutIntent).toBe(true);
    expect(q.tier).toBe("pro");
    expect(q.interval).toBe("yearly");
    expect(q.lang).toBe("hu");
    expect(q.addon).toBe("slot_plus_1");
    expect(q.ref).toBe("kampany");
    expect(q.partnerKind).toBe("b2b");
    expect(readBillCheckoutSearch("").hasCheckoutIntent).toBe(false);
    expect(readBillCheckoutSearch("tier=starter&interval=monthly").interval).toBe("monthly");
    expect(readBillCheckoutSearch("tier=pro").interval).toBe("yearly");
    expect(
      billCheckoutUrl({
        tier: "expert",
        interval: "yearly",
        partnerKind: "b2c",
        hostname: "szcenario.hu",
        pathname: "/",
      }),
    ).toContain("partnerKind=b2c");
  });
});
