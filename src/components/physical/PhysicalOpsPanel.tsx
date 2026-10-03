import { useEffect, useMemo, useState } from "react";

import { CrisisBranchTimeline } from "@/components/physical/CrisisBranchTimeline";
import { MeshNodeMap } from "@/components/physical/MeshNodeMap";
import { SurvivalGauges } from "@/components/physical/SurvivalGauges";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import {
  applyCrisisChoice,
  buildPhysicalDashboard,
  type CrisisChoice,
} from "@/lib/physicalMetrics";

export function PhysicalOpsPanel(props: {
  segmentId: string | null | undefined;
  baseline?: MasterBaselineContext | null;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
}) {
  const seed = useMemo(
    () => buildPhysicalDashboard(props.segmentId, props.baseline),
    [props.baseline, props.segmentId],
  );
  const [dash, setDash] = useState(seed);
  const [selected, setSelected] = useState<Record<string, string>>({});

  useEffect(() => {
    setDash(seed);
    setSelected({});
  }, [seed]);

  if (!seed || !dash || !dash.gauges.length) return null;

  const onChoose = (forkId: string, choice: CrisisChoice) => {
    setSelected((s) => ({ ...s, [forkId]: choice.id }));
    setDash(applyCrisisChoice(seed, choice));
  };

  const phase = props.phase ?? "CHECK";
  const showGauges = true;
  const showMap = phase === "DO" || phase === "CHECK";
  const showTree = phase === "PLAN" || phase === "ACT";
  const showPoka = phase === "CHECK" || phase === "ACT";

  return (
    <div className="grid gap-3">
      {showGauges ? <SurvivalGauges gauges={dash.gauges} /> : null}
      {showMap ? <MeshNodeMap nodes={dash.nodes} edges={dash.edges} comm={dash.comm} /> : null}
      {showTree ? <CrisisBranchTimeline forks={dash.forks} selected={selected} onChoose={onChoose} /> : null}
      {showPoka ? (
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="surv-label-chip">Poka-Yoke / hibaindex</span>
            <span className="surv-value-chip">{dash.pokaYoke.index}% · {dash.pokaYoke.violations}/{dash.pokaYoke.steps}</span>
          </div>
          <ul className="mt-2 grid gap-1 text-[12px]">
            {dash.pokaYoke.events.map((e) => (
              <li key={e.step} className="flex items-start justify-between gap-2">
                <span className="text-foreground">
                  {e.step}. {e.label}
                </span>
                <span className={`surv-label-chip ${e.violated ? "surv-red" : "surv-green"}`}>
                  {e.violated ? "sértés" : "tartja"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
