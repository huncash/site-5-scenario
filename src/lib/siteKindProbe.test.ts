import { describe, expect, it } from "vitest";

import { resolveSiteHost } from "@/lib/siteSurface";
import {
  BILL_KIND_SUCCESS,
  SUPPORT_KIND_SUCCESS,
  listSearchPairs,
  siteKindSuccessLabel,
} from "@/lib/siteKindProbe";

describe("siteKindProbe", () => {
  it("labels bill and support without ports", () => {
    expect(resolveSiteHost("bill.szcenario.hu", "", "/")).toBe("bill");
    expect(resolveSiteHost("localhost", "", "/bill")).toBe("bill");
    expect(siteKindSuccessLabel("bill")).toBe(BILL_KIND_SUCCESS);
    expect(BILL_KIND_SUCCESS).not.toMatch(/:\d+/);

    expect(resolveSiteHost("support.szcenario.hu", "", "/")).toBe("support");
    expect(resolveSiteHost("localhost", "", "/support")).toBe("support");
    expect(siteKindSuccessLabel("support")).toBe(SUPPORT_KIND_SUCCESS);
    expect(SUPPORT_KIND_SUCCESS).not.toMatch(/:\d+/);
  });

  it("bill copy is checkout, not support", () => {
    expect(BILL_KIND_SUCCESS).toContain("bill.szcenario.hu");
    expect(BILL_KIND_SUCCESS).toContain("Billing & Checkout Origin");
    expect(BILL_KIND_SUCCESS).not.toContain("Knowledge Hub");
    expect(SUPPORT_KIND_SUCCESS).toContain("support.szcenario.hu");
    expect(SUPPORT_KIND_SUCCESS).toContain("Knowledge Hub");
  });

  it("lists funnel query pairs for the bill probe", () => {
    const pairs = listSearchPairs("?tier=pro&interval=yearly&lang=hu");
    expect(pairs).toEqual([
      { key: "tier", value: "pro" },
      { key: "interval", value: "yearly" },
      { key: "lang", value: "hu" },
    ]);
    expect(listSearchPairs("")).toEqual([]);
  });
});
