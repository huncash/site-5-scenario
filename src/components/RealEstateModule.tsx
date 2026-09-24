import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/finance";
import { formatMoney } from "@/lib/finance";
import type { RealEstateProperty } from "@/types/workspace";

export function RealEstateModule({
  properties,
  txns,
  monthKey,
  currency = "HUF",
  title = "Ingatlanok térülése & fenntartási költsége",
}: {
  properties: RealEstateProperty[];
  txns: Transaction[];
  monthKey: string; // YYYY-MM
  currency?: string;
  title?: string;
}) {
  const rows = useMemo(() => {
    const byId = new Map<string, { income: number; expense: number }>();
    for (const p of properties) byId.set(p.id, { income: 0, expense: 0 });
    for (const t of txns) {
      const pid = (t.property_id ?? null) as string | null;
      if (!pid) continue;
      if (!byId.has(pid)) continue;
      if (!String(t.occurred_at).startsWith(monthKey)) continue;
      const a = Math.max(0, Number(t.amount ?? 0));
      const cur = byId.get(pid)!;
      if (t.type === "income") cur.income += a;
      else if (t.type === "expense") cur.expense += a;
    }
    return properties.map((p) => {
      const s = byId.get(p.id) ?? { income: 0, expense: 0 };
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        income: s.income,
        expense: s.expense,
        net: s.income - s.expense,
        isIncomeGenerating: p.isIncomeGenerating,
      };
    });
  }, [monthKey, properties, txns]);

  if (!properties || properties.length === 0) {
    return (
      <Card className="border border-border/60 bg-background/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">🏠 {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Nincs felvett ingatlan a Magán munkaterülethez.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 bg-background/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          🏠 {title} <span className="ml-2 text-[11px] text-muted-foreground">({monthKey})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {rows.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.name}</div>
              <div className="text-[11px] text-muted-foreground">
                bevétel: <span className="font-mono">{formatMoney(Math.round(r.income), currency)}</span> · költség:{" "}
                <span className="font-mono">{formatMoney(Math.round(r.expense), currency)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={r.net >= 0 ? "font-semibold text-emerald-400 tabular-nums" : "font-semibold text-rose-400 tabular-nums"}>
                {r.net >= 0 ? "+" : ""}
                {formatMoney(Math.round(r.net), currency)}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {r.isIncomeGenerating ? "jövedelemtermelő" : "fenntartási"}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

