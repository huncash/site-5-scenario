import { describe, expect, it } from "vitest";

import { bankAccountsPerSlot, checkBankAccountsForSlot } from "@/lib/bankCapacity";

describe("bankCapacity", () => {
  it("Basic / Campus: 1 bankszámla / Slot", () => {
    expect(bankAccountsPerSlot("starter")).toBe(1);
    expect(bankAccountsPerSlot("campus")).toBe(1);
    expect(bankAccountsPerSlot("demo")).toBe(1);
    expect(checkBankAccountsForSlot(0, "starter").ok).toBe(true);
    expect(checkBankAccountsForSlot(1, "starter")).toMatchObject({
      ok: false,
      reason: "limit_reached",
      limit: 1,
    });
  });

  it("Pro / Enterprise / local: korlátlan", () => {
    expect(bankAccountsPerSlot("pro")).toBe("unlimited");
    expect(bankAccountsPerSlot("expert")).toBe("unlimited");
    expect(bankAccountsPerSlot("local")).toBe("unlimited");
    expect(checkBankAccountsForSlot(9, "pro").ok).toBe(true);
  });
});
