import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categoryLabel, formatMoney, txnDayIso, type Transaction } from "@/lib/finance";
import { channelBadgeClass, channelLabel, detectTransactionChannel } from "@/lib/transactionChannel";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";

function expenseKind(et: Transaction["expense_type"]): "NEED" | "WANT" | "INVESTMENT" | null {
  if (et === "WANT") return "WANT";
  if (et === "INVESTMENT") return "INVESTMENT";
  if (et === "FIX_NEED" || et === "VARIABLE_NEED") return "NEED";
  return null;
}

function kindBadgeCls(k: "NEED" | "WANT" | "INVESTMENT") {
  if (k === "NEED") return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  if (k === "WANT") return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
}

export function RawTransactionAuditTable(props: {
  title?: string;
  txns: Transaction[];
  workspaceId: string;
  currency: string;
  pageSize?: number;
  dayIso?: string | null; // YYYY-MM-DD
  onClearDayFilter?: () => void;
  onEditTxn?: (t: Transaction) => void;
}) {
  const title = props.title ?? "Szinkronizált Tételek (Audit Táblázat)";
  const [pageSize, setPageSize] = useState(() => {
    const v = Number(props.pageSize ?? 25);
    return v === 15 || v === 25 || v === 50 ? v : 25;
  });

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const day = (props.dayIso ?? "").trim();
    const base = (props.txns ?? [])
      .filter((t) => t.type === "income" || t.type === "expense" || t.type === "saving")
      .filter((t) => {
        if (props.workspaceId === "__all") return true;
        return String((t.workspace ?? "personal") as string) === props.workspaceId;
      })
      .filter((t) => {
        if (!day) return true;
        return txnDayIso(t.occurred_at) === day;
      })
      .sort((a, b) => (String(a.occurred_at) < String(b.occurred_at) ? 1 : -1));

    if (!q) return base;
    return base.filter((t) => {
      const partner = String(t.party ?? "").toLowerCase();
      const desc = String(t.note ?? t.title ?? "").toLowerCase();
      return partner.includes(q) || desc.includes(q);
    });
  }, [props.txns, props.workspaceId, props.dayIso, query]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [query, props.workspaceId, props.dayIso, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const shown = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  return (
    <Card className="card-table w-full">
      <CardHeader className="shrink-0 pb-1.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Gyors audit a banki XML-ből szinkronizált (nyers) tételekre.
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {props.dayIso ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  Nap: <span className="ml-1 font-mono">{props.dayIso}</span>
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => props.onClearDayFilter?.()}
                  title="Napi szűrő törlése"
                >
                  Szűrő törlése
                </Button>
              </div>
            ) : null}
            <Input
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              placeholder="Keresés: partner vagy megjegyzés…"
              className="h-8 w-full sm:w-72 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col pt-0">
        {rows.length === 0 ? (
          <div className="rounded-md border border-border/60 bg-background/40 p-3 text-sm text-muted-foreground">
            Még nincs szinkronizált tétel. Kattints a &quot;Banki szinkron&quot; gombra a mappából való beolvasáshoz!
          </div>
        ) : (
          <div className="min-h-0 flex-1 rounded-md border border-border/60 bg-background/40">
            <div className="card-scroll-body">
              <table className="w-full table-fixed text-xs">
                <thead className="bg-slate-900/60">
                  <tr className="border-b border-border/60 text-[11px] text-slate-300">
                    <th className="w-[92px] px-2 py-1.5 text-left font-medium">Dátum</th>
                    <th className="w-[92px] px-2 py-1.5 text-left font-medium">Forrás</th>
                    <th className="w-[160px] px-2 py-1.5 text-left font-medium">Partner</th>
                    <th className="px-2 py-1.5 text-left font-medium">Megjegyzés</th>
                    <th className="w-[112px] px-2 py-1.5 text-right font-medium">Összeg</th>
                    <th className="w-[128px] px-2 py-1.5 text-left font-medium">Kategória</th>
                    <th className="w-[90px] px-2 py-1.5 text-left font-medium">Típus</th>
                    <th className="w-[90px] px-2 py-1.5 text-left font-medium">Muda</th>
                    <th className="w-[44px] px-2 py-1.5 text-right font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {shown.map((t) => {
                    const d = new Date(String(t.occurred_at ?? ""));
                    const dateLabel = Number.isFinite(d.getTime()) ? d.toLocaleDateString("hu-HU") : String(t.occurred_at ?? "");
                    const partner = String(t.party ?? "").trim() || "—";
                    const desc = String(t.note ?? t.title ?? "").trim() || "—";
                    const rawAmt = Math.round(Number(t.amount ?? 0));
                    const isExpense = t.type === "expense";
                    const sign = isExpense ? "-" : "";
                    const kind = expenseKind(t.expense_type);
                    const muda = String(t.muda_type ?? "").trim();
                    const isBank = Boolean(t.bank_raw_id);
                    const channelText = String([t.note ?? "", t.title ?? "", t.party ?? ""].filter(Boolean).join(" ")).trim();
                    const ch = isBank ? detectTransactionChannel(channelText) : null;
                    return (
                      <tr key={t.id} className="border-b border-border/40 align-top">
                        <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{dateLabel}</td>
                        <td className="px-2 py-1.5">
                          {isBank ? (
                            <Badge variant="secondary" className={cn("border", ch ? channelBadgeClass(ch) : "")}>
                              {channelLabel(ch ?? "bank", t.type)}
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="border border-slate-500/30 bg-slate-500/10 text-slate-200">
                              ✏️ Kézi
                            </Badge>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="min-w-0 truncate font-medium" title={partner}>
                            {partner}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="min-w-0 truncate text-muted-foreground" title={desc}>
                            {desc}
                          </div>
                        </td>
                        <td
                          className={cn(
                            "px-2 py-1.5 text-right font-mono tabular-nums whitespace-nowrap",
                            isExpense ? "text-rose-300" : t.type === "income" ? "text-emerald-300" : "text-slate-200",
                          )}
                        >
                          {sign}
                          {formatMoney(Math.abs(rawAmt), props.currency)}
                        </td>
                        <td className="px-2 py-1.5">
                          {(() => {
                            const c = categoryLabel(String(t.category ?? "")) || "—";
                            return (
                              <div className="min-w-0 truncate" title={c}>
                                {c}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-1.5">
                          {kind ? (
                            <Badge variant="secondary" className={cn("border", kindBadgeCls(kind))}>
                              {kind}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          {muda && muda !== "NONE" ? (
                            <Badge variant="secondary" className="border border-rose-500/30 bg-rose-500/10 text-rose-200">
                              {muda}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          {props.onEditTxn ? (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => props.onEditTxn?.(t)}
                              aria-label="Szerkesztés"
                              title="Szerkesztés"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-2 border-t border-border/60 px-3 py-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div>
                Összesen: <span className="font-mono text-slate-200">{rows.length}</span> tétel
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  title="Első oldal"
                >
                  ⏮ Első
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  title="Előző oldal"
                >
                  ◀ Előző
                </Button>
                <span className="font-mono text-[11px] text-slate-200">
                  {page} / {pageCount} oldal
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  disabled={page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  title="Következő oldal"
                >
                  Következő ▶
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-[11px]"
                  disabled={page >= pageCount}
                  onClick={() => setPage(pageCount)}
                  title="Utolsó oldal"
                >
                  Végére ⏭
                </Button>

                <div className="ml-1 flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">/ oldal</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const v = Number(e.currentTarget.value);
                      setPageSize(v === 15 || v === 25 || v === 50 ? v : 25);
                    }}
                    className="h-7 rounded-md border border-border/60 bg-background/40 px-2 text-[11px] text-slate-200"
                    aria-label="Oldalméret"
                    title="Oldalméret"
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

