import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import {
  kahnDecisionTree,
  type KahnBranch,
  type KahnForkNode,
  type StrategyTone,
} from "@/lib/strategyCases";

const TONE_LABEL: Record<StrategyTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

function ForkNodeCard({ node }: { node: KahnForkNode }) {
  return (
    <li className={`kahn-node kahn-branch-${node.tone}`}>
      <div className="flex items-center justify-between gap-2">
        <ChartLegendSwatch tone={node.tone} label={TONE_LABEL[node.tone]} line />
        <span className="kahn-branch-chip">{node.label}</span>
      </div>
      <p className="mt-1.5 font-mono text-[11px] tabular-nums text-foreground">{node.amountHint}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{node.detail}</p>
    </li>
  );
}

function BranchCard({ branch }: { branch: KahnBranch }) {
  return (
    <li className={`kahn-branch kahn-branch-${branch.tone}`}>
      <div className="flex items-center justify-between gap-2">
        <ChartLegendSwatch tone={branch.tone} label={TONE_LABEL[branch.tone]} line />
        <span className="kahn-branch-chip">{branch.label}</span>
      </div>
      <p className="mt-2 text-[12px] font-medium text-foreground">{branch.strategy}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{branch.outcome}</p>
    </li>
  );
}

export function KahnDecisionTree() {
  const tree = kahnDecisionTree();
  return (
    <div
      className="kahn-tree"
      role="img"
      aria-label="Kahn-féle stratégiai döntési fa: hitel vagy organikus, A/B szerződés, majd PRO bővítés–tartás–tartalék"
    >
      <div className="kahn-root">
        <span className="kahn-root-label">{MASTER_BASELINE_LABEL}</span>
        <span className="kahn-root-name">{tree.root}</span>
      </div>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-case-lead">{tree.caseLead}</p>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.financingQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.financing.map((n) => (
          <ForkNodeCard key={n.id} node={n} />
        ))}
      </ul>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.contractQuestion}</p>
      <ul className="kahn-nodes kahn-nodes-2">
        {tree.contracts.map((n) => (
          <ForkNodeCard key={n.id} node={n} />
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
        {tree.branches.map((b) => (
          <BranchCard key={b.tone} branch={b} />
        ))}
      </ul>
    </div>
  );
}
