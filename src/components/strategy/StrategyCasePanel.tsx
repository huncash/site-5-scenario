import { caseTitle, useI18n } from "@/i18n";
import { CollapsibleCard, DetailFold } from "@/components/lean-viz/CollapsibleCard";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { HelpIcon } from "@/components/HelpIcon";
import { KahnDecisionTree } from "@/components/strategy/KahnDecisionTree";
import { StrategyForkMatrix } from "@/components/strategy/StrategyForkMatrix";
import { formatMoney } from "@/lib/finance";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import { strategyForkKindOf } from "@/lib/strategyForks";
import {
  isKahnForkSegment,
  isStrategySegment,
  strategyCaseById,
  type StrategyCaseId,
  type StrategySignal,
  type StrategyTone,
} from "@/lib/strategyCases";

export function StrategyCasePanel(props: {
  segmentId: string | null | undefined;
  signals: StrategySignal[];
  inheritedFrom: string;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
}) {
  const { t, locale } = useI18n();
  if (!isStrategySegment(props.segmentId)) return null;
  const cse = strategyCaseById(props.segmentId as StrategyCaseId);
  const TONE_LABEL: Record<StrategyTone, string> = {
    opt: t("dash.optimistic"),
    real: t("brand.real"),
    pess: t("dash.pessimistic"),
  };
  const kahn = isKahnForkSegment(props.segmentId);
  const forkKind = strategyForkKindOf(props.segmentId);
  const showTree = Boolean((kahn || forkKind) && props.phase === "PLAN");
  const phaseHint = kahn
    ? props.phase === "PLAN"
      ? t("panel.kahnPlan")
      : props.phase === "ACT"
        ? t("panel.kahnAct")
        : t("panel.kahnCheck")
    : props.phase === "PLAN"
      ? t("panel.stratPlan")
      : props.phase === "ACT"
        ? t("panel.stratAct")
        : t("panel.stratCheck");

  return (
    <CollapsibleCard
      id={`strategy-${props.phase ?? "check"}`}
      defaultOpen={showTree}
      className="rounded-xl border border-border/60 bg-card/80 p-3"
      title={
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {kahn ? t("panel.kahnTitle") : t("panel.stratTitle")}
          </span>
          <span className="mt-0.5 inline-flex flex-wrap items-center gap-1 text-sm font-semibold text-[var(--text-main)]">
            {caseTitle(cse.id, locale) ?? cse.title}
            {kahn ? <HelpIcon kbId="lesson-kahn" title={t("panel.kahnHelp")} /> : null}
          </span>
        </span>
      }
      headerRight={
        <span className="inline-flex max-w-full min-w-[8rem] flex-wrap items-center rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-[var(--text-main)] break-words">
          {kahn ? `Működő üzem → ${props.inheritedFrom}` : `${MASTER_BASELINE_LABEL} → ${props.inheritedFrom}`}
        </span>
      }
    >
      {showTree ? null : (
        <p className="text-[12px] leading-snug text-[var(--text-main)] break-words">{phaseHint}</p>
      )}
      {kahn && showTree ? <KahnDecisionTree /> : null}
      {forkKind && showTree ? <StrategyForkMatrix kind={forkKind} caseId={cse.id} /> : null}
      {!showTree && !kahn && !forkKind && (props.phase === "CHECK" || props.phase === "ACT") && props.signals.length ? (
        <ul className="mt-3 grid grid-cols-1 gap-2 min-w-0 lg:grid-cols-3">
          {props.signals.map((s) => (
            <li key={s.tone} className="min-w-0 rounded-lg border border-border/50 bg-background p-2.5">
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <ChartLegendSwatch tone={s.tone} label={TONE_LABEL[s.tone]} line />
              </div>
              <p className="mt-2 text-[12px] font-medium text-[var(--text-main)] break-words">{s.title}</p>
              <p className="mt-0.5 min-w-[4.5rem] font-mono text-[13px] tabular-nums text-[var(--text-main)]">{s.metric}</p>
              <DetailFold id={`strategy-sig-${props.phase}-${s.tone}`} text={s.detail} />
            </li>
          ))}
        </ul>
      ) : null}
    </CollapsibleCard>
  );
}

export function strategyGoalHint(segmentId: string | null | undefined) {
  if (!isStrategySegment(segmentId)) return null;
  return strategyCaseById(segmentId).goalName;
}

export function formatStrategyHuf(n: number) {
  return formatMoney(Math.round(n), "HUF");
}
