import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { formatCurrency, useI18n } from "@/i18n";
import type { AnonCasePack } from "@/lib/anonCasePack";
import { PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";

function pathCash(start: number, monthlyNet: number, months: number): number[] {
  const out = [start];
  let v = start;
  for (let i = 1; i <= months; i++) {
    v = Math.max(0, v + monthlyNet);
    out.push(v);
  }
  return out;
}

function PathChart({
  pess,
  real,
  opt,
  label,
}: {
  pess: number[];
  real: number[];
  opt: number[];
  label: string;
}) {
  const w = 360;
  const h = 140;
  const padL = 44;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const ys = [...pess, ...real, ...opt];
  const yMax = Math.max(1, ...ys);
  const n = Math.max(pess.length, 2);
  const toX = (i: number) => padL + (i / (n - 1)) * (w - padL - padR);
  const toY = (v: number) => padT + (1 - v / yMax) * (h - padT - padB);
  const d = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const labelBg = "var(--card)";
  return (
    <figure className="rounded-xl border border-border/60 bg-card/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-36 w-full" role="img" aria-label={label}>
        <path d={d(pess)} fill="none" stroke={PRO_PESS} strokeWidth="2.2" />
        <path d={d(real)} fill="none" stroke={PRO_REAL} strokeWidth="2.2" />
        <path d={d(opt)} fill="none" stroke={PRO_OPT} strokeWidth="2.2" />
        <rect x={padL - 2} y={toY(yMax) - 8} width="40" height="12" rx="2" fill={labelBg} />
        <text x={padL} y={toY(yMax) + 2} fill="currentColor" fontSize="9">
          {Math.round(yMax / 1000)}e
        </text>
      </svg>
    </figure>
  );
}

export function AnonStudyPlay({
  pack,
  onClose,
}: {
  pack: AnonCasePack;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [shock, setShock] = useState(0);
  const study = pack.study;
  const sim = useMemo(() => {
    const factor = 1 + shock / 100;
    const rev = study.monthlyRevenueHuf * factor;
    const opex = study.monthlyOpexHuf;
    const cash = study.cashHuf;
    const pessNet = rev * 0.6 - opex * 1.15;
    const realNet = rev - opex;
    const optNet = rev * 1.35 - opex * 0.85;
    return {
      pess: pathCash(cash, pessNet, 12),
      real: pathCash(cash, realNet, 12),
      opt: pathCash(cash, optNet, 12),
      runway:
        realNet >= 0 ? null : cash / Math.max(1, -realNet),
    };
  }, [shock, study]);

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/25 bg-card/50 p-4" aria-labelledby="anon-play-title">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("school.packPlayKicker")}
          </p>
          <h2 id="anon-play-title" className="text-base font-semibold text-foreground">
            {study.title}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            {study.orgAlias} · {study.headcountBand}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {t("school.playClear")}
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">{t("frame.reserveDepth")}</dt>
          <dd className="font-mono tabular-nums">{formatCurrency(study.cashHuf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("frame.opex")}</dt>
          <dd className="font-mono tabular-nums">{formatCurrency(study.monthlyOpexHuf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("frame.runway")}</dt>
          <dd className="font-mono tabular-nums">
            {sim.runway == null ? "—" : `${sim.runway.toFixed(1)} ${t("school.monthUnit")}`}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("school.playShock")}</dt>
          <dd className="font-mono tabular-nums">{shock}%</dd>
        </div>
      </dl>
      <label className="block space-y-1">
        <span className="text-[11px] text-muted-foreground">{t("school.playShockHint")}</span>
        <input
          type="range"
          min={-40}
          max={40}
          step={5}
          value={shock}
          onChange={(e) => setShock(Number(e.target.value))}
          className="w-full"
        />
      </label>
      <PathChart pess={sim.pess} real={sim.real} opt={sim.opt} label={t("school.packPlayKicker")} />
      <div className="grid gap-3 sm:grid-cols-2">
        <figure className="rounded-xl border border-border/60 bg-background p-2">
          <figcaption className="px-1 text-[11px] font-semibold text-muted-foreground">{t("frame.shotPd")}</figcaption>
          <img src={pack.shots.pd} alt={t("frame.shotPd")} className="mt-1 w-full rounded-md bg-background" />
        </figure>
        <figure className="rounded-xl border border-border/60 bg-background p-2">
          <figcaption className="px-1 text-[11px] font-semibold text-muted-foreground">{t("frame.shotCa")}</figcaption>
          <img src={pack.shots.ca} alt={t("frame.shotCa")} className="mt-1 w-full rounded-md bg-background" />
        </figure>
      </div>
      <ul className="space-y-1 text-[11px] text-muted-foreground">
        {study.costMix.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-2">
            <span>{row.label}</span>
            <span className="rounded bg-background px-1.5 py-0.5 font-mono tabular-nums text-foreground">
              {row.sharePct}%
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
