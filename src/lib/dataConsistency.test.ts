import { describe, expect, it } from "vitest";
import { analyzeDataConsistency } from "./dataConsistency";
import type { Transaction, WorkspaceMeta } from "./finance";

describe("analyzeDataConsistency", () => {
  it("green when clean", () => {
    const workspaces: WorkspaceMeta[] = [{ id: "biz", type: "business" }];
    const transactions: Transaction[] = [
      {
        id: "t1",
        type: "expense",
        occurred_at: "2026-01-01",
        amount: 1000,
        workspace: "personal",
      } as Transaction,
    ];
    const r = analyzeDataConsistency({ transactions, loans: [], workspaces });
    expect(r.level).toBe("green");
  });

  it("red on orphan workspace", () => {
    const r = analyzeDataConsistency({
      transactions: [
        {
          id: "t1",
          type: "expense",
          occurred_at: "2026-01-01",
          amount: 1000,
          workspace: "ghost",
        } as Transaction,
      ],
      loans: [],
      workspaces: [],
    });
    expect(r.level).toBe("red");
    expect(r.issues.some((i) => i.kind === "orphan_txn")).toBe(true);
  });

  it("yellow on bank_raw dup across workspaces", () => {
    const r = analyzeDataConsistency({
      transactions: [
        {
          id: "a",
          type: "expense",
          occurred_at: "2026-01-01",
          amount: 1000,
          workspace: "personal",
          bank_raw_id: "raw1",
        } as Transaction,
        {
          id: "b",
          type: "expense",
          occurred_at: "2026-01-01",
          amount: 1000,
          workspace: "biz",
          bank_raw_id: "raw1",
        } as Transaction,
      ],
      loans: [],
      workspaces: [{ id: "biz", type: "business" }],
    });
    expect(r.level).toBe("yellow");
    expect(r.stats.dupBankRawCount).toBeGreaterThan(0);
  });
});
