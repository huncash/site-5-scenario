import type { Transaction } from "@/lib/finance";

export function getWorkspaceTransactionsGuard(allTxns: Transaction[], workspaceId: string): Transaction[] {
  if (workspaceId === "__all") return allTxns;
  return allTxns.filter((t) => {
    const isInternal =
      t.internal_transfer_kind === "member_loan_out" || t.internal_transfer_kind === "member_loan_repay";
    if (isInternal) {
      // Exception: only show the overlay transfer on each side (never leak unrelated data)
      return (
        (t.internal_transfer_from ?? t.workspace ?? "personal") === workspaceId ||
        (t.internal_transfer_to ?? null) === workspaceId
      );
    }
    // Strict isolation: transaction must explicitly belong to the workspace.
    return (t.workspace ?? "personal") === workspaceId;
  });
}

