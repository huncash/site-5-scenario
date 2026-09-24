import { describe, expect, it } from "vitest";
import { computeVatSplit, type Transaction } from "@/lib/finance";
import {
  computeBusinessNetResultNet,
  computeFreeBudget,
  computeQuarterLockedVat,
  isMemberLoanInternalTransfer,
  netHufAny,
} from "@/lib/financeCore";
import { getWorkspaceTransactionsGuard } from "@/lib/workspaceGuard";

describe("finance core", () => {
  it("computes net→gross VAT correctly for custom rates", () => {
    const r27 = computeVatSplit(100_000, 27, "net");
    expect(r27.net).toBe(100_000);
    expect(r27.vat).toBe(27_000);
    expect(r27.gross).toBe(127_000);

    const r5 = computeVatSplit(10_000, 5, "net");
    expect(r5.net).toBe(10_000);
    expect(r5.vat).toBe(500);
    expect(r5.gross).toBe(10_500);
  });

  it("excludes member-loan internal transfers from business net result", () => {
    const base = (t: Partial<Transaction>): Transaction =>
      ({
        id: crypto.randomUUID(),
        profile_id: "p1",
        workspace: "Vállalkozás1",
        type: "expense",
        occurred_at: "2026-06-10",
        amount: 0,
        category: "X",
        note: null,
        ...t,
      }) as any;

    const txns: Transaction[] = [
      base({ type: "income", amount: 100_000 }),
      base({ type: "expense", amount: 40_000 }),
      base({ type: "income", amount: 999_999, internal_transfer_kind: "member_loan_out" as any }),
      base({ type: "expense", amount: 888_888, internal_transfer_kind: "member_loan_repay" as any }),
      base({ type: "saving", amount: 777_777 }),
    ];

    expect(computeBusinessNetResultNet(txns)).toBe(60_000);
  });

  it("excludes internal transfers from quarter VAT locked calc", () => {
    const base = (t: Partial<Transaction>): Transaction =>
      ({
        id: crypto.randomUUID(),
        profile_id: "p1",
        workspace: "Vállalkozás1",
        type: "income",
        occurred_at: "2026-06-10",
        amount: 100_000,
        vat_treatment: "hu_gross",
        vat_rate: 27,
        category: "X",
        note: null,
        ...t,
      }) as any;

    const now = new Date("2026-06-20T00:00:00.000Z");
    const txns: Transaction[] = [
      base({ type: "income", amount: 100_000 }), // outVat +27k
      base({ type: "expense", amount: 10_000 }), // inVat +2.7k
      base({ internal_transfer_kind: "member_loan_out" as any, amount: 1_000_000 }), // should be ignored
    ];
    const q = computeQuarterLockedVat(txns, now);
    expect(q.outVat).toBe(27_000);
    expect(q.inVat).toBe(2_700);
    expect(q.lockedVat).toBe(24_300);
  });

  it("computes free budget as bank gross - locked VAT - piggies", () => {
    expect(computeFreeBudget(1_000_000, 120_000, 30_000)).toBe(850_000);
  });

  it("workspace guard isolates data strictly (except overlay internal transfer)", () => {
    const mk = (t: Partial<Transaction>): Transaction =>
      ({
        id: crypto.randomUUID(),
        profile_id: "p1",
        workspace: "personal",
        type: "expense",
        occurred_at: "2026-06-01",
        amount: 1,
        category: "X",
        note: null,
        ...t,
      }) as any;

    const personal = mk({ workspace: "personal", amount: 10 });
    const biz = mk({ workspace: "Vállalkozás1", amount: 20 });
    const overlay = mk({
      workspace: "Vállalkozás1",
      amount: 30,
      internal_transfer_kind: "member_loan_out" as any,
      internal_transfer_from: "personal",
      internal_transfer_to: "Vállalkozás1",
    });

    const all = [personal, biz, overlay];
    const personalView = getWorkspaceTransactionsGuard(all, "personal");
    const bizView = getWorkspaceTransactionsGuard(all, "Vállalkozás1");

    expect(personalView.some((t) => t.id === personal.id)).toBe(true);
    expect(personalView.some((t) => t.id === biz.id)).toBe(false);
    expect(personalView.some((t) => t.id === overlay.id)).toBe(true); // overlay exception

    expect(bizView.some((t) => t.id === biz.id)).toBe(true);
    expect(bizView.some((t) => t.id === personal.id)).toBe(false);
    expect(bizView.some((t) => t.id === overlay.id)).toBe(true); // overlay exception
  });

  it("internal transfer classifier works", () => {
    const t = { internal_transfer_kind: "member_loan_out" } as any as Transaction;
    expect(isMemberLoanInternalTransfer(t)).toBe(true);
    expect(netHufAny({ amount: 10, eur_amount: 2, eur_rate: 400 } as any as Transaction)).toBe(810);
  });
});

