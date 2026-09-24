import { describe, expect, it } from "vitest";
import {
  debtPendingTotal,
  generateEqualDebtSchedule,
  loanFromDebtFields,
} from "@/lib/finance";

describe("debt schedule (Tartozás ütemező)", () => {
  it("generates equal installments with last-row rounding", () => {
    const rows = generateEqualDebtSchedule(600_000, "2026-08-15", 6);
    expect(rows).toHaveLength(6);
    expect(rows.every((r) => r.status === "pending")).toBe(true);
    expect(rows[0]?.amount).toBe(100_000);
    expect(rows[5]?.amount).toBe(100_000);
    expect(rows.reduce((a, r) => a + r.amount, 0)).toBe(600_000);
    expect(rows[0]?.due_date).toBe("2026-08-15");
    expect(rows[1]?.due_date).toBe("2026-09-15");
  });

  it("puts remainder on the last row when not divisible", () => {
    const rows = generateEqualDebtSchedule(100_001, "2026-01-31", 3);
    expect(rows.reduce((a, r) => a + r.amount, 0)).toBe(100_001);
    expect(rows[0]?.amount + rows[1]?.amount + rows[2]?.amount).toBe(100_001);
    // Jan 31 + 1 month → Feb last day
    expect(rows[1]?.due_date).toBe("2026-02-28");
  });

  it("maps debt fields to Loan with workspace isolation + schedule", () => {
    const schedule = generateEqualDebtSchedule(600_000, "2026-08-01", 6);
    schedule[5] = { ...schedule[5]!, amount: 99_999 }; // manual NAV-style tweak
    schedule[0] = { ...schedule[0]!, amount: 100_001 };
    const loan = loanFromDebtFields({
      workspace_id: "Vállalkozás1",
      name: "NAV ÁFA Részletfizetés 2026",
      partner_name: "NAV",
      type: "nav_installment",
      total_amount: 600_000,
      frequency: "custom",
      schedule,
    });
    expect(loan.workspace_id).toBe("Vállalkozás1");
    expect(loan.partner_name).toBe("NAV");
    expect(loan.schedule?.length).toBe(6);
    expect(debtPendingTotal(loan.schedule)).toBe(600_000);
    expect(loan.remaining_principal).toBe(600_000);
  });
});
