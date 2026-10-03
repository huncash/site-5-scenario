import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

import { HelpIcon } from "@/components/HelpIcon";
import { currencyUnit } from "@/i18n/currency";
import { formatMoney } from "@/lib/finance";
import {
  compactHuf,
  type BulletDatum,
  type HeatCell,
  type SankeyLink,
  type SparkSeries,
  type WaterfallStep,
} from "@/lib/leanViz";
import { a11yPatternClassForColor } from "@/lib/a11yChartPatterns";
import {
  PRO_PESS,
  PRO_REAL,
  PRO_OPT,
  PRO_LINE_CLASS,
  PRO_SWATCH_CLASS,
  proToneFromSeriesId,
  type ProTone,
} from "@/lib/proChart";
import { cn } from "@/lib/utils";

const CURRENCY = "HUF";
const INK = "var(--text-main)";
const FOCUS = "var(--accent-color)";
const UP = "var(--accent-emerald, #10b981)";
const DOWN = "#fb7185";
const MUTED = "color-mix(in srgb, var(--card-border) 72%, transparent)";
const AXIS = "var(--text-muted)";

function niceTicks(min: number, max: number, count = 5): number[] {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = hi - lo || 1;
  const raw = span / Math.max(1, count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag;
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 0.25; v += step) ticks.push(Number(v.toPrecision(8)));
  return ticks;
}

function seriesStroke(id: string, active?: boolean): string {
  if (id === "opt") return PRO_OPT;
  if (id === "pess") return PRO_PESS;
  if (id === "inc") return UP;
  if (id === "exp") return DOWN;
  if (id === "real" || id === "sav") return id === "real" ? PRO_REAL : FOCUS;
  return active ? FOCUS : INK;
}

function formatBullet(value: number, unit?: string): string {
  if (unit === "%") return `${Math.round(value)}%`;
  return compactHuf(value);
}

function axisTickLabel(labs: string[], lab: string): string {
  const years = new Set(labs.map((x) => x.match(/^\d{4}/)?.[0]).filter(Boolean) as string[]);
  return years.size <= 1 ? lab.replace(/^\d{4}\.\s*/, "") : lab;
}

function axisMilestoneIdxs(n: number, plotW: number, labelW: number, atX: (i: number) => number): number[] {
  if (n <= 1) return [0];
  const maxTicks = Math.max(2, Math.floor(plotW / (labelW + 8)));
  const step = Math.max(1, Math.ceil((n - 1) / (maxTicks - 1)));
  const out: number[] = [];
  for (let i = 0; i < n; i += step) out.push(i);
  const last = n - 1;
  const prev = out[out.length - 1] ?? 0;
  if (prev !== last) {
    if (atX(last) - atX(prev) < labelW + 6) out[out.length - 1] = last;
    else out.push(last);
  }
  return out;
}

function useBoxWidth(min = 280) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(min);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => setW(Math.max(min, Math.round(el.clientWidth)));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return { ref, w };
}

function ChartHoverSlot({ children }: { children?: ReactNode }) {
  return (
    <p className="mt-1 min-h-[1.25rem] text-[10px] leading-snug text-slate-400" aria-live="polite">
      {children || "\u00a0"}
    </p>
  );
}

export function ChartLegendSwatch({
  color,
  label,
  line,
  tone,
}: {
  color?: string;
  label: string;
  line?: boolean;
  tone?: ProTone;
}) {
  const fill = color ?? (tone === "pess" ? PRO_PESS : tone === "opt" ? PRO_OPT : tone === "real" ? PRO_REAL : FOCUS);
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] leading-snug text-slate-300">
      <span
        className={cn(
          line && tone
            ? PRO_SWATCH_CLASS[tone]
            : line
              ? "inline-block h-[3px] w-5 rounded-sm"
              : "inline-block h-2.5 w-3.5 rounded-sm border border-transparent",
          !line && fill ? a11yPatternClassForColor(fill) : null,
        )}
        style={tone && line ? undefined : { background: fill }}
        aria-hidden
      />
      {label}
    </span>
  );
}

export const VIZ_SPANS = [6, 12, 24] as const;
export type VizSpan = (typeof VIZ_SPANS)[number];

export function ChartChrome({
  title,
  legend,
  span,
  onSpan,
  onPrev,
  onNext,
  windowLabel,
  children,
}: {
  title: ReactNode;
  legend?: ReactNode;
  span?: VizSpan;
  onSpan?: (n: VizSpan) => void;
  onPrev?: () => void;
  onNext?: () => void;
  windowLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 w-full">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-slate-200">{title}</h3>
        {onSpan && onPrev && onNext ? (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              className="rounded-md border border-border bg-[var(--dropdown-hover)] px-2 py-1 text-[11px] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white"
              onClick={onPrev}
              title="Előző"
              aria-label="Előző időszak"
            >
              ←
            </button>
            {windowLabel ? (
              <span className="min-w-[5.5rem] px-1 text-center text-[11px] text-slate-300">{windowLabel}</span>
            ) : null}
            <button
              type="button"
              className="rounded-md border border-border bg-[var(--dropdown-hover)] px-2 py-1 text-[11px] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white"
              onClick={onNext}
              title="Következő"
              aria-label="Következő időszak"
            >
              →
            </button>
            {VIZ_SPANS.map((n) => (
              <button
                key={n}
                type="button"
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px]",
                  span === n
                    ? "border-[var(--accent-color)] bg-[var(--accent-color)] text-white"
                    : "border-border bg-[var(--dropdown-hover)] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white",
                )}
                onClick={() => onSpan(n)}
              >
                {n} hó
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {legend ? <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">{legend}</div> : null}
      <div className="mt-2 min-w-0">{children}</div>
    </section>
  );
}

export function ChartFrame(props: {
  title: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
}) {
  return <ChartChrome {...props} />;
}

export function WaterfallChart({
  steps,
  height = 148,
}: {
  steps: WaterfallStep[];
  height?: number;
}) {
  const laid = useMemo(() => {
    let run = 0;
    let open = 0;
    const rows = steps.map((s) => {
      if (s.role === "start") {
        run = s.value;
        open = s.value;
        const base = Math.min(0, s.value);
        return { ...s, base, span: Math.abs(s.value), end: run, shown: s.value };
      }
      if (s.role === "delta") {
        const base = s.value >= 0 ? run : run + s.value;
        run += s.value;
        return { ...s, base, span: Math.abs(s.value), end: run, shown: s.value };
      }
      const base = Math.min(0, run);
      return { ...s, base, span: Math.abs(run), value: run, end: run, shown: run };
    });
    const bottoms = rows.map((r) => r.base);
    const tops = rows.map((r) => r.base + r.span);
    const rawMin = Math.min(0, ...bottoms, ...tops);
    const rawMax = Math.max(0, ...bottoms, ...tops, 1);
    const paddedMin =
      rawMin < 0 ? rawMin - Math.max(Math.abs(rawMin) * 0.4, rawMax * 0.05) : rawMin;
    const ticks = niceTicks(paddedMin, rawMax, 5);
    const y0 = Math.min(...ticks, paddedMin);
    const y1 = Math.max(...ticks, rawMax);
    return { rows, open, y0, y1, ticks };
  }, [steps]);

  const clipId = `wf-plot-${useId().replace(/:/g, "")}`;
  const [hover, setHover] = useState<string | null>(null);
  const { ref, w } = useBoxWidth(320);
  const n = Math.max(1, laid.rows.length);
  const tickW = Math.max(...laid.ticks.map((t) => compactHuf(t).length), 4) * 5.6;
  const padL = Math.max(88, Math.round(20 + 10 + tickW));
  const padR = 12;
  const padT = 22;
  const padB = 32;
  const plotW = Math.max(160, w - padL - padR);
  const spanY = laid.y1 - laid.y0 || 1;
  const negFrac = laid.y0 < 0 && laid.y1 > 0 ? -laid.y0 / spanY : 0;
  const basePlotH = Math.max(height, Math.min(228, Math.round(w * 0.28)));
  const plotH =
    negFrac > 0
      ? Math.min(260, Math.max(basePlotH, Math.ceil(32 / Math.max(negFrac, 0.1))))
      : basePlotH;
  const slot = plotW / n;
  const gap = Math.min(14, Math.max(6, slot * 0.16));
  const barW = Math.max(18, slot - gap);
  const svgH = padT + plotH + padB;
  const toY = (v: number) => padT + plotH - ((v - laid.y0) / spanY) * plotH;
  const yMid = padT + plotH / 2;
  const plotBottom = padT + plotH;
  const zeroY = negFrac > 0 ? toY(0) : plotBottom;
  const active = laid.rows.find((r) => r.key === hover) ?? null;
  const caption = active
    ? `${active.label}: ${compactHuf(active.shown)} ${currencyUnit()} · állás ${compactHuf(active.end)} ${currencyUnit()}${
        laid.open > 0 && active.role === "delta"
          ? ` · a bevétel ${Math.round((Math.abs(active.shown) / laid.open) * 100)}%-a`
          : ""
      }`
    : null;

  return (
    <div ref={ref} className="min-w-0 w-full">
      <svg
        width="100%"
        height={svgH}
        viewBox={`0 0 ${w} ${svgH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Eredménylevezetés, forint tételcsoportonként"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={padL} y={padT} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        <text x={12} y={yMid} fill={AXIS} fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${yMid})`}>
          {currencyUnit()}
        </text>
        {laid.ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={padL + plotW} y1={toY(t)} y2={toY(t)} stroke={MUTED} />
            <text x={padL - 8} y={toY(t) + 3} textAnchor="end" fill={AXIS} fontSize={9}>
              {compactHuf(t)}
            </text>
          </g>
        ))}
        {laid.y0 < 0 && laid.y1 > 0 ? (
          <line x1={padL} x2={padL + plotW} y1={toY(0)} y2={toY(0)} stroke="rgba(248,250,252,0.4)" />
        ) : null}
        {laid.rows.map((r, i) => {
          const x = Math.max(padL + 2, padL + i * slot + (slot - barW) / 2);
          const barTop = toY(r.base + r.span);
          const barBot = toY(r.base);
          const rawH = Math.max(0, barBot - barTop);
          const barLo = r.base;
          const barHi = r.base + r.span;
          const hangsBelow = barLo < 0 && barHi <= 0;
          const crossesZero = barLo < 0 && barHi > 0;
          const growDown = hangsBelow || crossesZero;
          const h0 = Math.max(3, rawH);
          const y0bar = growDown ? barTop : Math.min(barTop, barBot - h0);
          const y = hangsBelow ? Math.max(y0bar, zeroY + 2) : y0bar;
          const h = hangsBelow ? Math.max(3, barBot - y) : h0;
          const fill = r.shown >= 0 ? UP : DOWN;
          const isHover = hover === r.key;
          const axisTick = r.role === "start" || r.role === "total";
          const label = compactHuf(r.shown);
          const spaceAbove = y - padT;
          const spaceBelow = plotBottom - (y + h);
          const labelBelowAxis = hangsBelow || (crossesZero && (r.role === "total" || Math.abs(barLo) >= barHi));
          let labelY: number;
          if (labelBelowAxis) {
            labelY = Math.min(plotBottom - 3, Math.max(y + h + 11, zeroY + 12));
          } else if (spaceAbove >= 12 && y < zeroY - 10) {
            labelY = y - 4;
          } else if (h >= 16) {
            labelY = y + 11;
          } else if (spaceBelow >= 12 && y + h < zeroY - 8) {
            labelY = y + h + 10;
          } else {
            labelY = Math.min(zeroY - 10, Math.max(padT + 9, y - 4));
          }
          if (Math.abs(labelY - zeroY) < 9) {
            labelY = Math.min(plotBottom - 3, Math.max(padT + 9, labelBelowAxis ? zeroY + 12 : zeroY - 10));
          }
          const approxW = label.length * 5;
          const labelX = Math.min(
            padL + plotW - 2 - approxW / 2,
            Math.max(padL + 6 + approxW / 2, x + barW / 2),
          );
          return (
            <g
              key={r.key}
              onMouseEnter={() => setHover(r.key)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default"
            >
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                fill={fill}
                className={r.shown >= 0 ? "a11y-pat-diagonal" : "a11y-pat-checker"}
                clipPath={`url(#${clipId})`}
                stroke={isHover ? "rgba(248,250,252,0.9)" : "transparent"}
                strokeWidth={isHover ? 1 : 0}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fill={isHover ? "rgba(250,204,21,0.98)" : "#f8fafc"}
                fontSize={isHover ? 9 : 8}
                fontWeight={isHover ? 700 : 400}
              >
                {label}
              </text>
              {axisTick ? (
                <text
                  x={x + barW / 2}
                  y={padT + plotH + 13}
                  textAnchor="middle"
                  fill={isHover ? "rgba(250,204,21,0.98)" : INK}
                  fontSize={8}
                  fontWeight={isHover ? 700 : 400}
                >
                  {r.label}
                </text>
              ) : null}
            </g>
          );
        })}
        <text x={padL + plotW / 2} y={svgH - 4} textAnchor="middle" fill={AXIS} fontSize={9}>
          Tételcsoport
        </text>
      </svg>
      <ChartHoverSlot>{caption}</ChartHoverSlot>
    </div>
  );
}

export function BulletGraph({ item }: { item: BulletDatum }) {
  const max = Math.max(item.target * 1.2, item.actual, 1);
  const actualPct = Math.min(100, (item.actual / max) * 100);
  const targetPct = Math.min(100, (item.target / max) * 100);
  const gap = item.actual - item.target;
  const gapPct = item.target !== 0 ? (gap / item.target) * 100 : 0;
  const fact = `Tény ${formatBullet(item.actual, item.unit)}, küszöb ${formatBullet(item.target, item.unit)} — ${
    gap >= 0 ? "fölötte" : "alatta"
  } ${Math.abs(gapPct).toFixed(0)}%. A sáv a tény, a kontrasztos vonal a küszöb.`;

  return (
    <div className="min-w-0" data-exact={item.hint ?? fact}>
      <div className="flex flex-col gap-0.5 min-[520px]:flex-row min-[520px]:items-baseline min-[520px]:justify-between min-[520px]:gap-2">
        <span className="kpi-label inline-flex items-start text-[10px] uppercase tracking-wide text-slate-300">
          {item.label}
          <HelpIcon title={item.label} summary={item.hint ?? fact} />
        </span>
        <span className="kpi-value shrink-0 font-mono text-[11px] text-slate-100">
          {formatBullet(item.actual, item.unit)} / {formatBullet(item.target, item.unit)}
        </span>
      </div>
      <div className="relative mt-1 h-3.5 overflow-hidden rounded-sm bg-[var(--dropdown-hover)]">
        <div className="absolute inset-y-0 left-0 bg-[color-mix(in_srgb,var(--card-bg)_70%,var(--app-bg))]" style={{ width: "60%" }} />
        <div className="absolute inset-y-0 left-0 bg-[color-mix(in_srgb,var(--card-border)_55%,var(--card-bg))]" style={{ width: "85%" }} />
        <div className="absolute inset-y-0 left-0 bg-[color-mix(in_srgb,var(--card-border)_35%,var(--card-bg))]" style={{ width: "100%" }} />
        <div
          className="absolute inset-y-[3px] left-0 rounded-sm bg-[var(--accent-color)] a11y-pat-diagonal"
          style={{ width: `${actualPct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-[var(--text-main)]"
          style={{ left: `${targetPct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function ExceptionHeatmap({
  rows,
  cols,
  cells,
  onSelect,
}: {
  rows: string[];
  cols: string[];
  cells: HeatCell[];
  onSelect?: (cell: HeatCell) => void;
}) {
  const map = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cells) m.set(`${c.row}|${c.col}`, c.value);
    return m;
  }, [cells]);
  const max = Math.max(1, ...cells.map((c) => Math.abs(c.value)));
  const [focus, setFocus] = useState<{ row: string; col: string } | null>(null);
  const { ref, w } = useBoxWidth(280);
  const n = cols.length;
  const catW = 152;
  const plotW = Math.max(80, w - catW);
  const ticks = cols.map((c) => axisTickLabel(cols, c));
  const labelW = Math.max(28, Math.max(...ticks.map((t) => t.length), 4) * 5.2);
  const colW = plotW / Math.max(1, n);
  const xIdxs = axisMilestoneIdxs(n, plotW, labelW, (i) => (i + 0.5) * colW);
  const xShow = new Set(xIdxs);

  const color = (v: number) => {
    const t = Math.min(1, Math.abs(v) / max);
    if (Math.abs(v) < max * 0.08) return "rgba(148,163,184,0.22)";
    if (v < 0) return `rgba(251,113,133,${0.25 + t * 0.65})`;
    return `rgba(52,211,153,${0.25 + t * 0.65})`;
  };

  return (
    <div ref={ref} className="min-w-0 w-full">
      <table className="w-full border-separate border-spacing-0.5 text-[10px]">
        <thead>
          <tr>
            <th className="min-w-[9.5rem] max-w-[14rem] text-left font-normal text-slate-500">
              Kategória
            </th>
            {cols.map((c, i) => {
              const k = xIdxs.indexOf(i);
              return (
                <th
                  key={c}
                  title={c}
                  className="overflow-visible px-0.5 font-normal text-slate-400 whitespace-nowrap"
                  style={{ textAlign: k === 0 ? "left" : k === xIdxs.length - 1 ? "right" : "center" }}
                >
                  {xShow.has(i) ? ticks[i] : <span className="sr-only">{c}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td className="kpi-label max-w-[14rem] pr-2 align-middle leading-snug text-slate-300">
                {r}
              </td>
              {cols.map((c) => {
                const v = map.get(`${r}|${c}`) ?? 0;
                const dim = focus && focus.row !== r && focus.col !== c;
                return (
                  <td key={c}>
                    <button
                      type="button"
                      className={cn(
                        "h-6 w-full rounded-sm",
                        dim && "opacity-25",
                        Math.abs(v) < max * 0.08
                          ? "a11y-pat-h-stripe"
                          : v < 0
                            ? "a11y-pat-checker"
                            : "a11y-pat-diagonal",
                      )}
                      style={{ background: color(v) }}
                      title={`${r} · ${c}: ${formatMoney(Math.round(v), CURRENCY)}`}
                      onMouseEnter={() => setFocus({ row: r, col: c })}
                      onMouseLeave={() => setFocus(null)}
                      onClick={() => onSelect?.({ row: r, col: c, value: v })}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ChartHoverSlot>
        {focus
          ? `${focus.row} · ${focus.col}: ${formatMoney(Math.round(map.get(`${focus.row}|${focus.col}`) ?? 0), CURRENCY)}`
          : null}
      </ChartHoverSlot>
    </div>
  );
}

export function SmallMultiples({
  series,
  height = 148,
  xLabel = "Hónap",
  yLabel = `Összeg (${currencyUnit()})`,
}: {
  series: SparkSeries[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
}) {
  const [xi, setXi] = useState<number | null>(null);
  const { ref, w } = useBoxWidth(320);
  const ys = series.flatMap((s) => s.points.map((p) => p.y));
  const min = Math.min(0, ...ys);
  const max = Math.max(1, ...ys);
  const n = Math.max(1, ...series.map((s) => s.points.length));
  const xs = series[0]?.points.map((p) => p.x) ?? [];
  const ticks = niceTicks(min, max, 5);
  const y0 = Math.min(...ticks);
  const y1 = Math.max(...ticks);
  const padL = 76;
  const padR = 14;
  const padT = 12;
  const padB = 40;
  const plotW = Math.max(160, w - padL - padR);
  const plotH = Math.max(height - 20, Math.min(200, Math.round(w * 0.26)));
  const vbH = padT + plotH + padB;
  const toX = (i: number) => padL + (i / Math.max(1, n - 1)) * plotW;
  const toY = (v: number) => padT + plotH - ((v - y0) / (y1 - y0 || 1)) * plotH;
  const hoverMonth = xi != null ? xs[xi] : null;
  const xTick = (lab: string) => axisTickLabel(xs, lab);
  const labelW = Math.max(28, Math.max(...xs.map((lab) => xTick(lab).length), 4) * 5.2);
  const xIdxs = axisMilestoneIdxs(n, plotW, labelW, toX);
  const yMid = padT + plotH / 2;

  return (
    <div ref={ref} className="min-w-0 w-full">
      <svg
        width="100%"
        height={vbH}
        viewBox={`0 0 ${w} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`${yLabel}, ${xLabel}`}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const t = (e.clientX - box.left) / box.width;
          const plotT = (t * w - padL) / plotW;
          setXi(Math.max(0, Math.min(n - 1, Math.round(plotT * (n - 1)))));
        }}
        onMouseLeave={() => setXi(null)}
      >
        <text x={12} y={yMid} fill={AXIS} fontSize={9} textAnchor="middle" transform={`rotate(-90 12 ${yMid})`}>
          {yLabel}
        </text>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={padL + plotW} y1={toY(t)} y2={toY(t)} stroke={MUTED} />
            <text x={padL - 8} y={toY(t) + 3} textAnchor="end" fill={AXIS} fontSize={9}>
              {compactHuf(t)}
            </text>
          </g>
        ))}
        {y0 < 0 && y1 > 0 ? (
          <line x1={padL} x2={padL + plotW} y1={toY(0)} y2={toY(0)} stroke="rgba(248,250,252,0.35)" />
        ) : null}
        {series.map((s) => {
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(p.y).toFixed(1)}`)
            .join(" ");
          const tone = proToneFromSeriesId(s.id);
          const stroke = seriesStroke(s.id, s.active);
          const markEvery = Math.max(1, Math.floor((s.points.length - 1) / 4));
          return (
            <g key={s.id}>
              <path
                d={d}
                fill="none"
                className={tone ? PRO_LINE_CLASS[tone] : undefined}
                stroke={stroke}
                strokeWidth={s.active ? 2.2 : 1.6}
                opacity={s.active ? 1 : 0.82}
              />
              {s.points.map((p, i) =>
                i === 0 || i === s.points.length - 1 || i % markEvery === 0 ? (
                  <circle
                    key={i}
                    cx={toX(i)}
                    cy={toY(p.y)}
                    r={s.active ? 3 : 2.2}
                    fill="var(--card-bg)"
                    stroke={stroke}
                    strokeWidth={1.5}
                  />
                ) : null,
              )}
            </g>
          );
        })}
        {xi != null ? (
          <line x1={toX(xi)} x2={toX(xi)} y1={padT} y2={padT + plotH} stroke={MUTED} />
        ) : null}
        {xIdxs.map((i, k) => (
          <text
            key={`${xs[i] ?? i}-${i}`}
            x={toX(i)}
            y={padT + plotH + 14}
            textAnchor={k === 0 ? "start" : k === xIdxs.length - 1 ? "end" : "middle"}
            fill={AXIS}
            fontSize={8}
          >
            {xTick(xs[i] ?? "")}
          </text>
        ))}
        <text x={padL + plotW / 2} y={vbH - 4} textAnchor="middle" fill={AXIS} fontSize={9}>
          {xLabel}
        </text>
      </svg>
      <ChartHoverSlot>
        {hoverMonth
          ? `${hoverMonth}: ${series.map((s) => `${s.label} ${compactHuf(s.points[xi ?? 0]?.y ?? 0)} ${currencyUnit()}`).join(" · ")}`
          : null}
      </ChartHoverSlot>
    </div>
  );
}

function stackNodes(totals: number[], plotH: number, gap: number, minH: number) {
  const n = Math.max(1, totals.length);
  const leftover = Math.max(0, plotH - n * minH - Math.max(0, n - 1) * gap);
  const sum = totals.reduce((a, v) => a + v, 0) || 1;
  const heights = totals.map((v) => minH + leftover * (v / sum));
  const ys: number[] = [];
  let y = 0;
  for (const h of heights) {
    ys.push(y);
    y += h + gap;
  }
  return { ys, heights };
}

function clipLabel(name: string, max = 28): string {
  const t = name.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function FlowSankey({
  sources,
  sinks,
  links,
}: {
  sources: string[];
  sinks: string[];
  links: SankeyLink[];
}) {
  const [hot, setHot] = useState<string | null>(null);
  const { ref, w } = useBoxWidth(360);
  const srcTot = sources.map((s) => links.filter((l) => l.from === s).reduce((a, l) => a + l.value, 0));
  const snkTot = sinks.map((s) => links.filter((l) => l.to === s).reduce((a, l) => a + l.value, 0));
  const all = Math.max(1, ...srcTot, ...snkTot);
  const total = links.reduce((a, l) => a + l.value, 0) || 1;

  const row = 16;
  const gap = 3;
  const n = Math.max(sources.length, sinks.length, 1);
  const plotH = Math.max(168, n * (row + gap));
  const padT = 8;
  const padB = 10;
  const padL = 8;
  const padR = 6;
  const bar = 8;
  const valW = 56;
  const charW = 5.2;
  const longestSrc = Math.max(8, ...sources.map((s) => s.length));
  const longestSnk = Math.max(8, ...sinks.map((s) => s.length));
  const srcLabelW = longestSrc * charW + 2;
  const minFlow = 160;
  const srcX = padL + srcLabelW + 4;
  const flow0 = srcX + bar;
  const valX = w - padR;
  const nameMax = Math.max(72, valX - valW - 8 - (flow0 + minFlow + bar + 6));
  const nameW = Math.min(Math.max(72, longestSnk * charW * 1.5), nameMax);
  const nameX = valX - valW - 8 - nameW;
  const snkX = nameX - 6 - bar;
  const flowW = Math.max(minFlow, snkX - flow0);
  const vbW = w;
  const vbH = padT + plotH + padB;
  const nameChars = Math.max(12, Math.floor(nameW / charW));
  const srcChars = Math.max(10, Math.floor(srcLabelW / charW));

  const src = stackNodes(srcTot, plotH, gap, row);
  const snk = stackNodes(snkTot, plotH, gap, row);

  return (
    <div ref={ref} className="min-w-0 w-full">
      <svg
        width="100%"
        height={vbH}
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Pénzáramlás: bal forrás, jobb költséghely és összeg"
      >
        {sources.map((s, i) => (
          <g key={`src-${s}`}>
            <text
              x={padL}
              y={padT + (src.ys[i] ?? 0) + (src.heights[i] ?? row) / 2 + 3}
              textAnchor="start"
              fill={INK}
              fontSize={8}
            >
              {clipLabel(s, srcChars)}
              <title>{s}</title>
            </text>
            <rect
              x={srcX}
              y={padT + (src.ys[i] ?? 0)}
              width={bar}
              height={src.heights[i] ?? row}
              rx={2}
              fill={FOCUS}
              className="a11y-pat-dots"
            />
          </g>
        ))}
        {sinks.map((s, i) => {
          const v = snkTot[i] ?? 0;
          const cy = padT + (snk.ys[i] ?? 0) + (snk.heights[i] ?? row) / 2 + 3;
          return (
            <g key={`snk-${s}`}>
              <rect
                x={snkX}
                y={padT + (snk.ys[i] ?? 0)}
                width={bar}
                height={snk.heights[i] ?? row}
                rx={2}
                fill={MUTED}
                className="a11y-pat-h-stripe"
              />
              <text x={nameX} y={cy} fill={INK} fontSize={8}>
                {clipLabel(s, nameChars)}
                <title>{s}</title>
              </text>
              <text x={valX} y={cy} textAnchor="end" fill={INK} fontSize={8} fontFamily="ui-monospace, monospace">
                {compactHuf(v)}
              </text>
            </g>
          );
        })}
        {links.map((l, i) => {
          const si = sources.indexOf(l.from);
          const ti = sinks.indexOf(l.to);
          if (si < 0 || ti < 0) return null;
          const y1 = padT + (src.ys[si] ?? 0) + (src.heights[si] ?? row) / 2;
          const y2 = padT + (snk.ys[ti] ?? 0) + (snk.heights[ti] ?? row) / 2;
          const sw = Math.max(2, (l.value / all) * Math.min(22, (snk.heights[ti] ?? row)));
          const id = `${l.from}>${l.to}`;
          const on = !hot || hot === id;
          const d = `M${flow0},${y1} C${flow0 + flowW * 0.45},${y1} ${snkX - flowW * 0.45},${y2} ${snkX},${y2}`;
          return (
            <g
              key={i}
              onMouseEnter={() => setHot(id)}
              onMouseLeave={() => setHot(null)}
              onClick={() => setHot(id)}
              style={{ cursor: "pointer" }}
            >
              <path d={d} fill="none" stroke="transparent" strokeWidth={Math.max(14, sw + 10)} />
              <path d={d} fill="none" stroke={DOWN} strokeWidth={sw} opacity={on ? 0.55 : 0.1}>
                <title>{`${l.from} → ${l.to}: ${formatMoney(Math.round(l.value), CURRENCY)} (${((l.value / total) * 100).toFixed(0)}%)`}</title>
              </path>
            </g>
          );
        })}
      </svg>
      <ChartHoverSlot>
        {hot
          ? (() => {
              const [from, to] = hot.split(">");
              const l = links.find((x) => x.from === from && x.to === to);
              return l
                ? `${from} → ${to}: ${compactHuf(l.value)} ${currencyUnit()} (${((l.value / total) * 100).toFixed(0)}%)`
                : null;
            })()
          : null}
      </ChartHoverSlot>
    </div>
  );
}
