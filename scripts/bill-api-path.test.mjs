import { describe, expect, it } from "vitest";
import { isBillApiPath, shouldProxyBillApi } from "./bill-api-path.mjs";

describe("bill API proxy path", () => {
  it("matches /api and /api/*", () => {
    expect(isBillApiPath("/api")).toBe(true);
    expect(isBillApiPath("/api/billing/config")).toBe(true);
    expect(isBillApiPath("/api/billing/checkout")).toBe(true);
    expect(isBillApiPath("/bill")).toBe(false);
    expect(isBillApiPath("/")).toBe(false);
  });

  it("always proxies /api/billing, even on the main host", () => {
    expect(shouldProxyBillApi("/api/billing/config", "main")).toBe(true);
    expect(shouldProxyBillApi("/api/billing/checkout?x=1", "support")).toBe(true);
    expect(shouldProxyBillApi("/api/other", "main")).toBe(false);
    expect(shouldProxyBillApi("/api/other", "bill")).toBe(true);
    expect(shouldProxyBillApi("/checkout", "bill")).toBe(false);
  });
});
