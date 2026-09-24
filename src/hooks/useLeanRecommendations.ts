import { useMemo } from "react";

import { formatMoney, type Transaction, type WorkspaceMeta } from "@/lib/finance";
import { isTransportTransaction } from "@/lib/financeCore";

export type LeanRecommendationType = "CRITICAL" | "WARNING" | "OPTIMIZATION" | "SUCCESS";

export type LeanNavigateTarget = "ledger" | "deals" | "cashflow" | "inventory";

export type LeanRecommendation = {
  id: string;
  type: LeanRecommendationType;
  title: string;
  /** Javasolt akció (CTA szöveg / mit tegyen a felhasználó) */
  action: string;
  /** Várható hatás */
  impact: string;
  ctaLabel: string;
  navigateTo?: LeanNavigateTarget;
  proof?: {
    claim: string;
    why: string;
    lines: string[];
  };
};

export type LeanRecommendationsInput = {
  transactions: Transaction[];
  workspaces: WorkspaceMeta[];
  workspaceName?: (id: string) => string;
  currency?: string;
  now?: Date;
  /** Max ajánlások (alap: 6) */
  limit?: number;
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDueDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function txnAmountHuf(t: Transaction): number {
  const huf = Number(t.amount ?? 0);
  const eur = Number(t.eur_amount ?? 0);
  const rate = Number(t.eur_rate ?? 0);
  const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
  return Math.abs(huf + eurHuf);
}

function txnTitle(t: Transaction): string {
  return (
    String(t.title ?? "").trim() ||
    String(t.note ?? "").trim() ||
    String(t.party ?? "").trim() ||
    String(t.category ?? "").trim() ||
    "Tétel"
  );
}

function proofLine(t: Transaction, currency: string): string {
  const d = String(t.occurred_at ?? "").slice(0, 10);
  const amt = txnAmountHuf(t);
  const sign = t.type === "expense" ? "-" : t.type === "income" ? "+" : "";
  const tag = String(t.id).slice(0, 8);
  return `${d} · ${txnTitle(t)} (${sign}${formatMoney(Math.round(amt), currency)}) · #${tag}`;
}

function isProjectTxn(t: Transaction, projectId: string): boolean {
  if ((t.project_id ?? null) === projectId) return true;
  return (t.workspace ?? "") === projectId;
}

function isSubscriptionCategory(category: string): boolean {
  const c = category.toLowerCase().trim();
  return (
    c === "subscription" ||
    c === "recurring" ||
    c === "recurring_software" ||
    c === "fixed_cost" ||
    c.includes("előfizetés") ||
    c.includes("elofizetes") ||
    c.includes("szoftver")
  );
}

/**
 * LEAN_SPEC szabályalapú ajánló (CHECK → ACT).
 * Tiszta függvény — hook és unit tesztek is ezt hívják.
 */
export function computeLeanRecommendations(input: LeanRecommendationsInput): LeanRecommendation[] {
  const {
    transactions,
    workspaces,
    workspaceName = (id) => id,
    currency = "HUF",
    now = new Date(),
    limit = 6,
  } = input;

  const today = startOfDay(now);
  const recs: LeanRecommendation[] = [];

  // 1) Overdue invoices (kintlévőség)
  {
    const overdue = transactions.filter((t) => {
      if (t.type !== "income") return false;
      const st = t.invoice_status ?? null;
      if (st !== "unpaid" && st !== "pending") return false;
      const due = parseDueDate(t.due_date);
      if (!due) return false;
      return startOfDay(due) < today;
    });
    if (overdue.length > 0) {
      const sum = overdue.reduce((acc, t) => acc + txnAmountHuf(t), 0);
      recs.push({
        id: "overdue-invoices",
        type: "CRITICAL",
        title: `Lejárt kintlévőség detektálva (${formatMoney(Math.round(sum), currency)})`,
        action: "Küldj fizetési felszólítást és fagyaszd be az új kiadásokat!",
        impact: "Cashflow egyenleg megvédése / likviditás helyreállítása",
        ctaLabel: "Ugrás: Tételek",
        navigateTo: "ledger",
        proof: {
          claim: `Lejárt kintlévőség: ${formatMoney(Math.round(sum), currency)} (${overdue.length} db)`,
          why: "invoice_status=unpaid/pending és a due_date a mai nap előtt van.",
          lines: overdue
            .slice()
            .sort((a, b) => txnAmountHuf(b) - txnAmountHuf(a))
            .slice(0, 8)
            .map((t) => proofLine(t, currency)),
        },
      });
    }
  }

  // 2) Budget overrun > 110% (projekt munkaterek)
  {
    for (const ws of workspaces) {
      if (ws.type !== "project") continue;
      const budget = Number(ws.project_budget_huf ?? 0);
      if (!(budget > 0)) continue;

      const projectExpenses = transactions.filter((t) => t.type === "expense" && isProjectTxn(t, ws.id));
      const actual = projectExpenses.reduce((acc, t) => acc + txnAmountHuf(t), 0);

      if (actual > budget * 1.1) {
        const overrunPct = Math.round((actual / budget - 1) * 100);
        const name = workspaceName(ws.id);
        recs.push({
          id: `budget-overrun-${ws.id}`,
          type: "WARNING",
          title: `Büdzsé túllépés ${overrunPct}%-kal a(z) ${name} projektnél`,
          action: "Hatáskör (scope) zárolása vagy pótbevonás / pótárazás indítása.",
          impact: "Árrés megőrzése — Árrés-Ezió megállítása",
          ctaLabel: "Ugrás: Tételek",
          navigateTo: "ledger",
          proof: {
            claim: `Projekt költség: ${formatMoney(Math.round(actual), currency)} / ${formatMoney(Math.round(budget), currency)} (+${overrunPct}%)`,
            why: "A projekthez rendelt kiadások összege meghaladja a project_budget_huf keretet.",
            lines: projectExpenses
              .slice()
              .sort((a, b) => txnAmountHuf(b) - txnAmountHuf(a))
              .slice(0, 8)
              .map((t) => proofLine(t, currency)),
          },
        });
      }
    }
  }

  // 3) Transport ratio > 8%
  {
    for (const ws of workspaces) {
      if (ws.type !== "project" && ws.type !== "business") continue;
      const projectExpenses = transactions.filter((t) => t.type === "expense" && isProjectTxn(t, ws.id));
      const total = projectExpenses.reduce((acc, t) => acc + txnAmountHuf(t), 0);
      if (total <= 0) continue;

      const transport = projectExpenses
        .filter((t) => isTransportTransaction(t))
        .reduce((acc, t) => acc + txnAmountHuf(t), 0);
      const ratio = transport / total;
      if (ratio > 0.08) {
        const pct = Math.round(ratio * 100);
        const name = workspaceName(ws.id);
        recs.push({
          id: `transport-ratio-${ws.id}`,
          type: "OPTIMIZATION",
          title: `Magas logisztikai költség (${pct}%) — ${name}`,
          action: "Javasolt a szállítások összevonása vagy helyi beszerzés.",
          impact: "Anyagdíj-arányos fuvar költség csökkentése",
          ctaLabel: "Ugrás: Tételek",
          navigateTo: "ledger",
          proof: {
            claim: `Logisztika: ${pct}% (fuvar ${formatMoney(Math.round(transport), currency)} / összes ${formatMoney(Math.round(total), currency)})`,
            why: "A transport jellegű tételek aránya meghaladja a küszöböt (8%).",
            lines: projectExpenses
              .filter((t) => isTransportTransaction(t))
              .slice()
              .sort((a, b) => txnAmountHuf(b) - txnAmountHuf(a))
              .slice(0, 8)
              .map((t) => proofLine(t, currency)),
          },
        });
      }
    }
  }

  // 4) Unassigned subscription / passive fixed cost
  {
    const passive = transactions.filter((t) => {
      if (t.type !== "expense") return false;
      if ((t.project_id ?? null) !== null) return false;
      return isSubscriptionCategory(String(t.category ?? ""));
    });
    if (passive.length > 0) {
      const sum = passive.reduce((acc, t) => acc + txnAmountHuf(t), 0);
      recs.push({
        id: "unassigned-subscription",
        type: "OPTIMIZATION",
        title: "Inaktív passzív költség detektálva",
        action: `Felülvizsgálat vagy lemondás javasolt (${formatMoney(Math.round(sum), currency)} érintett).`,
        impact: "Fix költség csökkentése / runway növelése",
        ctaLabel: "Ugrás: Tételek",
        navigateTo: "ledger",
        proof: {
          claim: `Passzív előfizetés (nincs projekthez kötve): ${formatMoney(Math.round(sum), currency)}`,
          why: "Előfizetés/rekurrens jellegű kategória és project_id üres.",
          lines: passive
            .slice()
            .sort((a, b) => txnAmountHuf(b) - txnAmountHuf(a))
            .slice(0, 10)
            .map((t) => proofLine(t, currency)),
        },
      });
    }
  }

  // Prioritás: CRITICAL → WARNING → OPTIMIZATION → SUCCESS
  const rank: Record<LeanRecommendationType, number> = {
    CRITICAL: 0,
    WARNING: 1,
    OPTIMIZATION: 2,
    SUCCESS: 3,
  };
  recs.sort((a, b) => rank[a.type] - rank[b.type]);

  return recs.slice(0, Math.max(1, limit));
}

export function useLeanRecommendations(input: LeanRecommendationsInput): LeanRecommendation[] {
  const {
    transactions,
    workspaces,
    workspaceName,
    currency = "HUF",
    now,
    limit = 6,
  } = input;

  return useMemo(
    () =>
      computeLeanRecommendations({
        transactions,
        workspaces,
        workspaceName,
        currency,
        now,
        limit,
      }),
    [transactions, workspaces, workspaceName, currency, now, limit],
  );
}
