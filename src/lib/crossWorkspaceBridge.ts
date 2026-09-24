import type { Loan, Transaction } from "@/lib/finance";

type WorkspaceMetaLike = { id: string; type?: string | null; alias?: string | null };

export type WorkspaceCashPosition = {
  workspaceId: string;
  label: string;
  free: number; // bankGross - piggies (best-effort)
  bankGross: number;
  piggies: number;
  monthlyBurn: number; // last ~90d expenses monthlyized
  buffer: number; // recommended keep buffer
  surplus: number; // max(0, free - buffer)
};

export type BridgeRecommendation = {
  personalFree: number;
  business: WorkspaceCashPosition[];
  totalBusinessSurplus: number;
  personalNeed: number;
  targetDebtId: string | null;
  targetDebtName: string | null;
  suggestedTransfer: number; // min(personalNeed, totalBusinessSurplus)
  allocations: Array<{ workspaceId: string; amount: number }>;
  suggestedChannels: Array<"dividend" | "shareholder_loan_repay" | "salary_raise">;
  notes: string[];
};

function normWsName(meta: WorkspaceMetaLike | undefined, wsId: string) {
  if (wsId === "personal") return "Magán";
  return (meta?.alias ?? wsId) as string;
}

function netHuf(t: Transaction): number {
  const huf = Number(t.amount ?? 0);
  const eur = Number((t as any).eur_amount ?? 0);
  const rate = Number((t as any).eur_rate ?? 0);
  const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
  return huf + eurHuf;
}

function cashPosition(txns: Transaction[], workspaceId: string): { bankGross: number; piggies: number; free: number; spent90: number } {
  const now = Date.now();
  const ms90 = 90 * 24 * 60 * 60 * 1000;
  let bankGross = 0;
  let piggies = 0;
  let spent90 = 0;
  for (const t of txns) {
    const ws = String((t as any).workspace ?? "personal");
    if (ws !== workspaceId) continue;
    if (String((t as any).internal_transfer_kind ?? "")) {
      // ignore internal transfers for bridge cash estimation
      continue;
    }
    if (t.type === "saving") {
      piggies += Math.max(0, netHuf(t));
      continue;
    }
    const g = netHuf(t);
    bankGross += t.type === "income" ? g : -g;
    if (t.type === "expense") {
      const d = new Date(String(t.occurred_at ?? "")).getTime();
      if (Number.isFinite(d) && now - d <= ms90) spent90 += Math.max(0, g);
    }
  }
  const free = bankGross - piggies;
  return { bankGross, piggies, free, spent90 };
}

function remainingPrincipal(l: Loan): number {
  const s = Array.isArray(l.schedule) ? (l.schedule as any[]) : [];
  if (s.length > 0) {
    return s
      .filter((r) => r && r.status !== "paid")
      .reduce((acc, r) => acc + Math.max(0, Number(r.amount ?? 0)), 0);
  }
  return Math.max(0, Number(l.remaining_principal ?? 0));
}

export function computeCrossWorkspaceBridge(input: {
  txns: Transaction[];
  workspaceMetas: WorkspaceMetaLike[];
  loans: Loan[];
  personalWorkspaceId?: string; // default "personal"
  businessBufferMonths?: number; // default 1.0
  now?: Date;
}): BridgeRecommendation {
  const personalWorkspaceId = input.personalWorkspaceId ?? "personal";
  const bufferMonths = Math.max(0, Number(input.businessBufferMonths ?? 1));
  const metaById = new Map<string, WorkspaceMetaLike>();
  for (const m of input.workspaceMetas ?? []) metaById.set(m.id, m);

  const personalPos = cashPosition(input.txns, personalWorkspaceId);
  const personalFree = personalPos.free;

  const businessIds = (input.workspaceMetas ?? [])
    .filter((w) => w.id !== "personal" && w.id !== "__all")
    .filter((w) => (w.type ?? "").toString() === "business")
    .map((w) => w.id);

  const business: WorkspaceCashPosition[] = businessIds.map((id) => {
    const pos = cashPosition(input.txns, id);
    const monthlyBurn = pos.spent90 > 0 ? (pos.spent90 / 90) * 30 : 0;
    const buffer = monthlyBurn * bufferMonths;
    const surplus = Math.max(0, pos.free - buffer);
    return {
      workspaceId: id,
      label: normWsName(metaById.get(id), id),
      free: pos.free,
      bankGross: pos.bankGross,
      piggies: pos.piggies,
      monthlyBurn,
      buffer,
      surplus,
    };
  });

  const totalBusinessSurplus = business.reduce((a, b) => a + Math.max(0, b.surplus), 0);

  const personalLoans = (input.loans ?? []).filter((l) => (l.workspace_id ?? "personal") === personalWorkspaceId && l.status === "active");
  const highestInterest = [...personalLoans].sort((a, b) => Number(b.interest_rate_percent ?? 0) - Number(a.interest_rate_percent ?? 0))[0] ?? null;
  const highInterestOutstanding = highestInterest ? remainingPrincipal(highestInterest) : 0;

  // Need definition:
  // - if personal is negative: cover deficit
  // - else if there is high-interest debt: suggest a conservative extra payoff chunk (up to 1 month of business surplus)
  const deficit = Math.max(0, -personalFree);
  const extraDebtPay = deficit > 0 ? 0 : Math.min(highInterestOutstanding, totalBusinessSurplus);
  const personalNeed = deficit > 0 ? deficit : extraDebtPay;

  const suggestedTransfer = Math.max(0, Math.min(personalNeed, totalBusinessSurplus));

  // allocate proportionally to business surplus
  const allocations: Array<{ workspaceId: string; amount: number }> = [];
  if (suggestedTransfer > 0 && totalBusinessSurplus > 0) {
    let remaining = suggestedTransfer;
    const sorted = [...business].sort((a, b) => b.surplus - a.surplus);
    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i]!;
      if (b.surplus <= 0) continue;
      const part = i === sorted.length - 1 ? remaining : Math.min(remaining, (suggestedTransfer * b.surplus) / totalBusinessSurplus);
      const amt = Math.max(0, Math.round(part));
      if (amt > 0) allocations.push({ workspaceId: b.workspaceId, amount: amt });
      remaining -= amt;
      if (remaining <= 0) break;
    }
  }

  const notes: string[] = [];
  if (deficit > 0) notes.push("Magán oldalon negatív a szabad egyenleg → elsődlegesen deficit fedezése.");
  else if (highInterestOutstanding > 0) notes.push("Magán oldalon van aktív tartozás → javasolt részleges előtörlesztés üzleti surplusból.");
  if (totalBusinessSurplus <= 0) notes.push("Üzleti oldalon nincs biztonságosan mozgósítható szabad keret (buffer után).");

  return {
    personalFree,
    business,
    totalBusinessSurplus,
    personalNeed,
    targetDebtId: highestInterest?.id ?? null,
    targetDebtName: highestInterest?.name ?? null,
    suggestedTransfer,
    allocations,
    suggestedChannels: ["shareholder_loan_repay", "dividend", "salary_raise"],
    notes,
  };
}

