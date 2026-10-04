import type { Loan, Transaction, WorkspaceMeta } from "@/lib/finance";

export type ConsistencyLevel = "green" | "yellow" | "red";

export type ConsistencyIssue = {
  id: string;
  level: "yellow" | "red";
  kind: "orphan_txn" | "orphan_loan" | "dup_bank_raw" | "broken_transfer" | "invalid_project" | "multi_ws_risk";
  title: string;
  detail: string;
  entityType: "transaction" | "loan" | "workspace";
  entityId: string;
  workspace?: string | null;
};

export type ConsistencyReport = {
  level: ConsistencyLevel;
  issues: ConsistencyIssue[];
  stats: {
    workspaceCount: number;
    txnCount: number;
    loanCount: number;
    orphanTxnCount: number;
    orphanLoanCount: number;
    dupBankRawCount: number;
    brokenTransferCount: number;
  };
};

export function analyzeDataConsistency(input: {
  transactions: Transaction[];
  loans: Loan[];
  workspaces: WorkspaceMeta[];
}): ConsistencyReport {
  const wsIds = new Set(input.workspaces.map((w) => w.id));
  wsIds.add("personal");
  const issues: ConsistencyIssue[] = [];

  // Orphan transactions (unknown workspace)
  for (const t of input.transactions) {
    const ws = t.workspace ?? "personal";
    if (!wsIds.has(ws)) {
      issues.push({
        id: `orphan-txn-${t.id}`,
        level: "red",
        kind: "orphan_txn",
        title: "Árva tétel (ismeretlen munkatér)",
        detail: `A tétel workspace mezője („${ws}”) nem létező munkatérre mutat.`,
        entityType: "transaction",
        entityId: t.id,
        workspace: ws,
      });
    }
    if (t.project_id && !wsIds.has(t.project_id) && t.project_id !== ws) {
      // project_id may point to project workspace
      if (!wsIds.has(t.project_id)) {
        issues.push({
          id: `invalid-project-${t.id}`,
          level: "yellow",
          kind: "invalid_project",
          title: "Érvénytelen projekt-hivatkozás",
          detail: `project_id=${t.project_id} nem található a munkaterek között.`,
          entityType: "transaction",
          entityId: t.id,
          workspace: ws,
        });
      }
    }
  }

  // Orphan loans
  for (const l of input.loans) {
    const ws = l.workspace_id ?? "personal";
    if (!wsIds.has(ws)) {
      issues.push({
        id: `orphan-loan-${l.id}`,
        level: "red",
        kind: "orphan_loan",
        title: "Árva tartozás (ismeretlen munkatér)",
        detail: `A tartozás workspace_id mezője („${ws}”) nem létezik.`,
        entityType: "loan",
        entityId: l.id,
        workspace: ws,
      });
    }
  }

  // Duplicate bank_raw_id across different workspaces (double-count risk)
  const byRaw = new Map<string, Transaction[]>();
  for (const t of input.transactions) {
    const raw = t.bank_raw_id;
    if (!raw) continue;
    const list = byRaw.get(raw) ?? [];
    list.push(t);
    byRaw.set(raw, list);
  }
  let dupBankRawCount = 0;
  for (const [raw, list] of byRaw) {
    if (list.length < 2) continue;
    const workspaces = new Set(list.map((t) => t.workspace ?? "personal"));
    if (workspaces.size > 1) {
      dupBankRawCount += 1;
      for (const t of list) {
        issues.push({
          id: `dup-raw-${raw}-${t.id}`,
          level: "yellow",
          kind: "dup_bank_raw",
          title: "Duplikált banki forrás több workspace-ben",
          detail: `Ugyanaz a bank_raw_id (${raw.slice(0, 8)}…) ${workspaces.size} munkatéren is szerepel — Szumma dupla beleszámítás kockázat.`,
          entityType: "transaction",
          entityId: t.id,
          workspace: t.workspace ?? "personal",
        });
      }
    } else if (list.length > 1) {
      dupBankRawCount += 1;
      issues.push({
        id: `dup-raw-same-${raw}`,
        level: "yellow",
        kind: "dup_bank_raw",
        title: "Ismétlődő banki import ugyanabban a workspace-ben",
        detail: `${list.length} tétel ugyanarra a bank_raw_id-ra hivatkozik.`,
        entityType: "transaction",
        entityId: list[0]!.id,
        workspace: list[0]!.workspace ?? "personal",
      });
    }
  }

  // Broken internal transfer peer links
  const byId = new Map(input.transactions.map((t) => [t.id, t]));
  let brokenTransferCount = 0;
  for (const t of input.transactions) {
    if (!t.internal_transfer_kind) continue;
    const peer = t.internal_transfer_peer_id ? byId.get(t.internal_transfer_peer_id) : null;
    if (!peer) {
      brokenTransferCount += 1;
      issues.push({
        id: `broken-xfer-${t.id}`,
        level: "red",
        kind: "broken_transfer",
        title: "Hiányzó belső átvezetés pár",
        detail: "A tétel internal_transfer_peer_id hivatkozása nem található.",
        entityType: "transaction",
        entityId: t.id,
        workspace: t.workspace ?? "personal",
      });
    }
  }

  const orphanTxnCount = issues.filter((i) => i.kind === "orphan_txn").length;
  const orphanLoanCount = issues.filter((i) => i.kind === "orphan_loan").length;
  const red = issues.some((i) => i.level === "red");
  const yellow = issues.some((i) => i.level === "yellow");
  const level: ConsistencyLevel = red ? "red" : yellow ? "yellow" : "green";

  return {
    level,
    issues,
    stats: {
      workspaceCount: wsIds.size,
      txnCount: input.transactions.length,
      loanCount: input.loans.length,
      orphanTxnCount,
      orphanLoanCount,
      dupBankRawCount,
      brokenTransferCount,
    },
  };
}
