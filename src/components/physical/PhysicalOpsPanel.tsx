import { useMemo } from "react";

import { CrisisBranchTimeline } from "@/components/physical/CrisisBranchTimeline";
import { MeshNodeMap } from "@/components/physical/MeshNodeMap";
import { SurvivalGauges } from "@/components/physical/SurvivalGauges";
import { useI18n } from "@/i18n";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import {
  applyCrisisSelections,
  buildPhysicalDashboard,
  type CrisisChoice,
  type SurvivalGauge,
} from "@/lib/physicalMetrics";
import { usePhysicalPlanPath } from "@/lib/physicalPlanPath";

function planGauges(gauges: SurvivalGauge[], prefix: string): SurvivalGauge[] {
  return gauges.map((g) => ({
    ...g,
    remaining: g.target,
    display: `${prefix} ${g.target} ${g.unit}`,
    band: "green",
    hint: g.hint,
  }));
}

export function PhysicalOpsPanel(props: {
  segmentId: string | null | undefined;
  baseline?: MasterBaselineContext | null;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
}) {
  const { t } = useI18n();
  const seed = useMemo(
    () => buildPhysicalDashboard(props.segmentId, props.baseline),
    [props.baseline, props.segmentId],
  );
  const { selected, setChoice } = usePhysicalPlanPath(props.segmentId ?? "");
  const dash = useMemo(() => (seed ? applyCrisisSelections(seed, selected) : seed), [seed, selected]);

  if (!seed || !dash || !dash.gauges.length) return null;

  const onChoose = (forkId: string, choice: CrisisChoice) => {
    setChoice(forkId, choice.id);
  };

  const phase = props.phase ?? "CHECK";
  const bottlenecks = dash.gauges.filter((g) => g.band !== "green");
  const pokaWhy =
    dash.pokaYoke.index > 0
      ? t("panel.pokaBroke", {
          broke: dash.pokaYoke.violations,
          steps: dash.pokaYoke.steps,
          index: dash.pokaYoke.index,
        })
      : t("panel.pokaHold");

  return (
    <div className="grid gap-3">
      {phase === "PLAN" ? (
        <>
          <p className="text-[12px] leading-snug text-muted-foreground">{t("pdca.planFocus")}</p>
          <SurvivalGauges gauges={planGauges(dash.gauges, t("panel.planPrefix"))} />
          <CrisisBranchTimeline forks={dash.forks} selected={selected} onChoose={onChoose} />
        </>
      ) : null}

      {phase === "DO" ? (
        <>
          <p className="text-[12px] leading-snug text-muted-foreground">{t("pdca.doFocus")}</p>
          <SurvivalGauges gauges={dash.gauges} />
          <MeshNodeMap nodes={dash.nodes} edges={dash.edges} comm={dash.comm} />
        </>
      ) : null}

      {phase === "CHECK" ? (
        <>
          <p className="text-[12px] leading-snug text-muted-foreground">{t("pdca.checkFocus")}</p>
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="surv-label-chip">{t("pdca.variance")}</span>
              <span className="surv-value-chip">
                {bottlenecks.length ? `${bottlenecks.length} szűk` : "nincs szűk"}
              </span>
            </div>
            <ul className="mt-2 grid gap-1.5 text-[12px]">
              {dash.gauges.map((g) => (
                <li key={g.id} className="flex items-start justify-between gap-2">
                  <span className="text-foreground">{g.label}</span>
                  <span className={`surv-label-chip surv-${g.band}`}>
                    {g.display} / terv {g.target} {g.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {bottlenecks.length ? (
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <span className="surv-label-chip">{t("pdca.bottleneck")}</span>
              <ul className="mt-2 grid gap-1 text-[12px] text-muted-foreground">
                {bottlenecks.map((g) => (
                  <li key={g.id}>
                    {g.label}: {g.hint}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="surv-label-chip">Poka-Yoke / hibaindex</span>
              <span className="surv-value-chip">
                {dash.pokaYoke.index}% · {dash.pokaYoke.violations}/{dash.pokaYoke.steps}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-snug text-muted-foreground">{pokaWhy}</p>
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
        </>
      ) : null}

      {phase === "ACT" ? (
        <>
          <p className="text-[12px] leading-snug text-muted-foreground">{t("pdca.actFocus")}</p>
          <CrisisBranchTimeline forks={dash.forks} selected={selected} onChoose={onChoose} />
          <div className="rounded-xl border border-border/60 bg-background/40 p-3">
            <span className="surv-label-chip">{t("pdca.protocol")}</span>
            <ul className="mt-2 grid gap-1.5 text-[12px] text-muted-foreground">
              {dash.pokaYoke.events
                .filter((e) => e.violated)
                .map((e) => (
                  <li key={e.step}>
                    SMED / Poka-Yoke: {e.label} — következő iteráció standardja.
                  </li>
                ))}
              {dash.pokaYoke.events.every((e) => !e.violated) ? (
                <li>A tartott lépések mennek tovább standardként. Új sértés nincs.</li>
              ) : null}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
