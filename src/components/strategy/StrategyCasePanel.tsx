import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { HelpIcon } from "@/components/HelpIcon";
import { KahnDecisionTree } from "@/components/strategy/KahnDecisionTree";
import { StrategyBranchWalk } from "@/components/strategy/StrategyBranchWalk";
import { formatMoney } from "@/lib/finance";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import {
  isKahnForkSegment,
  isNewLineSegment,
  isStrategySegment,
  strategyCaseById,
  type StrategyCaseId,
  type StrategySignal,
  type StrategyTone,
} from "@/lib/strategyCases";

const TONE_LABEL: Record<StrategyTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

export function StrategyCasePanel(props: {
  segmentId: string | null | undefined;
  signals: StrategySignal[];
  inheritedFrom: string;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
}) {
  if (!isStrategySegment(props.segmentId)) return null;
  const cse = strategyCaseById(props.segmentId as StrategyCaseId);
  const kahn = isKahnForkSegment(props.segmentId);
  const newLine = isNewLineSegment(props.segmentId);
  const phaseHint = kahn
    ? props.phase === "PLAN"
      ? "PLAN: a törzs adott. A fa a döntési csomópontot mutatja — melyik jövőágra kötsz készpénzt."
      : props.phase === "ACT"
        ? "ACT: egy ágat viszel, vagy tartalékot tartasz. A stop-loss a pesszimista ágon van."
        : "CHECK: a három ág PRO mikrojelzése. Nem jóslat — elágazás."
    : props.phase === "PLAN"
      ? "PLAN: a core törzs adott. Itt csak a döntés rétegét mozgatod."
      : props.phase === "ACT"
        ? "ACT: a három pálya beavatkozása — csapda, árrés, kilépés."
        : "CHECK: cash-flow mikrojelzések a három pályán.";

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {kahn ? "Kahn-féle jövőkutató sablon" : "Üzleti és stratégiai tervezés"}
          </p>
          <h3 className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            {cse.title}
            {kahn ? <HelpIcon kbId="kahn-rand" title="Herman Kahn és a RAND" /> : null}
          </h3>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{phaseHint}</p>
        </div>
        <span className="inline-flex items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground">
          {MASTER_BASELINE_LABEL} → {props.inheritedFrom}
        </span>
      </div>
      {newLine ? <StrategyBranchWalk storyId="new-line" /> : null}
      {kahn ? (
        <>
          <StrategyBranchWalk storyId="loan-whatif" />
          <KahnDecisionTree />
        </>
      ) : null}
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {props.signals.map((s) => (
          <li key={s.tone} className="rounded-lg border border-border/50 bg-background/40 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <ChartLegendSwatch tone={s.tone} label={TONE_LABEL[s.tone]} line />
            </div>
            <p className="mt-2 text-[12px] font-medium text-foreground">{s.title}</p>
            <p className="mt-0.5 font-mono text-[13px] tabular-nums text-foreground">{s.metric}</p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function strategyGoalHint(segmentId: string | null | undefined) {
  if (!isStrategySegment(segmentId)) return null;
  return strategyCaseById(segmentId).goalName;
}

export function formatStrategyHuf(n: number) {
  return formatMoney(Math.round(n), "HUF");
}
