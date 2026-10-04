import { useMemo, useState } from "react";

import { caseTitle, useI18n } from "@/i18n";
import { HelpIcon } from "@/components/HelpIcon";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { HospitalTriageSim } from "@/components/industry/HospitalTriageSim";
import { PhysicalOpsPanel } from "@/components/physical/PhysicalOpsPanel";
import { chooseAt, formatNarrativeCash, type NarrativeTone } from "@/lib/strategyNarrative";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import {
  buildIndustryWhatIf,
  industryCaseById,
  industryWalk,
  isIndustrySegment,
  resolveIndustryWalk,
  walkedIndustry,
  type IndustryCaseId,
  type IndustrySignal,
} from "@/lib/industryCases";

function Walk({ kind }: { kind: Exclude<ReturnType<typeof industryCaseById>["kind"], "hospital"> }) {
  const { t } = useI18n();
  const TONE_LABEL: Record<NarrativeTone, string> = {
    opt: t("dash.optimistic"),
    real: t("brand.real"),
    pess: t("dash.pessimistic"),
  };
  const story = useMemo(() => industryWalk(kind), [kind]);
  const [path, setPath] = useState<string[]>([]);
  if (!story) return null;
  const steps = walkedIndustry(story, path);
  const climax = resolveIndustryWalk(kind, path);
  const terminal = steps.length > 0 && steps.every((s) => s.picked) && !steps[steps.length - 1]!.picked?.next;

  return (
    <div className="narr-walk">
      <div className="narr-walk-head">
        <span className="surv-label-chip">{story.title}</span>
        <button type="button" className="narr-reset" onClick={() => setPath([])} disabled={path.length === 0}>
          {t("panel.newThread")}
        </button>
      </div>
      <ol className="crisis-tl">
        {steps.map(({ step, picked }, idx) => (
          <li key={step.id} className="crisis-tl-fork">
            <p className="crisis-tl-q">{step.question}</p>
            <ul className="crisis-tl-choices">
              {step.choices.map((c) => {
                const on = picked?.id === c.id;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`crisis-tl-btn crisis-tl-${c.tone}${on ? " is-on" : ""}`}
                      aria-pressed={on}
                      onClick={() => setPath(chooseAt(path, idx, c.id))}
                    >
                      <span className="crisis-tl-btn-head">
                        <ChartLegendSwatch tone={c.tone} label={TONE_LABEL[c.tone]} line />
                        <span className="surv-label-chip">{c.label}</span>
                      </span>
                      <span className="crisis-tl-effect">{c.lead}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
      <aside className={`narr-climax narr-climax-${climax.tone}`}>
        <div className="narr-climax-head">
          <span className="surv-label-chip">{terminal ? t("panel.terminal") : t("panel.live")}</span>
          <span className={`surv-value-chip narr-tone-${climax.tone}`}>{climax.title}</span>
        </div>
        <dl className="narr-climax-metrics">
          <div>
            <dt>{t("panel.cashBind")}</dt>
            <dd>{formatNarrativeCash(climax.cashHuf)}</dd>
          </div>
          <div>
            <dt>{t("panel.runway")}</dt>
            <dd>
              {climax.runwayMonths} {t("panel.monthShort")}
            </dd>
          </div>
          <div>
            <dt>{t("panel.payback")}</dt>
            <dd>{climax.beMonth == null ? t("panel.beyondHorizon") : t("panel.monthN", { n: climax.beMonth })}</dd>
          </div>
        </dl>
        <p className="narr-climax-lock">{climax.lockIn}</p>
        <p className="narr-climax-wow">{climax.wow}</p>
      </aside>
    </div>
  );
}

function SignalCards({ signals }: { signals: IndustrySignal[] }) {
  const { t } = useI18n();
  const TONE_LABEL: Record<NarrativeTone, string> = {
    opt: t("dash.optimistic"),
    real: t("brand.real"),
    pess: t("dash.pessimistic"),
  };
  if (!signals.length) return null;
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 min-w-0 lg:grid-cols-3">
      {signals.map((s) => (
        <li key={s.tone} className="min-w-0 rounded-lg border border-border/50 bg-background/40 p-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ChartLegendSwatch tone={s.tone} label={TONE_LABEL[s.tone]} line />
          </div>
          <p className="mt-2 text-[12px] font-medium text-foreground break-words">{s.title}</p>
          <p className="mt-0.5 min-w-[4.5rem] font-mono text-[13px] tabular-nums text-foreground">{s.metric}</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground break-words">{s.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export function IndustryCasePanel(props: {
  segmentId: string | null | undefined;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
  baseline?: MasterBaselineContext | null;
}) {
  const { locale, t } = useI18n();
  if (!isIndustrySegment(props.segmentId)) return null;
  const cse = industryCaseById(props.segmentId as IndustryCaseId);
  const whatIf = buildIndustryWhatIf({ caseId: cse.id, horizonMonths: 12 });
  const phaseHint =
    props.phase === "PLAN"
      ? t("panel.industryPlan")
      : props.phase === "DO"
        ? t("panel.industryDo")
        : props.phase === "ACT"
          ? t("panel.industryAct")
          : t("panel.industryCheck");

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {cse.door === "healthcare"
            ? t("panel.doorHealthcare")
            : cse.door === "manufacturing"
              ? t("panel.doorManufacturing")
              : cse.door === "logistics"
                ? t("panel.doorLogistics")
                : t("panel.doorServices")}
          {cse.kind === "saas" || cse.kind === "supply" || cse.kind === "wms" || cse.kind === "fuel" ? (
            <HelpIcon kbId="lesson-bcp" title={t("panel.lesson")} />
          ) : null}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-foreground">{caseTitle(cse.id, locale) ?? cse.title}</h3>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{phaseHint}</p>
      </div>
      <div className="mt-3 grid gap-3">
        {props.phase === "DO" ? cse.kind === "hospital" ? <HospitalTriageSim /> : <Walk kind={cse.kind} /> : null}
        {cse.kind !== "tax" && cse.kind !== "fuel" ? (
          <PhysicalOpsPanel segmentId={props.segmentId} baseline={props.baseline} phase={props.phase} />
        ) : null}
        {whatIf && (props.phase === "CHECK" || props.phase === "ACT") ? <SignalCards signals={whatIf.signals} /> : null}
      </div>
    </section>
  );
}
