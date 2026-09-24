import { describe, expect, it } from "vitest";

import type { Transaction, WorkspaceMeta } from "@/lib/finance";
import { computeLeanRecommendations } from "@/hooks/useLeanRecommendations";

function txn(partial: Partial<Transaction> & Pick<Transaction, "type" | "amount" | "category">): Transaction {
  return {
    id: crypto.randomUUID(),
    user_id: "u1",
    note: null,
    occurred_at: "2026-07-01",
    ...partial,
  } as Transaction;
}

describe("computeLeanRecommendations (LEAN_SPEC)", () => {
  const now = new Date("2026-07-22T12:00:00");

  it("CRITICAL: overdue unpaid/pending income invoices", () => {
    const txns = [
      txn({
        type: "income",
        amount: 150_000,
        category: "ÉRTÉKESÍTÉS",
        invoice_status: "unpaid",
        due_date: "2026-07-01",
      }),
      txn({
        type: "income",
        amount: 50_000,
        category: "ÉRTÉKESÍTÉS",
        invoice_status: "paid",
        due_date: "2026-06-01",
      }),
    ];
    const recs = computeLeanRecommendations({ transactions: txns, workspaces: [], now });
    expect(recs.some((r) => r.id === "overdue-invoices" && r.type === "CRITICAL")).toBe(true);
  });

  it("WARNING: project budget overrun > 110%", () => {
    const workspaces: WorkspaceMeta[] = [
      {
        id: "projekt1",
        type: "project",
        project_budget_huf: 1_000_000,
        project_mode: "simulation",
      },
    ];
    const txns = [
      txn({ type: "expense", amount: 1_200_000, category: "anyag", project_id: "projekt1", workspace: "projekt1" }),
    ];
    const recs = computeLeanRecommendations({
      transactions: txns,
      workspaces,
      workspaceName: () => "Projekt1",
      now,
    });
    const hit = recs.find((r) => r.id === "budget-overrun-projekt1");
    expect(hit?.type).toBe("WARNING");
    expect(hit?.title).toContain("20%");
  });

  it("OPTIMIZATION: transport ratio > 8%", () => {
    const workspaces: WorkspaceMeta[] = [{ id: "projekt1", type: "project", project_mode: "prep" }];
    const txns = [
      txn({ type: "expense", amount: 90_000, category: "anyag", project_id: "projekt1" }),
      txn({ type: "expense", amount: 20_000, category: "transport", project_id: "projekt1", note: "GLS fuvar" }),
    ];
    const recs = computeLeanRecommendations({ transactions: txns, workspaces, now });
    expect(recs.some((r) => r.id === "transport-ratio-projekt1" && r.type === "OPTIMIZATION")).toBe(true);
  });

  it("OPTIMIZATION: unassigned subscription / recurring", () => {
    const txns = [
      txn({ type: "expense", amount: 12_000, category: "subscription", project_id: null }),
      txn({ type: "expense", amount: 5_000, category: "recurring_software", project_id: null }),
    ];
    const recs = computeLeanRecommendations({ transactions: txns, workspaces: [], now });
    expect(recs.some((r) => r.id === "unassigned-subscription" && r.type === "OPTIMIZATION")).toBe(true);
  });
});
