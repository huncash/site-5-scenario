import { describe, expect, it } from "vitest";
import { BillingRoutingError, parseBillingJson } from "./parseBillingJson";

describe("parseBillingJson", () => {
  it("parses JSON", () => {
    expect(parseBillingJson<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true });
  });

  it("rejects HTML (SPA fallback)", () => {
    expect(() => parseBillingJson("<!doctype html><title>Szcenárió - fizetés</title>", "text/html")).toThrow(
      BillingRoutingError,
    );
    expect(() => parseBillingJson("<html><body>Not found</body></html>")).toThrow(BillingRoutingError);
  });

  it("rejects plain 404 text", () => {
    expect(() => parseBillingJson("Not found")).toThrow(BillingRoutingError);
  });
});
