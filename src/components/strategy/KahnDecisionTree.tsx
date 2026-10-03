import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { MASTER_BASELINE_LABEL } from "@/lib/masterBaseline";
import {
  kahnDecisionTree,
  type KahnBranch,
  type StrategyTone,
} from "@/lib/strategyCases";

const TONE_LABEL: Record<StrategyTone, string> = {
  opt: "Optimista",
  real: "Realista",
  pess: "Pesszimista",
};

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
    <div className="kahn-tree" role="img" aria-label="Kahn-féle stratégiai döntési fa: bővítés, tartás, tartalék">
      <div className="kahn-root">
        <span className="kahn-root-label">{MASTER_BASELINE_LABEL}</span>
        <span className="kahn-root-name">{tree.root}</span>
      </div>
      <div className="kahn-stem" aria-hidden />
      <p className="kahn-question">{tree.question}</p>
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
