import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

import { LeanTerm } from "@/components/HelpIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction, WorkspaceMeta } from "@/lib/finance";
import { formatMoney } from "@/lib/finance";
import {
  runLeanConsultantEngine,
  type LeanConsultantAdvice,
  type PdcaUiMode,
} from "@/lib/leanConsultantRules";
import { acceptVizAdvice, LEAN_VIZ_PLAYBOOK } from "@/lib/leanViz";
import { cn } from "@/lib/utils";
import { LeanProofPopover, type LeanProof } from "@/components/LeanProofPopover";

export function LeanConsultantPanel({
  transactions,
  workspaces,
  workspaceId,
  pdcaMode,
  onApplyAdvice,
}: {
  transactions: Transaction[];
  workspaces: WorkspaceMeta[];
  workspaceId?: string | null;
  pdcaMode?: PdcaUiMode | null;
  /** Ha a tanács target-je navigálható, a hívó reagálhat */
  onApplyAdvice?: (
    advice: LeanConsultantAdvice,
    plan?: { id: "tag_manual_auto" | "prefer_import" | "other" },
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const [followup, setFollowup] = useState<LeanConsultantAdvice | null>(null);

  const isAccepted = (ruleId: string) => {
    try {
      if (typeof localStorage === "undefined") return false;
      return localStorage.getItem(`ui:leanAccepted:${ruleId}`) === "1";
    } catch {
      return false;
    }
  };

  const accept = (ruleId: string) => {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(`ui:leanAccepted:${ruleId}`, "1");
    } catch {
      /* ignore */
    }
  };

  const setFlag = (k: string, v: string) => {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(k, v);
    } catch {
      /* ignore */
    }
  };

  const amountHuf = (t: Transaction) => {
    const huf = Number(t.amount ?? 0);
    const eur = Number(t.eur_amount ?? 0);
    const rate = Number(t.eur_rate ?? 0);
    const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
    return Math.abs(huf + eurHuf);
  };

  const titleOf = (t: Transaction) =>
    String(t.title ?? "").trim() ||
    String(t.note ?? "").trim() ||
    String(t.party ?? "").trim() ||
    String(t.category ?? "").trim() ||
    "Tétel";

  const adviceProof = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const parse = (raw?: string | null) => {
      if (!raw) return null;
      const d = new Date(raw);
      return Number.isFinite(d.getTime()) ? d : null;
    };
    const line = (t: Transaction, currency: string) => {
      const d = String(t.occurred_at ?? "").slice(0, 10);
      const sign = t.type === "expense" ? "-" : t.type === "income" ? "+" : "";
      const tag = String(t.id).slice(0, 8);
      return `${d} · ${titleOf(t)} (${sign}${formatMoney(Math.round(amountHuf(t)), currency)}) · #${tag}`;
    };
    const currency = "HUF";

    const build = (a: LeanConsultantAdvice): LeanProof | null => {
      const rule = a.ruleId;

      if (rule === "muda.waiting.receivables") {
        const overdue = transactions.filter((t) => {
          if (t.type !== "income") return false;
          const st = t.invoice_status ?? null;
          if (st !== "unpaid" && st !== "pending") return false;
          const due = parse(t.due_date);
          if (!due) return false;
          return startOfDay(due) < today;
        });
        const sum = overdue.reduce((acc, t) => acc + amountHuf(t), 0);
        return {
          claim: a.title,
          why: `Lejárt számlák összege: ${formatMoney(Math.round(sum), currency)}.`,
          lines: overdue
            .slice()
            .sort((x, y) => amountHuf(y) - amountHuf(x))
            .slice(0, 8)
            .map((t) => line(t, currency)),
        };
      }

      if (rule === "muda.motion.manual_entry") {
        const lookbackDays = 90;
        const lookbackStart = new Date(now);
        lookbackStart.setDate(lookbackStart.getDate() - lookbackDays);
        const recent = transactions.filter((t) => {
          if (t.type !== "expense" && t.type !== "income") return false;
          const at = parse(t.occurred_at);
          if (!at) return false;
          return at >= lookbackStart;
        });
        const manual = recent.filter((t) => !t.bank_raw_id);
        return {
          claim: a.title,
          why: "A listázott tételek kézi rögzítésűek (nincs bank_raw_id), ezért adminisztrációs muda-t okoznak.",
          lines: manual
            .slice()
            .sort((x, y) => String(y.occurred_at).localeCompare(String(x.occurred_at)))
            .slice(0, 10)
            .map((t) => line(t, currency)),
        };
      }

      if (rule === "heijunka.payment_peak") {
        const key = String(a.metrics?.monthKey ?? "");
        if (!key) return null;
        const monthTxns = transactions
          .filter((t) => t.type === "expense" && String(t.occurred_at ?? "").startsWith(key))
          .slice()
          .sort((x, y) => amountHuf(y) - amountHuf(x))
          .slice(0, 10);
        return {
          claim: a.title,
          why: "A csúcsot jellemzően néhány nagy (vagy kötelezettség jellegű) tétel hajtja; itt a legnagyobbak.",
          lines: monthTxns.map((t) => line(t, currency)),
        };
      }

      if (rule === "muda.inventory.idle_cash") {
        const lookbackDays = 90;
        const lookbackStart = new Date(now);
        lookbackStart.setDate(lookbackStart.getDate() - lookbackDays);
        const recent = transactions.filter((t) => {
          const at = parse(t.occurred_at);
          if (!at) return false;
          return at >= lookbackStart;
        });
        const topIn = recent
          .filter((t) => t.type === "income")
          .slice()
          .sort((x, y) => amountHuf(y) - amountHuf(x))
          .slice(0, 4);
        const topOut = recent
          .filter((t) => t.type === "expense")
          .slice()
          .sort((x, y) => amountHuf(y) - amountHuf(x))
          .slice(0, 4);
        return {
          claim: a.title,
          why: "A “szabad egyenleg” a közelmúlt bevétel/kiadás mintázatából adódik; érdemes célhoz/perselyhez kötni.",
          lines: [...topIn.map((t) => line(t, currency)), ...topOut.map((t) => line(t, currency))],
        };
      }

      return null;
    };

    return { build };
  }, [transactions]);

  const result = useMemo(() => {
    if (!open) return null;
    return runLeanConsultantEngine({
      transactions,
      workspaces,
      workspaceId,
      pdcaMode,
      now: new Date(),
    });
  }, [open, transactions, workspaces, workspaceId, pdcaMode]);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 sm:w-auto"
        onClick={() => setOpen(true)}
        title="Lean AI Consultant szabálymotor"
      >
        <Sparkles className="h-4 w-4" />
        Lean AI Consultant
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <LeanTerm
                title="Lean AI Consultant"
                exact="helyszíni tanácsadó — muda, egyenletes terhelés, 5S. A gépeden fut, nem felhő."
              >
                Lean AI Consultant
              </LeanTerm>
            </DialogTitle>
            <DialogDescription>
              Offline szabálymotor: muda, Heijunka, 5S, és a helyzetre szabott Lean kimutatás
              (vízesés, bullet, hőtérkép, kis többszörös, Sankey). A választott nézetet megjegyzi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tanácsok
              </div>
              {!result || result.advice.length === 0 ? (
                <div className="rounded-md border border-slate-700/60 bg-black/20 p-3 text-xs text-slate-300">
                  Nincs kiemelendő muda / heijunka jel — tartsd a PDCA ritmust.
                </div>
              ) : (
                <ul className="grid gap-3">
                  {result.advice.map((a) => (
                    <li
                      key={a.id}
                      className={cn(
                        "rounded-md border p-3",
                        a.severity === "critical"
                          ? "border-rose-500/40 bg-rose-950/20"
                          : a.severity === "warning"
                            ? "border-amber-500/40 bg-amber-950/15"
                            : "border-slate-700/60 bg-black/20",
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {a.severity}
                        </Badge>
                        {a.muda ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {a.muda}
                          </Badge>
                        ) : null}
                        <LeanProofPopover proof={adviceProof.build(a)} />
                        {isAccepted(a.ruleId) ? (
                          <Badge variant="secondary" className="text-[10px]">
                            ✅ elfogadva
                          </Badge>
                        ) : null}
                      </div>
                      <div className="mt-2 text-sm font-medium text-slate-100">{a.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{a.action}</div>
                      <div className="mt-1 text-xs text-slate-500">{a.impact}</div>
                      {onApplyAdvice ? (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            // Guided follow-up for specific rules (coaching, not command).
                            if (a.ruleId === "muda.motion.manual_entry") {
                              setFollowup(a);
                              return;
                            }
                            accept(a.ruleId);
                            onApplyAdvice(a);
                            setOpen(false);
                          }}
                        >
                          Elfogadom / segíts
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result && result.checklist.length > 0 ? (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  5S / következő lépések
                </div>
                <ol className="grid gap-2">
                  {result.checklist.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-md border border-border/50 bg-muted/10 px-3 py-2 text-xs"
                    >
                      <div className="font-medium text-slate-200">
                        {c.priority}. {c.title}
                      </div>
                      <div className="mt-0.5 text-muted-foreground">{c.hint}</div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {result && result.vizAdvice.length > 0 ? (
              <div>
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Kimutatás — a helyzetre
                </div>
                <ul className="grid gap-2">
                  {result.vizAdvice.map((v) => (
                    <li key={v.id} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                      <div className="text-sm font-medium text-slate-100">{v.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate-400">{v.why}</div>
                      <div className="mt-0.5 text-[10px] text-slate-500">
                        {LEAN_VIZ_PLAYBOOK[v.kind].labelHu} · {LEAN_VIZ_PLAYBOOK[v.kind].replaces}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="mt-2 h-7 text-[11px]"
                        onClick={() => {
                          acceptVizAdvice(v.kind, v.slot);
                          try {
                            localStorage.setItem(`ui:reveal:${v.slot}`, "1");
                          } catch {
                            /* ignore */
                          }
                        }}
                      >
                        Ezt használom itt
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-md border border-dashed border-slate-600/60 bg-slate-900/40 px-3 py-3 text-[11px] text-muted-foreground">
              A motor a saját eset számaiból tanul: amit elfogadsz, később ugyanilyen helyzetben
              előrébb ajánlja.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Megértettem / Bezárás
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up chooser ("választó oldal") for guided next steps */}
      <Dialog
        open={Boolean(followup)}
        onOpenChange={(v) => {
          if (!v) setFollowup(null);
        }}
      >
        <DialogContent className="max-w-lg border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>Oké — hogyan vigyük végig?</DialogTitle>
            <DialogDescription>
              Válassz egy “segítség fokozatot”. Semmi nem kötelező; bármikor visszavonható/finomítható.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-auto justify-start whitespace-normal break-words py-3 text-left"
              onClick={() => {
                if (!followup) return;
                // A) Enable manual/auto source badges in lists
                setFlag("ui:showTxnSourceBadges", "1");
                accept(followup.ruleId);
                onApplyAdvice?.(followup, { id: "tag_manual_auto" });
                setFollowup(null);
                setOpen(false);
              }}
              title="A listákban jelöljük, mi kézi vs banki forrás — így az admin muda azonnal látszik."
            >
              <div className="grid gap-1">
                <div className="font-medium">A) Kézi / automatikus tételek megjelölése a listákban</div>
                <div className="text-xs text-muted-foreground">
                  Diszkrét jelölés: “✍️ Kézi” vs “💳/↗️/🏛️ Bank”. Cél: lásd, hol folyik el az idő.
                </div>
              </div>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start whitespace-normal break-words py-3 text-left"
              onClick={() => {
                if (!followup) return;
                // B) Prefer import for base capture (soft preference)
                setFlag("ui:preferBankImport", "1");
                // Trigger a short, gentle nudge highlight on the "Banki szinkron" entry point
                setFlag("ui:nudge:bankImport", String(Date.now()));
                accept(followup.ruleId);
                onApplyAdvice?.(followup, { id: "prefer_import" });
                setFollowup(null);
                setOpen(false);
              }}
              title="Nem tiltjuk a kézi rögzítést, csak átállunk 'import-first' szemléletre."
            >
              <div className="grid gap-1">
                <div className="font-medium">B) Alap rögzítés: inkább importtal, kézi csak finomhangolás</div>
                <div className="text-xs text-muted-foreground">
                  Segítek átállni: hol érdemes importálni, és mikor oké kézivel korrigálni.
                </div>
              </div>
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="h-auto justify-start whitespace-normal break-words py-3 text-left"
              onClick={() => {
                if (!followup) return;
                accept(followup.ruleId);
                onApplyAdvice?.(followup, { id: "other" });
                setFollowup(null);
                setOpen(false);
              }}
              title="Csak jelölés + ugrás, később döntesz a konkrét lépésekről."
            >
              <div className="grid gap-1">
                <div className="font-medium">C) Most csak jelöld elfogadottnak + ugorj a megfelelő részhez</div>
                <div className="text-xs text-muted-foreground">Semmi beállítás nem változik, csak vezetlek a következő képernyőre.</div>
              </div>
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setFollowup(null)}>
              Mégse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
