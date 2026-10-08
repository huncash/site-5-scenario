import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/i18n/currency";
import {
  clearEngineInterest,
  emptyInterest,
  engineInterestQueryKey,
  readEngineInterest,
} from "@/lib/engineInterest";
import { labsEngineQueryKey } from "@/lib/labsEngines";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { buildEnginePackProposal } from "@/lib/private/enginePackProposal";

const EMPTY = {
  economic: emptyInterest("economic"),
  resilience: emptyInterest("resilience"),
  education: emptyInterest("education"),
};

export function EngineInterestPanel(props: {
  y1: number;
  installmentSharePct: number;
  attachRatePct: number;
}) {
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: engineInterestQueryKey(),
    queryFn: () => readEngineInterest(repo),
    placeholderData: EMPTY,
  });
  const reset = useMutation({
    mutationFn: () => clearEngineInterest(repo),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: engineInterestQueryKey() });
      void qc.invalidateQueries({ queryKey: labsEngineQueryKey() });
    },
  });

  const proposal = buildEnginePackProposal(q.data ?? EMPTY, {
    y1: props.y1,
    installmentShare: props.installmentSharePct / 100,
    attachRate: props.attachRatePct / 100,
  });
  const p = proposal.projection;

  return (
    <section id="engine-interest" className="scroll-mt-24 space-y-4 border-t border-border/60 pt-8">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Piacfelmérés — helyi, anonim
        </div>
        <h2 className="mt-1 text-lg font-semibold leading-snug">
          Motor-érdeklődés → Opció A / Opció B
        </h2>
        <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
          Csak ezen a gépen. Nincs hálózat, nincs azonosító. Súly: indítás ×3, váltás ×2, kattintás ×1.
          A konverzió és a 36 hónapos bruttó csak a két pillért méri: örök + 1 év frissítés (egyszeri
          vagy 2×60 nap), plusz opcionális Y2+ éves csomag. Nincs havi előfizetés.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Irány</TableHead>
              <TableHead className="text-right">Kattintás</TableHead>
              <TableHead className="text-right">Indítás</TableHead>
              <TableHead className="text-right">Váltás</TableHead>
              <TableHead className="text-right">Pont</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposal.ranking.map((row) => (
              <TableRow key={row.engine}>
                <TableCell className="font-medium">
                  {row.label}
                  {proposal.leader === row.engine && proposal.sampleSize > 0 ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-amber-300/90">
                      vezető
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.clicks}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.starts}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.switches}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{row.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-border/60 bg-card/40 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground">Becsült Opció A licenc</div>
          <div className="mt-0.5 font-mono text-[15px] tabular-nums">{p.licenses}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">indítás ×1 · váltás ×0,25 · kattintás ×0,08</div>
        </article>
        <article className="rounded-xl border border-amber-500/25 bg-card/40 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground">Opció A · Y1 bruttó</div>
          <div className="mt-0.5 font-mono text-[15px] tabular-nums">{formatCurrency(Math.round(p.optionARevenue))}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            most {formatCurrency(Math.round(p.optionACashMonth1))} · 60 nap{" "}
            {formatCurrency(Math.round(p.optionACashDay60))}
          </div>
        </article>
        <article className="rounded-xl border border-sky-500/25 bg-card/40 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground">Opció B · Y2+ (36 hó)</div>
          <div className="mt-0.5 font-mono text-[15px] tabular-nums">
            {formatCurrency(Math.round(p.optionBRevenue36m))}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            csatlakozás {Math.round(p.optionBAttachRate * 100)}% · Y2 {formatCurrency(p.optionBY2)} · Y3{" "}
            {formatCurrency(p.optionBY3)}
          </div>
        </article>
        <article className="rounded-xl border border-emerald-500/25 bg-card/40 px-3 py-2.5">
          <div className="text-[11px] text-muted-foreground">Két pillér · 36 hó bruttó</div>
          <div className="mt-0.5 font-mono text-[15px] tabular-nums">
            {formatCurrency(Math.round(p.total36mGross))}
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">A + B, CAC nélkül · a csúszkákkal szinkron</div>
        </article>
      </div>

      <article className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
        <strong className="text-amber-200/90">Javaslat (lektorálás):</strong> {proposal.copyHu}
      </article>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void q.refetch()}>
          Frissítés
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={reset.isPending}
          onClick={() => reset.mutate()}
        >
          Számlálók nullázása
        </Button>
      </div>
    </section>
  );
}
