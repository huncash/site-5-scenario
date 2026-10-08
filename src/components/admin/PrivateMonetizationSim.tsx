import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EngineInterestPanel } from "@/components/admin/EngineInterestPanel";
import { PricingLegoPanel } from "@/components/admin/PricingLegoPanel";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { loyaltyFeesFromYear1Huf } from "@/config/plans";
import {
  MARKET_CONTROL_MATRIX,
  OURS_ENTERPRISE_PERPETUAL_HUF,
  OURS_PRO_PERPETUAL_HUF,
  OURS_SOLO_PERPETUAL_HUF,
} from "@/lib/private/marketControls";
import {
  optionABaselineSliders,
  optionBBaselineSliders,
  PRIVATE_MONETIZATION_CASE,
} from "@/lib/private/monetizationCase";
import {
  simulateOptionA,
  simulateOptionB,
  simulateTwoPillars,
  type MonetizationSlotResult,
} from "@/lib/private/monetizationEngine";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL } from "@/lib/proChart";
import { formatCurrency } from "@/i18n/currency";

function compactHuf(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Mrd`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)} e`;
  return String(Math.round(n));
}

function EndStats({ result }: { result: MonetizationSlotResult }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
      <div className="rounded-md border border-rose-500/30 bg-rose-500/5 px-2 py-1.5">
        <div className="text-rose-300/90">Pesszimista</div>
        <div className="font-mono text-foreground">{formatCurrency(result.cumulativeEnd.pessimistic)}</div>
      </div>
      <div className="rounded-md border border-sky-500/30 bg-sky-500/5 px-2 py-1.5">
        <div className="text-sky-300/90">Realista</div>
        <div className="font-mono text-foreground">{formatCurrency(result.cumulativeEnd.realistic)}</div>
      </div>
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-1.5">
        <div className="text-emerald-300/90">Optimista</div>
        <div className="font-mono text-foreground">{formatCurrency(result.cumulativeEnd.optimistic)}</div>
      </div>
    </div>
  );
}

function ProLinesChart({ data }: { data: MonetizationSlotResult["chart"] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
          <YAxis
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            width={48}
            tickFormatter={compactHuf}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-popover)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-popover-foreground)",
            }}
            formatter={(v: number) => formatCurrency(Math.round(v))}
            labelFormatter={(lab) => `Hónap: ${lab}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="optimistic"
            name="Optimista"
            className={PRO_LINE_CLASS.opt}
            stroke={PRO_OPT}
            strokeWidth={2.2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="realistic"
            name="Realista"
            className={PRO_LINE_CLASS.real}
            stroke={PRO_REAL}
            strokeWidth={2.2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pessimistic"
            name="Pesszimista"
            className={PRO_LINE_CLASS.pess}
            stroke={PRO_PESS}
            strokeWidth={2.2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarketMatrix() {
  return (
    <section className="rounded-xl border border-white/12 bg-card">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Örökös katalógus
        </div>
        <h2 className="mt-1 text-base font-semibold">Basic · Pro Szcenárió · Enterprise & Csapatok</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Opció A: Y1 örök licenc + 1 év frissítés. Opció B: opcionális Y2 75% · Y3 60% · Y4+ 0. Nincs
          havi díj.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Csomag</TableHead>
            <TableHead>Y1 örök + 1 év</TableHead>
            <TableHead>Y2 / Y3 / Y4+</TableHead>
            <TableHead>Case · Slot · Seat · Guest</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {MARKET_CONTROL_MATRIX.map((row) => (
            <TableRow
              key={row.tier}
              className={row.tier === "pro" ? "bg-amber-500/[0.06]" : undefined}
            >
              <TableCell className="text-[13px] font-semibold">{row.label}</TableCell>
              <TableCell className="text-[12px] font-medium tabular-nums">
                {row.y1.toLocaleString("hu-HU")} Ft
              </TableCell>
              <TableCell className="text-[12px] tabular-nums text-muted-foreground">
                {row.y2.toLocaleString("hu-HU")} · {row.y3.toLocaleString("hu-HU")} · 0 Ft
              </TableCell>
              <TableCell className="text-[12px] tabular-nums">
                {row.cases} · {row.slots} · {row.seats} · {row.guests}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

export function PrivateMonetizationSim() {
  const [optA, setOptA] = useState(optionABaselineSliders);
  const [optB, setOptB] = useState(optionBBaselineSliders);

  const aResult = useMemo(() => simulateOptionA(optA, optB), [optA, optB]);
  const bResult = useMemo(() => simulateOptionB(optA, optB), [optA, optB]);
  const abResult = useMemo(() => simulateTwoPillars(optA, optB), [optA, optB]);
  const fees = loyaltyFeesFromYear1Huf(optA.perpetualPrice);

  const handleReset = () => {
    setOptA(optionABaselineSliders());
    setOptB(optionBBaselineSliders());
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 text-foreground">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <span className="inline-block rounded border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-300">
            Local-only / privát admin
          </span>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{PRIVATE_MONETIZATION_CASE.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {PRIVATE_MONETIZATION_CASE.timeHorizonMonths} hónapos (3 éves) dinamikus P-R-O előrejelzés —
            halmozott nettó (bevétel − CAC). Két pillér: örök + 1 év frissítés (egyszeri vagy 2×60 nap),
            plusz opcionális Y2+ éves csomag. Nincs havi előfizetés.
          </p>
          <a
            href="#lego-matrix"
            className="mt-2 inline-block text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Termék-legó, SWOT, két pillér ↓
          </a>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          Csúszkák alaphelyzetbe
        </Button>
      </div>

      <MarketMatrix />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setOptA((s) => ({ ...s, perpetualPrice: OURS_SOLO_PERPETUAL_HUF }))}
        >
          Basic listaárunk (199 e Ft)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setOptA((s) => ({ ...s, perpetualPrice: OURS_PRO_PERPETUAL_HUF }))}
        >
          Pro listaárunk (399 e Ft)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setOptA((s) => ({ ...s, perpetualPrice: OURS_ENTERPRISE_PERPETUAL_HUF }))}
        >
          Enterprise listaárunk (799 e Ft)
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="border-b border-border/50 pb-2 text-sm font-semibold text-amber-300">
            {PRIVATE_MONETIZATION_CASE.optionA.name}
          </h2>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {PRIVATE_MONETIZATION_CASE.optionA.description}
          </p>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Y1 örök licenc (1 év frissítéssel)</span>
              <span className="font-mono text-foreground">
                {optA.perpetualPrice.toLocaleString("hu-HU")} Ft
              </span>
            </span>
            <input
              type="range"
              min={22_000}
              max={1_000_000}
              step={1_000}
              value={optA.perpetualPrice}
              onChange={(e) => setOptA((s) => ({ ...s, perpetualPrice: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Részletfizetők aránya (2×60 nap)</span>
              <span className="font-mono text-foreground">{Math.round(optA.installmentSharePct)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={optA.installmentSharePct}
              onChange={(e) => setOptA((s) => ({ ...s, installmentSharePct: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Kezdő havi értékesítés</span>
              <span className="font-mono text-foreground">{optA.initialSales} db/hó</span>
            </span>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={optA.initialSales}
              onChange={(e) => setOptA((s) => ({ ...s, initialSales: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Havi értékesítés-növekedés</span>
              <span className="font-mono text-foreground">{optA.salesGrowthPct}% / hó</span>
            </span>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={optA.salesGrowthPct}
              onChange={(e) => setOptA((s) => ({ ...s, salesGrowthPct: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            A maradék {Math.round(100 - optA.installmentSharePct)}% egyszerre fizet. 2. részlet a 60.
            napon.
          </p>
          <ProLinesChart data={aResult.chart} />
          <EndStats result={aResult} />
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="border-b border-border/50 pb-2 text-sm font-semibold text-sky-400">
            {PRIVATE_MONETIZATION_CASE.optionB.name}
          </h2>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {PRIVATE_MONETIZATION_CASE.optionB.description}
          </p>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Y2+ csatlakozási arány (opcionális)</span>
              <span className="font-mono text-foreground">{Math.round(optB.attachRatePct)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={optB.attachRatePct}
              onChange={(e) => setOptB((s) => ({ ...s, attachRatePct: Number(e.target.value) }))}
              className="w-full accent-sky-500"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Évfordulós csomag a telepített bázison:{" "}
            <span className="font-mono text-foreground">{fees.y2.toLocaleString("hu-HU")} Ft (2. év)</span>
            {" · "}
            <span className="font-mono text-foreground">{fees.y3.toLocaleString("hu-HU")} Ft (3. év)</span>
            {" · "}
            <span className="font-mono text-foreground">0 Ft (4. évtől)</span>. Nem kötelező — aki
            kihagyja, az Y1 verzióval marad.
          </p>
          <ProLinesChart data={bResult.chart} />
          <EndStats result={bResult} />
        </section>
      </div>

      <section className="space-y-3 rounded-xl border border-emerald-500/25 bg-card/40 p-4">
        <h2 className="text-sm font-semibold text-emerald-300">Két pillér együtt — 36 hó nettó</h2>
        <ProLinesChart data={abResult.chart} />
        <EndStats result={abResult} />
      </section>

      <EngineInterestPanel
        y1={optA.perpetualPrice}
        installmentSharePct={optA.installmentSharePct}
        attachRatePct={optB.attachRatePct}
      />

      <PricingLegoPanel />

      <aside className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
        <strong className="text-amber-200/90">Konklúzió:</strong> A mért modell csak Opció A (örök + 1
        év, egyszeri vagy 2×60 nap) és Opció B (opcionális Y2+). Nincs havi előfizetéses elsőválasztó
        Pro. A motor-érdeklődés ugyanerre a két pillérre konvertál.
      </aside>

      <p className="text-xs text-muted-foreground">
        A három görbe egyidejűleg futó P-R-O sáv (nem párhuzamos pálya-állítás). A band-szorzók a
        növekedés / értékesítés / Y2+ csatlakozás érzékenységét modellezik a csúszkaértékek körül.
      </p>
    </div>
  );
}
