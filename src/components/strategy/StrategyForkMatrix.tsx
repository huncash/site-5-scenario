import { useMemo } from "react";

import { DetailFold } from "@/components/lean-viz/CollapsibleCard";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { formatMoney } from "@/lib/finance";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import { useStrategyPlanPath } from "@/lib/strategyPlanPath";
import {
  resolveStrategyForkPro,
  strategyForkTree,
  type StrategyForkKind,
} from "@/lib/strategyForks";
import { cn } from "@/lib/utils";
import type { KahnForkNode, KahnProLive, StrategyTone } from "@/lib/strategyCases";

const TONE_LABEL: Record<StrategyTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

function metricOrDash(n: number | null, kind: "runway" | "money" | "pct" | "monthly"): string {
  if (n == null) return "—";
  if (kind === "runway") return `${n} hó`;
  if (kind === "pct") return `${n}%`;
  const money = formatMoney(n, "HUF");
  return kind === "monthly" ? `${money}/hó` : money;
}

function ForkChoice({
  node,
  selected,
  disabled,
  onSelect,
  foldId,
}: {
  node: KahnForkNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  foldId: string;
}) {
  return (
    <li>
      <div className={cn("kahn-node", `kahn-branch-${node.tone}`, selected && "is-on", disabled && "is-off")}>
        <button
          type="button"
          className="kahn-pick"
          aria-pressed={selected}
          disabled={disabled}
          onClick={onSelect}
        >
          <div className="flex items-center justify-between gap-2">
            <ChartLegendSwatch tone={node.tone} label={TONE_LABEL[node.tone]} line />
            <span className="kahn-branch-chip">{node.label}</span>
          </div>
          <p className="mt-1.5 font-mono text-[11px] tabular-nums text-[var(--text-main)]">{node.amountHint}</p>
        </button>
        <DetailFold id={foldId} text={node.detail} />
      </div>
    </li>
  );
}

function ProLiveCard({
  card,
  labels,
  midKind,
  foldId,
}: {
  card: KahnProLive;
  labels: [string, string, string];
  midKind: "money" | "pct";
  foldId: string;
}) {
  return (
    <li className={cn("kahn-branch", `kahn-branch-${card.tone}`)}>
      <div className="flex items-center justify-between gap-2">
        <ChartLegendSwatch tone={card.tone} label={TONE_LABEL[card.tone]} line />
        <span className="kahn-branch-chip">{card.label}</span>
      </div>
      <dl className="kahn-pro-metrics">
        <div>
          <dt>{labels[0]}</dt>
          <dd>{metricOrDash(card.runwayMonths, "runway")}</dd>
        </div>
        <div>
          <dt>{labels[1]}</dt>
          <dd>{metricOrDash(card.exitPenaltyHuf, midKind)}</dd>
        </div>
        <div>
          <dt>{labels[2]}</dt>
          <dd>{metricOrDash(card.monthlyObligationHuf, "monthly")}</dd>
        </div>
      </dl>
      <DetailFold id={foldId} text={card.strategy} />
    </li>
  );
}

export function StrategyForkMatrix(props: { kind: StrategyForkKind; caseId: string }) {
  const tree = strategyForkTree(props.kind);
  const { primary, secondary, setPrimary, setSecondary } = useStrategyPlanPath(props.caseId);
  const live = useMemo(
    () => resolveStrategyForkPro(props.kind, primary, secondary),
    [props.kind, primary, secondary],
  );
  const secondOn = primary === tree.secondaryNeeds;
  const midKind = props.kind === "inflation" ? "pct" : "money";

  return (
    <div className="kahn-tree" role="group" aria-label="Döntési mátrix: elágazás és élő PRO kimenet">
      <div className="kahn-root">
        <span className="kahn-root-label">{MASTER_BASELINE_LABEL}</span>
        <span className="kahn-root-name">{tree.root}</span>
      </div>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.primaryQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.primary.map((n) => (
          <ForkChoice
            key={n.id}
            node={n}
            selected={primary === n.id}
            onSelect={() => setPrimary(n.id)}
            foldId={`fork-${props.caseId}-p-${n.id}`}
          />
        ))}
      </ul>
      <div className="kahn-stem" aria-hidden />
      <p className={cn("kahn-question", !secondOn && "is-muted")}>{tree.secondaryQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.secondary.map((n) => (
          <ForkChoice
            key={n.id}
            node={n}
            selected={secondOn && secondary === n.id}
            disabled={!secondOn}
            onSelect={() => setSecondary(n.id)}
            foldId={`fork-${props.caseId}-s-${n.id}`}
          />
        ))}
      </ul>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.outcomeQuestion}</p>
      <div className="kahn-fork" aria-hidden>
        <span className="kahn-fork-arm" />
        <span className="kahn-fork-arm kahn-fork-arm-mid" />
        <span className="kahn-fork-arm" />
      </div>
      <ul className="kahn-branches">
        {live.map((card) => (
          <ProLiveCard
            key={card.tone}
            card={card}
            labels={tree.metricLabels}
            midKind={midKind}
            foldId={`fork-${props.caseId}-pro-${card.tone}`}
          />
        ))}
      </ul>
    </div>
  );
}
