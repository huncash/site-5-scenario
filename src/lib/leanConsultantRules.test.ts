import { describe, expect, it } from "vitest";

import type { Transaction } from "@/lib/finance";
import {
  detectHeijunkaPeaks,
  detectIdleCashInventory,
  detectWaitingReceivables,
  estimateLeanQuickWins,
  generateFiveSChecklist,
  LEAN_ENGINE_CHARTER,
  LEAN_METHOD_TOOLKIT,
  runLeanConsultantEngine,
  suggestLeanMethods,
} from "@/lib/leanConsultantRules";

function txn(partial: Partial<Transaction> & Pick<Transaction, "type" | "amount" | "category">): Transaction {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    note: null,
    occurred_at: "2026-07-01",
    ...partial,
  } as Transaction;
}

describe("leanConsultantRules", () => {
  const now = new Date("2026-07-22T12:00:00");

  it("MUDA inventory: magas szabad egyenleg → tőke-átcsoportosítás tanács", () => {
    // ~3 hónapnyi lookback: alacsony kiadás, magas bevétel, nincs bucket-allokáció
    const txns = [
      txn({ type: "income", amount: 1_200_000, category: "bevétel", occurred_at: "2026-05-05" }),
      txn({ type: "income", amount: 1_200_000, category: "bevétel", occurred_at: "2026-06-05" }),
      txn({ type: "income", amount: 1_200_000, category: "bevétel", occurred_at: "2026-07-05" }),
      txn({ type: "expense", amount: 200_000, category: "lakhatás", occurred_at: "2026-05-10" }),
      txn({ type: "expense", amount: 200_000, category: "lakhatás", occurred_at: "2026-06-10" }),
      txn({ type: "expense", amount: 200_000, category: "lakhatás", occurred_at: "2026-07-10" }),
      txn({ type: "saving", amount: 100_000, category: "saving", occurred_at: "2026-07-15", bucket_id: null }),
    ];

    const advice = detectIdleCashInventory({ transactions: txns, now });
    expect(advice).not.toBeNull();
    expect(advice?.ruleId).toBe("muda.inventory.idle_cash");
    expect(advice?.target).toBe("buckets");
    expect(Number(advice?.metrics?.idleMonths)).toBeGreaterThanOrEqual(3);
  });

  it("MUDA waiting + Heijunka: lejárt számla és kötelezettség-csúcs", () => {
    const waitingTxns = [
      txn({
        type: "income",
        amount: 400_000,
        category: "ÉRTÉKESÍTÉS",
        invoice_status: "unpaid",
        due_date: "2026-07-01",
        occurred_at: "2026-06-15",
        workspace: "biz1",
      }),
    ];
    const waiting = detectWaitingReceivables({ transactions: waitingTxns, now });
    expect(waiting?.muda).toBe("waiting");
    expect(waiting?.severity).toBe("critical");

    // Több hónap mérsékelt kötelezettség + egy csúcshónap (ÁFA + biztosítás)
    const peakTxns = [
      txn({ type: "expense", amount: 160_000, category: "NAV", occurred_at: "2026-04-05", workspace: "biz1" }),
      txn({ type: "expense", amount: 160_000, category: "NAV", occurred_at: "2026-05-05", workspace: "biz1" }),
      txn({ type: "expense", amount: 160_000, category: "NAV", occurred_at: "2026-06-05", workspace: "biz1" }),
      txn({
        type: "expense",
        amount: 480_000,
        category: "NAV ÁFA",
        occurred_at: "2026-07-08",
        workspace: "biz1",
      }),
      txn({
        type: "expense",
        amount: 320_000,
        category: "biztosítás",
        occurred_at: "2026-07-12",
        workspace: "biz1",
      }),
    ];
    const peaks = detectHeijunkaPeaks({
      transactions: peakTxns,
      workspaceId: "biz1",
      now,
    });
    expect(peaks.length).toBeGreaterThan(0);
    expect(peaks.some((p) => p.monthKey === "2026-07" && p.ratio >= 1.75)).toBe(true);

    const engine = runLeanConsultantEngine({
      transactions: [...waitingTxns, ...peakTxns],
      workspaceId: "biz1",
      now,
      pdcaMode: "CA",
    });
    expect(engine.advice.some((a) => a.ruleId === "muda.waiting.receivables")).toBe(true);
    expect(engine.advice.some((a) => a.ruleId === "heijunka.payment_peak")).toBe(true);
  });

  it("5S checklist: PDCA mód szerint logikus következő lépések", () => {
    const planItems = generateFiveSChecklist("PD");
    expect(planItems.length).toBeGreaterThan(0);
    expect(planItems.every((i) => i.phase === "plan" || i.phase === "do")).toBe(true);
    expect(planItems.some((i) => i.pillar === "seiri")).toBe(true);

    const actItems = generateFiveSChecklist("AP");
    expect(actItems.some((i) => i.id === "5s-shitsuke-cycle")).toBe(true);
    expect(actItems.some((i) => i.phase === "act")).toBe(true);
  });

  it("embedded Lean toolkit + Quick Wins ROI (low-hanging fruit)", () => {
    expect(LEAN_ENGINE_CHARTER.toLowerCase()).toContain("lean");
    expect(Object.keys(LEAN_METHOD_TOOLKIT)).toEqual(
      expect.arrayContaining(["5s", "vsm", "kaizen", "smed", "poka_yoke", "jit"]),
    );

    const waitingTxns = [
      txn({
        type: "income",
        amount: 400_000,
        category: "ÉRTÉKESÍTÉS",
        invoice_status: "unpaid",
        due_date: "2026-07-01",
        occurred_at: "2026-06-15",
      }),
    ];
    const engine = runLeanConsultantEngine({ transactions: waitingTxns, now, pdcaMode: "CA" });
    expect(engine.quickWins).not.toBeNull();
    expect(engine.quickWins!.roiMultiple12m).toBeGreaterThan(1);
    expect(engine.quickWins!.paybackMonths).toBeLessThan(12);
    expect(engine.quickWins!.annualSavingsHuf).toBeGreaterThan(engine.quickWins!.capexHuf);
    expect(engine.suggestedMethods.length).toBeGreaterThan(0);
    expect(suggestLeanMethods(engine.advice)).toContain("kaizen");

    const qw = estimateLeanQuickWins(engine.advice);
    expect(qw?.messagingHu).toMatch(/CapEx|cash-flow/i);
  });
});
