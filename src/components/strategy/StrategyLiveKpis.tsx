import { useMemo } from "react";

import { LeanTerm } from "@/components/HelpIcon";
import { BulletGraph } from "@/components/lean-viz/LeanCharts";
import { formatMoney } from "@/lib/finance";
import { resolveStrategyForkPro, strategyForkTree, type StrategyForkKind } from "@/lib/strategyForks";
import { useStrategyPlanPath } from "@/lib/strategyPlanPath";

const ink = "text-[var(--text-main)]";
const inkMuted = "text-[var(--text-muted)]";

function dash(n: number | null, kind: "runway" | "money" | "pct" | "monthly"): string {
  if (n == null) return "—";
  if (kind === "runway") return `${n} hó`;
  if (kind === "pct") return `${n}%`;
  const money = formatMoney(n, "HUF");
  return kind === "monthly" ? `${money}/hó` : money;
}

export function StrategyLiveKpis(props: { kind: StrategyForkKind; caseId: string }) {
  const tree = strategyForkTree(props.kind);
  const { primary, secondary } = useStrategyPlanPath(props.caseId);
  const live = useMemo(
    () => resolveStrategyForkPro(props.kind, primary, secondary),
    [props.kind, primary, secondary],
  );
  const pess = live.find((c) => c.tone === "pess")!;
  const midKind = props.kind === "inflation" ? "pct" : "money";

  return (
    <>
      <div className="grid grid-cols-1 gap-2 min-w-0 lg:grid-cols-3">
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title={tree.metricLabels[0]}
            exact="A pesszimista sáv tartalékideje a választott ágon."
            summary="A pesszimista sáv tartalékideje a választott ágon."
          >
            {tree.metricLabels[0]}
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>{dash(pess.runwayMonths, "runway")}</div>
        </div>
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title={tree.metricLabels[1]}
            exact="A pesszimista sáv középső mutatója a választott ágon."
            summary="A pesszimista sáv középső mutatója a választott ágon."
          >
            {tree.metricLabels[1]}
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>{dash(pess.exitPenaltyHuf, midKind)}</div>
        </div>
        <div className="tile-lift rounded-lg bg-background p-2.5">
          <LeanTerm
            className={`kpi-label text-[10px] uppercase tracking-wide ${inkMuted}`}
            title={tree.metricLabels[2]}
            exact="A pesszimista sáv havi terhe a választott ágon."
            summary="A pesszimista sáv havi terhe a választott ágon."
          >
            {tree.metricLabels[2]}
          </LeanTerm>
          <div className={`kpi-value mt-1 font-mono text-sm ${ink}`}>{dash(pess.monthlyObligationHuf, "monthly")}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <BulletGraph
          item={{
            id: `${props.caseId}-runway`,
            label: "Tartalékidő a 4 hónapos küszöbhöz",
            actual: pess.runwayMonths ?? 0,
            target: 4,
            unit: "hó",
            hint: "Rosszabb kimenet runwaye a választott ágon.",
          }}
        />
        <BulletGraph
          item={{
            id: `${props.caseId}-mid`,
            label: tree.metricLabels[1],
            actual: pess.exitPenaltyHuf ?? 0,
            target: midKind === "pct" ? 12 : Math.max(1, pess.exitPenaltyHuf ?? 1),
            unit: midKind === "pct" ? "%" : "Ft",
            hint: "A pesszimista sáv középső mutatója.",
          }}
        />
      </div>
    </>
  );
}
