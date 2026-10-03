import { useMemo, useState } from "react";

import { ChartLegendSwatch } from "@/components/lean-viz/LeanCharts";
import {
  CAMPUS_CAPITAL_HUF,
  MARKET_SIGMA,
  MARKETING_LAG_MONTHS,
  POKA_RESERVE_MIN_PCT,
  PRODUCT_LAG_MONTHS,
  clampAlloc,
  defaultCampusAlloc,
  simulateCampus,
  type CampusAlloc,
  type CampusPoint,
} from "@/lib/campusAllocation";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";

function formatHuf(n: number) {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

function BandChart({ points }: { points: CampusPoint[] }) {
  if (points.length < 2) return null;
  const w = 360;
  const h = 140;
  const padL = 44;
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
  const ticks = points.filter((_, i) => i === 0 || i === points.length - 1 || i % 3 === 2);
  const labelBg = "var(--card-bg)";

  return (
    <figure className="rounded-xl border border-border/60 bg-card/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pénztár · pesszimista–realista–optimista sáv
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-36 w-full" role="img" aria-label="Campus allokáció PRO sáv">
        {ticks.map((p) => (
          <g key={p.t}>
            <line x1={toX(p.t)} x2={toX(p.t)} y1={padT} y2={h - padB} stroke="currentColor" strokeOpacity="0.12" />
            <text x={toX(p.t)} y={h - 6} textAnchor="middle" fill="currentColor" fontSize="9" opacity="0.65">
              {p.t}
            </text>
          </g>
        ))}
        <path d={path("pess")} fill="none" className={PRO_LINE_CLASS.pess} stroke={PRO_PESS} strokeWidth="2.2" />
        <path d={path("real")} fill="none" className={PRO_LINE_CLASS.real} stroke={PRO_REAL} strokeWidth="2.2" />
        <path d={path("opt")} fill="none" className={PRO_LINE_CLASS.opt} stroke={PRO_OPT} strokeWidth="2.2" />
        <rect x={padL - 2} y={toY(yMax) - 8} width="40" height="12" rx="2" fill={labelBg} />
        <text x={padL} y={toY(yMax) + 2} fill="currentColor" fontSize="9">
          {Math.round(yMax / 1000)}e
        </text>
      </svg>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li>
          <ChartLegendSwatch tone="opt" label="Optimista" line />
        </li>
        <li>
          <ChartLegendSwatch tone="real" label="Realista" line />
        </li>
        <li>
          <ChartLegendSwatch tone="pess" label="Pesszimista" line />
        </li>
      </ul>
    </figure>
  );
}

function AllocSlider(props: {
  id: string;
  label: string;
  hint: string;
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="alloc-slider" htmlFor={props.id}>
      <span className="alloc-slider-head">
        <span className="surv-label-chip">{props.label}</span>
        <span className="surv-value-chip">{props.value}%</span>
      </span>
      <input
        id={props.id}
        type="range"
        min={0}
        max={props.max}
        step={1}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <span className="alloc-slider-hint">{props.hint}</span>
    </label>
  );
}

export function CampusAllocationSim() {
  const [alloc, setAlloc] = useState<CampusAlloc>(defaultCampusAlloc);
  const sim = useMemo(() => simulateCampus(alloc), [alloc]);

  const setField = (key: keyof CampusAlloc, value: number) => {
    setAlloc(clampAlloc({ ...alloc, [key]: value }));
  };

  const be = (n: number | null) => (n == null ? "horizonton túl" : `${n}. hó`);

  return (
    <div className="alloc-sim">
      <div className="alloc-sim-head">
        <span className="surv-label-chip">Virtuális induló cég</span>
        <span className="surv-value-chip">{formatHuf(CAMPUS_CAPITAL_HUF)}</span>
      </div>
      <p className="alloc-sim-lead">
        Marketing, fejlesztés, bér. A piac {MARKETING_LAG_MONTHS}/{PRODUCT_LAG_MONTHS} hónap késleltetéssel reagál, ±
        {Math.round(MARKET_SIGMA * 100)}% helyi szórással. A tartalék Poka-Yoke a rossz döntés ellen.
      </p>
      <div className="alloc-sliders">
        <AllocSlider
          id="alloc-m"
          label="Marketing"
          hint={`Hatás a ${MARKETING_LAG_MONTHS}. hónaptól`}
          value={sim.alloc.marketing}
          max={100}
          onChange={(n) => setField("marketing", n)}
        />
        <AllocSlider
          id="alloc-p"
          label="Fejlesztés"
          hint={`Hatás a ${PRODUCT_LAG_MONTHS}. hónaptól`}
          value={sim.alloc.product}
          max={100}
          onChange={(n) => setField("product", n)}
        />
        <AllocSlider
          id="alloc-w"
          label="Bérköltség"
          hint="Egyenletes havi égési ráta"
          value={sim.alloc.payroll}
          max={100}
          onChange={(n) => setField("payroll", n)}
        />
        <AllocSlider
          id="alloc-r"
          label="Poka-Yoke tartalék"
          hint={`Minimum ${POKA_RESERVE_MIN_PCT}% a hibás döntés ellen`}
          value={sim.alloc.reserve}
          max={30}
          onChange={(n) => setField("reserve", n)}
        />
      </div>
      <dl className="alloc-metrics">
        <div>
          <dt>Elköltött keret</dt>
          <dd>{formatHuf(sim.spendHuf)}</dd>
        </div>
        <div>
          <dt>Tartalék</dt>
          <dd>{formatHuf(sim.reserveHuf)}</dd>
        </div>
        <div>
          <dt>Fedezet opt / real / pess</dt>
          <dd>
            {be(sim.beMonth.opt)} · {be(sim.beMonth.real)} · {be(sim.beMonth.pess)}
          </dd>
        </div>
      </dl>
      <p className={`alloc-poka ${sim.pokaOk ? "is-ok" : "is-warn"}`}>
        {sim.pokaOk
          ? "Poka-Yoke: a tartalék megfogja a pesszimista sávot."
          : "Nincs biztonsági tartalék. A pesszimista sáv gyorsabban a nullához megy."}
        {sim.insolventMonth ? ` Fizetésképtelenség a pesszimista ágon: ${sim.insolventMonth}. hónap.` : ""}
      </p>
      <p className="alloc-delay">{sim.delayedNote}</p>
      <BandChart points={sim.series} />
    </div>
  );
}
