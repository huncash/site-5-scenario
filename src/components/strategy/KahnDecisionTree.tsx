import { useMemo } from "react";

import { DetailFold } from "@/components/lean-viz/CollapsibleCard";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { formatMoney } from "@/lib/finance";
import { kpisNeverEmpty } from "@/lib/bisztroPreview";
import { useKahnPlanPath } from "@/lib/kahnPlanPath";
import { useLeanView } from "@/lib/leanView";
import { penaltyLabel } from "@/lib/simpleLabels";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import { cn } from "@/lib/utils";
import {
  kahnDecisionTree,
  resolveKahnPlanPro,
  type KahnContractId,
  type KahnFinancingId,
  type KahnForkNode,
  type KahnProLive,
  type StrategyTone,
} from "@/lib/strategyCases";

const TONE_LABEL: Record<StrategyTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

function metricOrDash(n: number | null, kind: "runway" | "money" | "monthly"): string {
  const v = kpisNeverEmpty(n);
  if (kind === "runway") return `${v} hó`;
  const money = formatMoney(v, "HUF");
  return kind === "monthly" ? `${money}/hó` : money;
}

function ForkChoice({
  node,
  selected,
  disabled,
  onSelect,
}: {
  node: KahnForkNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
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
        <DetailFold id={`kahn-fork-${node.id}`} text={node.detail} />
      </div>
    </li>
  );
}

function ProLiveCard({ card }: { card: KahnProLive }) {
  const { lean } = useLeanView();
  return (
    <li className={cn("kahn-branch", `kahn-branch-${card.tone}`)}>
      <div className="flex items-center justify-between gap-2">
        <ChartLegendSwatch tone={card.tone} label={TONE_LABEL[card.tone]} line />
        <span className="kahn-branch-chip">{card.label}</span>
      </div>
      <dl className="kahn-pro-metrics">
        <div>
          <dt>Runway</dt>
          <dd>{metricOrDash(card.runwayMonths, "runway")}</dd>
        </div>
        <div>
          <dt>{penaltyLabel(lean)}</dt>
          <dd>{metricOrDash(card.exitPenaltyHuf, "money")}</dd>
        </div>
        <div>
          <dt>Havi teher</dt>
          <dd>{metricOrDash(card.monthlyObligationHuf, "monthly")}</dd>
        </div>
      </dl>
      <DetailFold id={`kahn-pro-${card.tone}`} text={card.strategy} />
    </li>
  );
}

export function KahnDecisionTree() {
  const tree = kahnDecisionTree();
  const { financing, contract, setFinancing, setContract } = useKahnPlanPath();
  const live = useMemo(() => resolveKahnPlanPro(financing, contract), [financing, contract]);
  const loanOn = financing === "loan";
  const organicOn = financing === "organic";

  return (
    <div
      className="kahn-tree"
      role="group"
      aria-label="Bisztró döntési mátrix: finanszírozás, konstrukció, élő PRO kimenet"
    >
      <div className="kahn-root">
        <span className="kahn-root-label">{MASTER_BASELINE_LABEL}</span>
        <span className="kahn-root-name">{tree.root}</span>
      </div>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.financingQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.financing.map((n) => (
          <ForkChoice
            key={n.id}
            node={n}
            selected={financing === n.id}
            onSelect={() => setFinancing(n.id as KahnFinancingId)}
          />
        ))}
      </ul>
      <div className="kahn-stem" aria-hidden />
      <p className={cn("kahn-question", organicOn && "is-muted")}>{tree.contractQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.contracts.map((n) => (
          <ForkChoice
            key={n.id}
            node={n}
            selected={loanOn && contract === n.id}
            disabled={!loanOn}
            onSelect={() => setContract(n.id as KahnContractId)}
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
          <ProLiveCard key={card.tone} card={card} />
        ))}
      </ul>
    </div>
  );
}
