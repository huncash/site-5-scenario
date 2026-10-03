import { caseTitle, useI18n } from "@/i18n";
import { CampusAllocationSim } from "@/components/education/CampusAllocationSim";
import { HelpIcon } from "@/components/HelpIcon";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { PhysicalOpsPanel } from "@/components/physical/PhysicalOpsPanel";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";
import {
  buildEducationModel,
  isEducationSegment,
  type EducationCaseId,
  type EducationKpi,
  type EducationModel,
  type EducationPoint,
} from "@/lib/educationCases";
import { buildPhysicalDashboard } from "@/lib/physicalMetrics";

function formatMetric(n: number, unit: string) {
  const digits = unit === "nap" || n < 10 ? 1 : 0;
  return `${n.toLocaleString("hu-HU", { maximumFractionDigits: digits })} ${unit}`;
}

function MixChart({ points, unit, label }: { points: EducationPoint[]; unit: string; label: string }) {
  const { t } = useI18n();
  if (points.length < 2) return null;
  const w = 360;
  const h = 140;
  const padL = 40;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const ys = points.flatMap((p) => [p.opt, p.real, p.pess]);
  const yMin = Math.min(0, ...ys);
  const yMax = Math.max(1, ...ys);
  const span = Math.max(1, yMax - yMin);
  const x0 = points[0]!.t;
  const x1 = points[points.length - 1]!.t;
  const toX = (t: number) => padL + ((t - x0) / Math.max(1, x1 - x0)) * (w - padL - padR);
  const toY = (v: number) => padT + (1 - (v - yMin) / span) * (h - padT - padB);
  const path = (key: "opt" | "real" | "pess") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.t).toFixed(1)},${toY(p[key]).toFixed(1)}`).join(" ");
  const ticks = points.filter((_, i) => i === 0 || i === points.length - 1 || i % Math.ceil(points.length / 4) === 0);
  const labelBg = "var(--card-bg)";

  return (
    <figure className="rounded-xl border border-border/60 bg-card/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-36 w-full" role="img" aria-label={label}>
        {ticks.map((p) => (
          <g key={p.t}>
            <line x1={toX(p.t)} x2={toX(p.t)} y1={padT} y2={h - padB} stroke="currentColor" strokeOpacity="0.12" />
            <text x={toX(p.t)} y={h - 6} textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.65">
              {p.t}
            </text>
          </g>
        ))}
        <text x={6} y={padT + 8} fill="currentColor" fontSize="9" opacity="0.65">
          {unit}
        </text>
        <path d={path("pess")} fill="none" className={PRO_LINE_CLASS.pess} stroke={PRO_PESS} strokeWidth="2.2" />
        <path d={path("real")} fill="none" className={PRO_LINE_CLASS.real} stroke={PRO_REAL} strokeWidth="2.2" />
        <path d={path("opt")} fill="none" className={PRO_LINE_CLASS.opt} stroke={PRO_OPT} strokeWidth="2.2" />
        <rect x={padL - 2} y={toY(yMax) - 8} width="36" height="12" rx="2" fill={labelBg} />
        <text x={padL} y={toY(yMax) + 2} fill="currentColor" fontSize="9">
          {Math.round(yMax)}
        </text>
      </svg>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li>
          <ChartLegendSwatch tone="opt" label={t("dash.optimistic")} line />
        </li>
        <li>
          <ChartLegendSwatch tone="real" label={t("brand.real")} line />
        </li>
        <li>
          <ChartLegendSwatch tone="pess" label={t("dash.pessimistic")} line />
        </li>
      </ul>
    </figure>
  );
}

function KpiTrio({ kpis }: { kpis: EducationKpi[] }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {kpis.map((k) => (
        <div key={k.id} className="rounded-lg border border-border/50 bg-background/40 p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/80">
            {k.family === "finance"
              ? t("panel.familyFinance")
              : k.family === "lean"
                ? t("panel.familyLean")
                : k.family === "energy"
                  ? t("panel.familyEnergy")
                  : t("panel.familyTime")}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{k.hint}</p>
          <dl className="mt-2 grid gap-1 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <ChartLegendSwatch tone="opt" label="Opt" line />
              <span className="font-mono tabular-nums">{formatMetric(k.opt, k.unit)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <ChartLegendSwatch tone="real" label="Real" line />
              <span className="font-mono tabular-nums">{formatMetric(k.real, k.unit)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <ChartLegendSwatch tone="pess" label="Pess" line />
              <span className="font-mono tabular-nums">{formatMetric(k.pess, k.unit)}</span>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

export function EducationCasePanel(props: {
  segmentId: string | null | undefined;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
  model?: EducationModel | null;
  baseline?: MasterBaselineContext | null;
}) {
  const { locale, t } = useI18n();
  if (!isEducationSegment(props.segmentId)) return null;
  const model = props.model ?? buildEducationModel(props.segmentId as EducationCaseId);
  const physical = buildPhysicalDashboard(props.segmentId, props.baseline);
  const startup = model.kind === "startup";
  const phaseHint = startup
    ? props.phase === "PLAN"
      ? t("panel.eduStartupPlan")
      : props.phase === "DO"
        ? t("panel.eduStartupDo")
        : props.phase === "ACT"
          ? t("panel.eduStartupAct")
          : t("panel.eduStartupCheck")
    : props.phase === "PLAN"
      ? t("panel.eduOtherPlan")
      : props.phase === "DO"
        ? t("panel.eduOtherDo")
        : props.phase === "ACT"
          ? t("panel.eduOtherAct")
          : t("panel.eduOtherCheck");

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("panel.eduTitle")}
          {model.kind === "campus" || model.kind === "cyber" ? (
            <HelpIcon kbId="lesson-campus" title={t("panel.lesson")} />
          ) : null}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-foreground">{caseTitle(props.segmentId, locale) ?? model.title}</h3>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{phaseHint}</p>
      </div>
      <div className="mt-3 grid gap-3">
        {physical ? (
          <PhysicalOpsPanel segmentId={props.segmentId} baseline={props.baseline} phase={props.phase} />
        ) : startup && (props.phase === "DO" || props.phase === "PLAN") ? (
          <CampusAllocationSim />
        ) : props.phase === "CHECK" || props.phase === "ACT" || (!physical && !startup) ? (
          <>
            {props.phase !== "ACT" ? (
              <>
                <KpiTrio kpis={model.kpis} />
                <MixChart points={model.series} unit={model.seriesUnit} label={model.seriesLabel} />
              </>
            ) : null}
          </>
        ) : null}
        {!physical && model.extras.length && (props.phase === "CHECK" || props.phase === "ACT") ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-[12px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-1 pr-3 font-medium">Réteg</th>
                  <th className="py-1 pr-3 font-medium">Optimista</th>
                  <th className="py-1 pr-3 font-medium">Realista</th>
                  <th className="py-1 font-medium">Pesszimista</th>
                </tr>
              </thead>
              <tbody>
                {model.extras.map((row) => (
                  <tr key={row.label} className="border-t border-border/40 align-top">
                    <td className="py-1.5 pr-3 text-foreground">{row.label}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{row.opt}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{row.real}</td>
                    <td className="py-1.5 text-muted-foreground">{row.pess}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}
