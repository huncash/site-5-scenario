import type { Loan } from "@/lib/finance";
import { debtNearTermBurden, debtPendingTotal } from "@/lib/finance";

export type DebtRecoveryMethod = "avalanche" | "snowball";

export type RankedDebt = {
  id: string;
  name: string;
  partner: string | null;
  workspace_id: string;
  remaining: number;
  nearTermMonthly: number;
  interestRate: number; // percent
};

function remainingPrincipal(l: Loan): number {
  const fromSchedule = debtPendingTotal(l.schedule);
  if ((l.schedule?.length ?? 0) > 0) return Math.max(0, fromSchedule);
  return Math.max(0, Number(l.remaining_principal ?? 0));
}

function interestRate(l: Loan): number {
  const r = Number(l.interest_rate_percent ?? 0);
  return Number.isFinite(r) ? Math.max(0, r) : 0;
}

export function rankDebts(loans: Loan[], method: DebtRecoveryMethod): RankedDebt[] {
  const base: RankedDebt[] = loans
    .filter((l) => l.status === "active")
    .map((l) => ({
      id: l.id,
      name: l.name,
      partner: (l.partner_name ?? null) as any,
      workspace_id: (l.workspace_id ?? "personal") as string,
      remaining: remainingPrincipal(l),
      nearTermMonthly: Math.max(0, debtNearTermBurden(l, 31)),
      interestRate: interestRate(l),
    }))
    .filter((d) => d.remaining > 0 || d.nearTermMonthly > 0);

  if (method === "avalanche") {
    return [...base].sort((a, b) => {
      if (b.interestRate !== a.interestRate) return b.interestRate - a.interestRate;
      if (b.remaining !== a.remaining) return b.remaining - a.remaining;
      return a.name.localeCompare(b.name);
    });
  }

  // snowball: smallest principal first
  return [...base].sort((a, b) => {
    if (a.remaining !== b.remaining) return a.remaining - b.remaining;
    if (b.interestRate !== a.interestRate) return b.interestRate - a.interestRate;
    return a.name.localeCompare(b.name);
  });
}

export function suggestedDebtFocus(loans: Loan[]): {
  avalanche: RankedDebt[];
  snowball: RankedDebt[];
  monthlyMinimumSum: number;
  totalRemaining: number;
} {
  const active = loans.filter((l) => l.status === "active");
  const avalanche = rankDebts(active, "avalanche");
  const snowball = rankDebts(active, "snowball");
  const monthlyMinimumSum = active.reduce((acc, l) => acc + Math.max(0, debtNearTermBurden(l, 31)), 0);
  const totalRemaining = active.reduce((acc, l) => acc + remainingPrincipal(l), 0);
  return { avalanche, snowball, monthlyMinimumSum, totalRemaining };
}

