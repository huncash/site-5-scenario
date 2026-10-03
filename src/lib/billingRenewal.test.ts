import { describe, expect, it } from "vitest";

import { formatRenewalDate, nextRenewalDate } from "@/lib/billingRenewal";

describe("billingRenewal", () => {
  it("adds one year for yearly interval", () => {
    const from = new Date(2026, 9, 3); // Oct 3
    const next = nextRenewalDate("yearly", from);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(9);
    expect(next.getDate()).toBe(3);
  });

  it("adds one month for monthly interval", () => {
    const from = new Date(2026, 9, 3);
    const next = nextRenewalDate("monthly", from);
    expect(next.getFullYear()).toBe(2026);
    expect(next.getMonth()).toBe(10);
    expect(next.getDate()).toBe(3);
  });

  it("formats HU renewal date", () => {
    const d = new Date(2027, 9, 3);
    expect(formatRenewalDate(d, "hu")).toMatch(/2027/);
    expect(formatRenewalDate(d, "hu").toLowerCase()).toContain("október");
  });
});
