import { AlertCircle, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";

import { LeanTerm } from "@/components/HelpIcon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LeanNavigateTarget, LeanRecommendation, LeanRecommendationType } from "@/hooks/useLeanRecommendations";
import { LeanProofPopover } from "@/components/LeanProofPopover";

const TYPE_META: Record<
  LeanRecommendationType,
  { label: string; icon: typeof AlertTriangle; badgeCls: string; borderCls: string }
> = {
  CRITICAL: {
    label: "CRITICAL",
    icon: AlertTriangle,
    badgeCls: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    borderCls: "border-rose-500/40",
  },
  WARNING: {
    label: "WARNING",
    icon: AlertCircle,
    badgeCls: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    borderCls: "border-amber-500/40",
  },
  OPTIMIZATION: {
    label: "OPTIMIZATION",
    icon: Lightbulb,
    badgeCls: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    borderCls: "border-sky-500/40",
  },
  SUCCESS: {
    label: "SUCCESS",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    borderCls: "border-emerald-500/40",
  },
};

export function ActRecommendations({
  recommendations,
  onExecute,
  emptyHint = "Nincs kritikus eltérés a CHECK jelekből — tartsd a fókuszt a tiszta adatokon és a célhoz kötésen.",
}: {
  recommendations: LeanRecommendation[];
  onExecute: (rec: LeanRecommendation) => void;
  emptyHint?: string;
}) {
  return (
    <div className="card-module flex flex-col rounded-lg border border-border/60 bg-slate-900/40 p-3">
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <LeanTerm
          className="text-sm font-medium text-slate-200"
          title="Smart Recommender"
          exact="okostanácsadó — javaslatok az ellenőrzés jeleiből: kintlévőség, keret, extra költés. Nem parancs."
        >
          Smart Recommender
        </LeanTerm>
        <Badge variant="secondary" className="w-fit text-[10px] text-muted-foreground">
          CHECK → ACT · LEAN_SPEC
        </Badge>
      </div>
      <div className="mt-1 shrink-0 text-[11px] text-muted-foreground">
        Automatikus javaslatok: kintlévőség, büdzsé, logisztika, passzív költségek.
      </div>

      <div className="card-scroll-body mt-2 grid gap-2">
        {recommendations.length === 0 ? (
          <div className="rounded-md border border-slate-800/70 bg-black/20 p-3 text-xs text-slate-300">
            {emptyHint}
          </div>
        ) : (
          recommendations.map((r) => {
            const meta = TYPE_META[r.type];
            const Icon = meta.icon;
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-md border bg-black/20 p-2.5 transition-all duration-200 hover:bg-slate-900/40",
                  meta.borderCls,
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px]", meta.badgeCls)}>
                        <Icon className="mr-1 h-3 w-3" />
                        {meta.label}
                      </Badge>
                      <LeanProofPopover proof={r.proof ?? null} />
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-slate-100">{r.title}</div>
                    <div className="mt-1 text-xs text-slate-300">
                      <span className="text-muted-foreground">Javasolt akció:</span> {r.action}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      <span className="text-slate-500">Várható hatás:</span> {r.impact}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full shrink-0 sm:w-auto"
                    onClick={() => onExecute(r)}
                    title={r.navigateTo ? `Ugrás: ${r.navigateTo}` : r.ctaLabel}
                  >
                    {r.ctaLabel}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export type { LeanNavigateTarget };
