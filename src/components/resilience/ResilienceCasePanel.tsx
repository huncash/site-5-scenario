import { caseTitle, useI18n } from "@/i18n";
import { HelpIcon } from "@/components/HelpIcon";
import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import { PhysicalOpsPanel } from "@/components/physical/PhysicalOpsPanel";
import type { MasterBaselineContext } from "@/lib/masterBaseline";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";
import {
  buildResilienceModel,
  isResilienceSegment,
  type HourPoint,
  type PhysicalKpi,
  type ResilienceCaseId,
  type ResilienceModel,
  type TfrRow,
} from "@/lib/resilienceCases";

function formatMetric(n: number, unit: string, locale: "hu" | "en" = "hu") {
  const digits = unit === "TFR" || unit === "nap" || unit === "day" ? 1 : n < 10 ? 1 : 0;
  return `${n.toLocaleString(locale === "en" ? "en-IE" : "hu-HU", { maximumFractionDigits: digits })} ${unit}`;
}

function ProLegend() {
  const { t } = useI18n();
  return (
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
  );
}

function PhysicalHourChart({ points, unit, label }: { points: HourPoint[]; unit: string; label: string }) {
  if (points.length < 2) return null;
  const w = 360;
  const h = 140;
  const padL = 40;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const ys = points.flatMap((p) => [p.opt, p.real, p.pess]);
  const yMax = Math.max(1, ...ys);
  const x0 = points[0]!.hour;
  const x1 = points[points.length - 1]!.hour;
  const toX = (hour: number) => padL + ((hour - x0) / Math.max(1, x1 - x0)) * (w - padL - padR);
  const toY = (v: number) => padT + (1 - v / yMax) * (h - padT - padB);
  const path = (key: "opt" | "real" | "pess") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.hour).toFixed(1)},${toY(p[key]).toFixed(1)}`).join(" ");
  const ticks = [0, 24, 48, 72].filter((t) => t >= x0 && t <= x1);
  const labelBg = "var(--card-bg)";

  return (
    <figure className="rounded-xl border border-border/60 bg-card/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-36 w-full" role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} x2={toX(t)} y1={padT} y2={h - padB} stroke="currentColor" strokeOpacity="0.12" />
            <text x={toX(t)} y={h - 6} textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.65">
              {t} h
            </text>
          </g>
        ))}
        <text x={6} y={padT + 8} fill="currentColor" fontSize="9" opacity="0.65">
          {unit}
        </text>
        <path d={path("pess")} fill="none" className={PRO_LINE_CLASS.pess} stroke={PRO_PESS} strokeWidth="2.2" />
        <path d={path("real")} fill="none" className={PRO_LINE_CLASS.real} stroke={PRO_REAL} strokeWidth="2.2" />
        <path d={path("opt")} fill="none" className={PRO_LINE_CLASS.opt} stroke={PRO_OPT} strokeWidth="2.2" />
        <rect x={padL - 2} y={toY(yMax) - 8} width="28" height="12" rx="2" fill={labelBg} />
        <text x={padL} y={toY(yMax) + 2} fill="currentColor" fontSize="9">
          {Math.round(yMax)}
        </text>
      </svg>
      <ProLegend />
    </figure>
  );
}

function KpiTrio({ kpis }: { kpis: PhysicalKpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 min-w-0 lg:grid-cols-3">
      {kpis.map((k) => (
        <div key={k.id} className="min-w-0 rounded-lg border border-border/50 bg-background/40 p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground break-words">{k.label}</p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground break-words">{k.hint}</p>
          <dl className="mt-2 grid gap-1 text-[12px]">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <ChartLegendSwatch tone="opt" label="Opt" line />
              <span className="min-w-[4.5rem] font-mono tabular-nums text-right">{formatMetric(k.opt, k.unit)}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <ChartLegendSwatch tone="real" label="Real" line />
              <span className="min-w-[4.5rem] font-mono tabular-nums text-right">{formatMetric(k.real, k.unit)}</span>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <ChartLegendSwatch tone="pess" label="Pess" line />
              <span className="min-w-[4.5rem] font-mono tabular-nums text-right">{formatMetric(k.pess, k.unit)}</span>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}

function TfrMatrix({ rows, replacement }: { rows: TfrRow[]; replacement: number }) {
  const max = Math.max(replacement, ...rows.map((r) => r.tfr));
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full min-w-[36rem] border-collapse text-left text-[12px]">
        <caption className="sr-only">TFR stratégiai előrejelzés, 2023-as helyi másolat — strukturális trend, nem riadó</caption>
        <thead>
          <tr className="border-b border-border/60 text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-2 font-medium">Nemzet</th>
            <th className="px-3 py-2 font-medium">TFR {rows[0]?.year ?? 2023}</th>
            <th className="px-3 py-2 font-medium">Rés a {replacement.toLocaleString("hu-HU")}‑hez</th>
            <th className="px-3 py-2 font-medium">Kezelési pálya</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const pct = Math.max(4, (r.tfr / max) * 100);
            return (
              <tr key={r.id} className="border-b border-border/40 align-top">
                <td className="px-3 py-2.5 font-medium text-foreground">
                  {r.country}
                  <div className="text-[10px] font-normal text-muted-foreground">{r.source}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="relative h-7">
                    <span
                      className="absolute -top-0.5 left-0 z-10 rounded-sm bg-[var(--card-bg)] px-1 font-mono tabular-nums text-foreground"
                    >
                      {r.tfr.toLocaleString("hu-HU", { minimumFractionDigits: 2 })}
                    </span>
                    <span
                      className="absolute bottom-0 left-0 h-2 rounded-sm bg-[var(--pro-real)]"
                      style={{ width: `${pct}%` }}
                      aria-hidden
                    />
                  </div>
                </td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-foreground">
                  −{r.gapToReplacement.toLocaleString("hu-HU", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{r.strategy}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-3 py-2 text-[11px] text-muted-foreground">
        Helyettesítési szint: {replacement.toLocaleString("hu-HU", { minimumFractionDigits: 1 })}. Strukturális trend, nem
        riadó. Helyi másolat, nem élő API.
      </p>
    </div>
  );
}

export function ResilienceCasePanel(props: {
  segmentId: string | null | undefined;
  phase?: "PLAN" | "DO" | "CHECK" | "ACT";
  model?: ResilienceModel | null;
  baseline?: MasterBaselineContext | null;
}) {
  const { locale, t } = useI18n();
  if (!isResilienceSegment(props.segmentId)) return null;
  const model = props.model ?? buildResilienceModel(props.segmentId as ResilienceCaseId);
  const phaseHint =
    props.phase === "PLAN"
      ? t("panel.resilPlan")
      : props.phase === "DO"
        ? t("panel.resilDo")
      : props.phase === "ACT"
        ? t("panel.resilAct")
        : t("panel.resilCheck");

  return (
    <section className="rounded-xl border border-border/60 bg-card/80 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("panel.resilEyebrow")}
            <HelpIcon
              kbId={
                model.kind === "bcp"
                  ? "lesson-bcp"
                  : model.kind === "community"
                    ? "lesson-community"
                    : model.kind === "household"
                      ? "lesson-household"
                      : "lesson-demography"
              }
              title={t("panel.lesson")}
            />
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-foreground">{caseTitle(props.segmentId, locale) ?? model.title}</h3>
          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{phaseHint}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        {model.kind === "macro" ? (
          props.phase === "PLAN" ? (
            <TfrMatrix rows={model.tfrRows} replacement={model.replacementTfr} />
          ) : props.phase === "CHECK" || props.phase === "ACT" ? (
            <>
              <KpiTrio kpis={model.kpis} />
              {props.phase === "CHECK" ? <TfrMatrix rows={model.tfrRows} replacement={model.replacementTfr} /> : null}
            </>
          ) : (
            <KpiTrio kpis={model.kpis} />
          )
        ) : (
          <PhysicalOpsPanel segmentId={props.segmentId} baseline={props.baseline} phase={props.phase} />
        )}
        {model.extras.length && model.kind === "macro" && (props.phase === "CHECK" || props.phase === "ACT") ? (
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
