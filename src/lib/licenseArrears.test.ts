import { describe, expect, it } from "vitest";

import { buildInstallments } from "../../bill/server/installment.ts";
import { installment2ArrearsActive, installmentAllowed, splitEqualParts } from "@/lib/installmentPlan";
import { evaluateLicenseGate } from "@/lib/planPermissions";
import { licenseInstallmentArrears, type LicenseEntitlement } from "@/lib/license";

function lic(over: Partial<LicenseEntitlement> = {}): LicenseEntitlement {
  return {
    token: "t",
    tier: "pro",
    interval: "yearly",
    status: "paid",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    year1StartedAt: "2026-01-01T00:00:00.000Z",
    installmentPlan: true,
    installment2Paid: false,
    ...over,
  };
}

describe("year-1 two installments", () => {
  it("splits the year-1 net into two equal parts and allows only perpetual yearly", () => {
    expect(splitEqualParts(399_000)).toEqual([199_500, 199_500]);
    expect(splitEqualParts(199_001)).toEqual([99_500, 99_501]);
    expect(installmentAllowed("pro", "yearly")).toBe(true);
    expect(installmentAllowed("starter", "yearly")).toBe(true);
    expect(installmentAllowed("campus", "yearly")).toBe(false);
    expect(installmentAllowed("pro", "monthly")).toBe(false);
    const inst = buildInstallments({
      dueNet: 399_000,
      vatRate: 27,
      dueGross: 506_730,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      transferCodes: ["SZC-A", "SZC-B"],
    });
    expect(inst).toHaveLength(2);
    expect(inst[0]?.amountHuf + (inst[1]?.amountHuf ?? 0)).toBe(506_730);
    expect(inst[1]?.dueAt).toBe("2026-03-02T00:00:00.000Z");
    expect(inst[1]?.transferCode).toBe("SZC-B");
  });

  it("shows arrears from day 60 until the 2nd installment is paid — never locks runtime", () => {
    const d59 = new Date("2026-03-01T00:00:00.000Z");
    const d60 = new Date("2026-03-02T00:00:00.000Z");
    const d90 = new Date("2026-04-01T00:00:00.000Z");
    expect(installment2ArrearsActive(lic(), d59)).toBe(false);
    expect(installment2ArrearsActive(lic(), d60)).toBe(true);
    expect(installment2ArrearsActive(lic(), d90)).toBe(true);
    expect(installment2ArrearsActive(lic({ installment2Paid: true }), d90)).toBe(false);
    expect(installment2ArrearsActive(lic({ installmentPlan: false }), d90)).toBe(false);
    expect(licenseInstallmentArrears(lic({ status: "local" }), d90)).toBe(false);
    const unpaid = lic();
    expect(licenseInstallmentArrears(unpaid, d60)).toBe(true);
    const gate = evaluateLicenseGate(unpaid);
    expect(gate.runtimeOk).toBe(true);
  });
});
