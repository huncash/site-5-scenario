import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Printer } from "lucide-react";

import { ProfileHeader } from "@/components/ProfileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { localdb } from "@/lib/localdb";
import { useVault } from "@/lib/vault";
import { decryptJSON } from "@/lib/crypto";
import { categoryLabel, formatMoney, type Transaction } from "@/lib/finance";
import { computeQuarterLockedVat } from "@/lib/financeCore";
import { isSchoolHost, SCHOOL_WATERMARK } from "@/lib/school";

export const Route = createFileRoute("/report")({
  component: ReportPage,
  validateSearch: (s: Record<string, unknown>) => ({
    profile: String(s.profile ?? ""),
    workspace: String(s.workspace ?? "personal"),
  }),
});

const CURRENCY = "HUF";
const CHART_COLORS = [
  "var(--color-chart-7)",
  "var(--color-chart-3)",
  "var(--color-chart-5)",
  "var(--color-chart-4)",
  "var(--color-chart-6)",
];

type TxnPayload = {
  amount: number;
  category: string;
  expense_type?: "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";
  muda_type?: "NONE" | "DUPLICATE_SUBSCRIPTION" | "FEES" | "IMPULSE_SPEND" | "WASTE";
  is_recurring?: boolean;
  title?: string | null;
  party?: string | null;
  note?: string | null;
  workspace?: string;
  vat_rate?: number | null;
  vat_treatment?: "hu_gross" | "no_vat" | "reverse_charge" | "foreign";
  vat_review?: boolean;
  internal_transfer_kind?: string | null;
  status?: "planned" | "committed" | "actual" | null;
};

function ReportPage() {
  const { state } = useVault();
  const vaultKey = state.status === "unlocked" ? state.key : null;
  const { workspace } = Route.useSearch();
  const profileId = state.status === "unlocked" ? state.profile.id : "";
  const profileName = state.status === "unlocked" ? state.profile.name : "—";

  const txnsQ = useQuery({
    queryKey: ["transactions"],
    enabled: state.status === "unlocked",
    queryFn: async (): Promise<Transaction[]> => {
      if (!vaultKey) return [];
      const rows = await localdb.listTxns();
      const out: Transaction[] = [];
      for (const r of rows) {
        try {
          const p = await decryptJSON<TxnPayload>(vaultKey, r.data_enc);
          out.push({
            id: r.id,
            user_id: "local",
            type: r.type,
            occurred_at: r.occurred_at,
            amount: p.amount,
            category: p.category,
            expense_type: (p.expense_type as any) ?? undefined,
            muda_type: (p.muda_type as any) ?? undefined,
            is_recurring: Boolean(p.is_recurring),
            title: p.title ?? null,
            party: p.party ?? null,
            note: p.note ?? null,
            vat_rate: p.vat_rate ?? null,
            vat_treatment: (p.vat_treatment as any) ?? null,
            vat_review: Boolean(p.vat_review),
            internal_transfer_kind: (p.internal_transfer_kind as any) ?? null,
            status: (p.status as any) ?? "actual",
            workspace: (p.workspace as any) ?? "personal",
          } as any);
        } catch {
          /* ignore undecodable */
        }
      }
      return out;
    },
    initialData: [],
  });

  const scoped = useMemo(() => {
    const all = txnsQ.data ?? [];
    if (workspace === "__all") return all;
    return all.filter((t) => (t.workspace ?? "personal") === workspace);
  }, [txnsQ.data, workspace]);

  const kpis = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of scoped) {
      if ((t.status ?? "actual") !== "actual") continue;
      const a = Math.max(0, Number(t.amount ?? 0));
      if (t.type === "income") income += a;
      else if (t.type === "expense") expense += a;
    }
    const balance = income - expense;
    const qVat = computeQuarterLockedVat(scoped as any);
    const lockedVat = qVat.lockedVat;
    return { income, expense, balance, lockedVat };
  }, [scoped]);

  const topExpenses = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of scoped) {
      if ((t.status ?? "actual") !== "actual") continue;
      if (t.type !== "expense") continue;
      const key = String(t.category ?? "");
      map.set(key, (map.get(key) ?? 0) + Math.max(0, Number(t.amount ?? 0)));
    }
    return Array.from(map.entries())
      .map(([category, value]) => ({ category, label: categoryLabel(category), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [scoped]);

  return (
    <div className="h-screen flex flex-col">
      <div className="print-hidden">
        <ProfileHeader profileId={profileId} profileName={profileName} showBack />
      </div>
      <main className="mx-auto w-full max-w-[98%] flex-1 overflow-y-auto px-2 py-6 sm:px-4 custom-scrollbar print-container">
        <div className="flex flex-wrap items-end justify-between gap-3 print-hidden">
          <div>
            <div className="text-xl font-semibold tracking-tight">📊 Vezetői riport</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Workspace: <span className="font-mono text-foreground">{workspace}</span>
            </div>
          </div>
          <Button type="button" onClick={() => window.print()} title="Nyomtatás / PDF mentése">
            <Printer className="mr-2 h-4 w-4" />
            Nyomtatás / PDF mentése
          </Button>
        </div>
        {isSchoolHost() ? (
          <p className="school-print-stamp mt-4 rounded-md border border-border/70 bg-background px-3 py-2 text-sm font-semibold tracking-wide text-foreground">
            {SCHOOL_WATERMARK}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Card className="print-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tiszta egyenleg (nettó)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{formatMoney(Math.round(kpis.balance), CURRENCY)}</div>
              <div className="mt-1 text-xs text-muted-foreground">🎯 Mire jó? Gyors „pillanatkép” a pénzügyi mozgástérről.</div>
            </CardContent>
          </Card>
          <Card className="print-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bevétel vs. Kiadás (nettó)</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Bevétel</span>
                <span className="font-mono">{formatMoney(Math.round(kpis.income), CURRENCY)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-slate-300">Kiadás</span>
                <span className="font-mono">{formatMoney(Math.round(kpis.expense), CURRENCY)}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">💡 Pro Tip: a fix költségek csökkentése a leggyorsabb stabilizáló lépés.</div>
            </CardContent>
          </Card>
          <Card className="print-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ÁFA zárolás (aktuális negyedév)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tabular-nums">{formatMoney(Math.round(kpis.lockedVat), CURRENCY)}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                ⚙️ Hogyan működik? A negyedéves áfa logika alapján becsült, kötelezettségként kezelt tartalék.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="print-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top 5 kiadási kategória</CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  breakdown
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {topExpenses.length === 0 ? (
                <div className="text-sm text-muted-foreground">Még nincs kiadás ebben a scope-ban.</div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topExpenses}
                        dataKey="value"
                        nameKey="label"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        stroke="var(--color-background)"
                        strokeWidth={2}
                      >
                        {topExpenses.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          color: "var(--color-popover-foreground)",
                        }}
                        formatter={(v: number) => formatMoney(Math.round(v), CURRENCY)}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="print-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gyors értékelés (Health Index)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-xs text-muted-foreground">
                🎯 Mire jó? Egy 0–100-as, gyorsan olvasható mutató a stabilitásról (nem könyvelési minősítés).
              </div>
              {(() => {
                const score = Math.max(0, Math.min(100, 50 + (kpis.balance > 0 ? 20 : -20) + (kpis.lockedVat > 0 ? -10 : 0)));
                return (
                  <div className="rounded-md border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Egészség index</span>
                      <span className="font-mono text-foreground">{score}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      💡 Pro Tip: ha az index alacsony, először a fix havi terheket és az ÁFA tartalék fegyelmet érdemes erősíteni.
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 print-hidden">
          <div className="text-xs text-muted-foreground">
            Nyomtatáskor a felület automatikusan „fehér lap” nézetre vált a jobb olvashatóságért.
          </div>
        </div>
      </main>
    </div>
  );
}

