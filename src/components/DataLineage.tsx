import { useMemo, useState } from "react";
import { Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ConsistencyIssue, ConsistencyReport } from "@/lib/dataConsistency";
import type { Loan, Transaction, WorkspaceMeta } from "@/lib/finance";

export function DataLineage({
  report,
  workspaces,
  transactions,
  loans,
  workspaceLabel,
  onOpenSettings,
  onDetachTransaction,
  onMoveTransaction,
}: {
  report: ConsistencyReport;
  workspaces: WorkspaceMeta[];
  transactions: Transaction[];
  loans: Loan[];
  workspaceLabel: (id: string) => string;
  onOpenSettings: (highlightIds: string[]) => void;
  onDetachTransaction: (txnId: string) => void | Promise<void>;
  onMoveTransaction: (txnId: string, toWorkspace: string) => void | Promise<void>;
}) {
  const [confirm, setConfirm] = useState<null | {
    title: string;
    detail: string;
    run: () => void | Promise<void>;
  }>(null);

  const issueByEntity = useMemo(() => {
    const m = new Map<string, ConsistencyIssue>();
    for (const i of report.issues) m.set(`${i.entityType}:${i.entityId}`, i);
    return m;
  }, [report.issues]);

  const wsNodes = useMemo(() => {
    const ids = new Set<string>(["personal", ...workspaces.map((w) => w.id)]);
    return Array.from(ids).map((id) => ({
      id,
      label: workspaceLabel(id),
      txnCount: transactions.filter((t) => (t.workspace ?? "personal") === id).length,
      loanCount: loans.filter((l) => (l.workspace_id ?? "personal") === id).length,
      hot: report.issues.some((i) => i.workspace === id),
      level: report.issues.find((i) => i.workspace === id)?.level ?? null,
    }));
  }, [workspaces, transactions, loans, report.issues, workspaceLabel]);

  const lampCls =
    report.level === "green"
      ? "bg-emerald-800 shadow-md shadow-emerald-950/50"
      : report.level === "yellow"
        ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.55)]"
        : "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.55)]";

  return (
    <Card id="data-lineage" className="card-table relative scroll-mt-24 border border-border/60 bg-background/40">
      <button
        type="button"
        className="absolute left-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-slate-950/50 text-slate-200 hover:bg-slate-900"
        title="Törzsadat / szerkezeti beállítások"
        onClick={() => {
          const ids = report.issues.map((i) => i.entityId);
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("ui:consistencyHighlightIds", JSON.stringify(ids));
            sessionStorage.setItem("ui:consistencyFocus", "1");
          }
          onOpenSettings(ids);
        }}
      >
        <Settings className="h-4 w-4" />
      </button>

      <CardHeader className="pb-3 pl-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Adat-eredet Diagram & Struktúra
          </CardTitle>
          <div className="flex items-center gap-3">
            <span className={cn("inline-block h-3 w-3 rounded-full", lampCls)} aria-hidden />
            <Badge variant="secondary" className="text-[10px]">
              {report.level === "green" ? "Tiszta" : report.level === "yellow" ? "Figyelmeztetés" : "Kritikus"}
            </Badge>
          </div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          [ Munkaterek ] → [ Adatforrások: Tételek / Tartozások / Bank ] → [ Globális Szumma ]
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-border/60 bg-black/20 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">1. Munkaterek</div>
            <ul className="mt-2.5 grid gap-2">
              {wsNodes.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "rounded border px-3 py-2 text-xs transition-all duration-200 hover:bg-slate-900/40",
                    n.level === "red"
                      ? "border-rose-500/50 bg-rose-950/40 text-rose-100"
                      : n.level === "yellow"
                        ? "border-amber-500/50 bg-amber-950/30 text-amber-100"
                      : "border-slate-800/70 bg-black/20 text-slate-200",
                  )}
                  title={`${n.label} — ${n.txnCount} tétel (tranzakció) · ${n.loanCount} tartozás/hitel. (A jelző szín a konzisztencia szintet mutatja.)`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-medium">{n.label}</span>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground"
                      title={`${n.txnCount} tétel (tranzakció) · ${n.loanCount} tartozás/hitel`}
                    >
                      <span className="font-mono tabular-nums text-slate-100">{n.txnCount}</span>
                      <span>tétel</span>
                      <span className="opacity-60">·</span>
                      <span className="font-mono tabular-nums text-slate-100">{n.loanCount}</span>
                      <span>tart.</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-border/60 bg-black/20 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">2. Adatforrások</div>
            <div className="mt-3 grid gap-2.5 text-xs text-muted-foreground">
              <div
                className="rounded border border-slate-800/70 bg-black/20 px-3 py-2.5"
                title="Összes tétel a kiválasztott scope-ban (minden workspace összesítve)."
              >
                Tételek: <span className="font-mono tabular-nums text-slate-100">{report.stats.txnCount}</span>
              </div>
              <div
                className="rounded border border-slate-800/70 bg-black/20 px-3 py-2.5"
                title="Összes tartozás/hitel rekord a kiválasztott scope-ban."
              >
                Tartozások: <span className="font-mono tabular-nums text-slate-100">{report.stats.loanCount}</span>
              </div>
              <div
                className={cn(
                  "rounded border px-3 py-2.5",
                  report.stats.dupBankRawCount > 0
                    ? "border-amber-500/50 bg-amber-950/30 text-amber-100"
                    : "border-slate-800/70 bg-black/20",
                )}
                title="Banki forrás-ütközés: ugyanaz a banki nyers sor (bank_raw_id) több helyen is beleszámítana. Ideális: 0."
              >
                Banki forrás-ütközés:{" "}
                <span className="font-mono tabular-nums">{report.stats.dupBankRawCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-black/20 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">3. Globális Szumma</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Összesített nézet. A lámpa jelzi, hogy a hivatkozások/duplikációk rendben vannak-e.
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className={cn("inline-block h-4 w-4 rounded-full", lampCls)} />
              <span className="text-sm font-semibold text-slate-100">
                {report.level === "green"
                  ? "Konzisztens"
                  : report.level === "yellow"
                    ? "Kockázat"
                    : "Kritikus hiba"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground">
              Konfliktusok: <span className="font-mono tabular-nums text-slate-100">{report.issues.length}</span>
            </div>
          </div>
        </div>

        {report.issues.length > 0 ? (
          <div className="rounded-md border border-border/60 bg-background/30">
            <div className="border-b border-border/60 px-4 py-3 text-xs font-medium text-slate-200">
              Konfliktusok & helyben javítás ({report.issues.length})
            </div>
            <ul className="divide-y divide-border/40">
              {report.issues.slice(0, 40).map((issue) => {
                const hot = issue.level === "red" ? "bg-rose-950/35" : "bg-amber-950/25";
                return (
                  <li
                    key={issue.id}
                    className={cn(
                      "flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between",
                      hot,
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            issue.level === "red"
                              ? "border-rose-500/40 text-rose-300"
                              : "border-amber-500/40 text-amber-300",
                          )}
                        >
                          {issue.level === "red" ? "PIROS" : "SÁRGA"}
                        </Badge>
                        <span className="text-sm font-medium text-slate-100">{issue.title}</span>
                      </div>
                      <div className="mt-1.5 text-xs text-muted-foreground">{issue.detail}</div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">
                        {issue.entityType}:{issue.entityId}
                        {issue.workspace ? ` · ws=${issue.workspace}` : ""}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      {issue.entityType === "transaction" &&
                      (issue.kind === "dup_bank_raw" || issue.kind === "orphan_txn" || issue.kind === "invalid_project") ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() =>
                            setConfirm({
                              title: "Vonatkoztatás / dupla beleszámítás eltávolítása?",
                              detail:
                                "A tétel workspace kötése „personal”-re áll, vagy a hibás projekt-hivatkozás törlődik. A tétel maga megmarad.",
                              run: () => onDetachTransaction(issue.entityId),
                            })
                          }
                        >
                          Vonatkoztatás törlése
                        </Button>
                      ) : null}
                      {issue.entityType === "transaction" && issue.kind === "orphan_txn" ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8"
                          onClick={() =>
                            setConfirm({
                              title: "Áthelyezés Magán munkatérre?",
                              detail: "Az árva tétel a Magán (personal) workspace-hez lesz rendelve.",
                              run: () => onMoveTransaction(issue.entityId, "personal"),
                            })
                          }
                        >
                          Áthelyezés → Magán
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </CardContent>

      <Dialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirm?.title ?? "Megerősítés"}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-300">{confirm?.detail}</div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirm(null)}>
              Mégse
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const fn = confirm?.run;
                setConfirm(null);
                if (fn) await fn();
              }}
            >
              Igen, mentés
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/** Szumma KPI lámpa kártya — kattintásra smooth scroll a lineage szekcióhoz */
export function ConsistencyLampCard({
  report,
  onClick,
}: {
  report: ConsistencyReport;
  onClick: () => void;
}) {
  const lamp =
    report.level === "green"
      ? { label: "Zöld — tiszta", cls: "bg-emerald-500", ring: "border-emerald-500/40" }
      : report.level === "yellow"
        ? { label: "Sárga — kockázat", cls: "bg-amber-400", ring: "border-amber-500/40" }
        : { label: "Piros — kritikus", cls: "bg-rose-500", ring: "border-rose-500/40" };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-md border border-l-4 bg-muted/25 p-3 text-left transition-colors hover:bg-muted/40",
        lamp.ring,
      )}
      title="Ugrás az Adat-eredet Diagramhoz"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-300">Adat-Konzisztencia</div>
        <span className={cn("inline-block h-3.5 w-3.5 rounded-full shadow", lamp.cls)} />
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{lamp.label}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">
        {report.issues.length === 0
          ? "Nincs konfliktus — kattints a lineage nézethez"
          : `${report.issues.length} jelzés · kattints a részletekhez`}
      </div>
    </button>
  );
}
