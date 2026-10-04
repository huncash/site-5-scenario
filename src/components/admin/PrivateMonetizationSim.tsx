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

import { Button } from "@/components/ui/button";
import {
  formatHufBand,
  formatUsdBand,
  MARKET_CONTROL_MATRIX,
  OURS_ENTERPRISE_PERPETUAL_HUF,
  OURS_PRO_PERPETUAL_HUF,
  OURS_SOLO_PERPETUAL_HUF,
  PERPETUAL_COMPETITORS,
  PERPETUAL_MARKET_PRO_MID_HUF,
  SAAS_COMPETITORS,
  SAAS_CONTROL_SEAT_MONTHLY_HUF,
  type MarketTier,
  type PerpetualPriceBand,
  type SaasPriceBand,
} from "@/lib/private/marketControls";
import {
  enterpriseBaselineSliders,
  perpetualBaselineSliders,
  PRIVATE_MONETIZATION_CASE,
  subscriptionBaselineSliders,
} from "@/lib/private/monetizationCase";
import {
  simulateEnterpriseSlot,
  simulatePerpetualSlot,
  simulateSubscriptionSlot,
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

function saasBandLabel(band: SaasPriceBand): string {
  const usd = formatUsdBand(band.monthlyUsd.min, band.monthlyUsd.max, " / hó");
  if (!band.monthlyHuf) return usd;
  return `${usd} · ${formatHufBand(band.monthlyHuf.min, band.monthlyHuf.max, "/hó")}`;
}

function perpetualBandLabel(band: PerpetualPriceBand): string {
  const suffix = band.billing === "annual" ? " / év" : " egyszeri";
  const usd = formatUsdBand(band.usd.min, band.usd.max, suffix);
  if (!band.huf) return usd;
  return `${usd} · ${formatHufBand(band.huf.min, band.huf.max, band.billing === "annual" ? "/év" : "")}`;
}

const TIER_LABEL: Record<MarketTier, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

function MarketMatrix() {
  return (
    <section className="overflow-x-auto rounded-xl border border-border/60 bg-card/40">
      <div className="border-b border-border/50 px-4 py-3">
        <h2 className="text-sm font-semibold">Összegző mátrix — piaci kontroll vs. a mi árazásunk</h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Publikus versenytárs-árak (LivePlan, Brixx, Causal · TablePlus/Sublime, Quantrix, JetBrains)
          leképezve Starter / Pro / Enterprise szintre.
        </p>
      </div>
      <table className="w-full min-w-[640px] text-left text-[12px]">
        <thead className="bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Csomag</th>
            <th className="px-3 py-2 font-medium">1. SaaS piaci átlag</th>
            <th className="px-3 py-2 font-medium">2. Örökös / local-first</th>
            <th className="px-3 py-2 font-medium">A mi Szcenárió árazásunk</th>
          </tr>
        </thead>
        <tbody>
          {MARKET_CONTROL_MATRIX.map((row) => (
            <tr key={row.tier} className="border-t border-border/40">
              <td className="px-3 py-2.5 font-semibold text-foreground">{row.label}</td>
              <td className="px-3 py-2.5 text-muted-foreground">
                <div className="font-mono text-foreground">
                  {formatHufBand(row.saasMonthlyHuf.min, row.saasMonthlyHuf.max, "/hó")}
                </div>
                <div className="mt-0.5 text-[11px]">{row.saasNote}</div>
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {row.perpetualOnceHuf ? (
                  <div className="font-mono text-foreground">
                    {formatHufBand(row.perpetualOnceHuf.min, row.perpetualOnceHuf.max, " egyszeri")}
                  </div>
                ) : (
                  <div className="font-mono text-foreground">éves / egyedi</div>
                )}
                <div className="mt-0.5 text-[11px]">{row.perpetualNote}</div>
              </td>
              <td className="px-3 py-2.5">
                <div className="font-mono font-medium text-amber-200/90">
                  {row.ours.priceHuf != null
                    ? `${row.ours.priceHuf.toLocaleString("hu-HU")} Ft egyszeri`
                    : "—"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{row.ours.detail}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function CompetitorPanels() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-emerald-500/25 bg-card/40 p-4">
        <h3 className="text-sm font-semibold text-emerald-400">1. Stratégia: Klasszikus SaaS</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Adat a szolgáltató felhőjében · havi/éves díj · előfizetés nélkül leáll.
        </p>
        <ul className="mt-3 space-y-3">
          {SAAS_COMPETITORS.map((c) => (
            <li key={c.id} className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
              <div className="text-[13px] font-semibold">{c.name}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.blurb}</p>
              <dl className="mt-2 space-y-1.5">
                {(Object.keys(TIER_LABEL) as MarketTier[]).map((tier) => {
                  const band = c.tiers[tier];
                  return (
                    <div key={tier} className="grid grid-cols-[5.5rem_1fr] gap-2 text-[11px]">
                      <dt className="text-muted-foreground">{TIER_LABEL[tier]}</dt>
                      <dd className="font-mono text-foreground">
                        {band ? (
                          <>
                            {saasBandLabel(band)}
                            <span className="mt-0.5 block font-sans text-[10px] text-muted-foreground">
                              {band.note}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-sky-500/25 bg-card/40 p-4">
        <h3 className="text-sm font-semibold text-sky-400">2. Stratégia: Örökös / local-first</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Saját gépen fut · megvásárolt verzió örökre · opcionális éves frissítés.
        </p>
        <ul className="mt-3 space-y-3">
          {PERPETUAL_COMPETITORS.map((c) => (
            <li key={c.id} className="rounded-lg border border-border/50 bg-background/40 px-3 py-2.5">
              <div className="text-[13px] font-semibold">{c.name}</div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{c.blurb}</p>
              <dl className="mt-2 space-y-1.5">
                {(Object.keys(TIER_LABEL) as MarketTier[]).map((tier) => {
                  const band = c.tiers[tier];
                  return (
                    <div key={tier} className="grid grid-cols-[5.5rem_1fr] gap-2 text-[11px]">
                      <dt className="text-muted-foreground">{TIER_LABEL[tier]}</dt>
                      <dd className="font-mono text-foreground">
                        {band ? (
                          <>
                            {perpetualBandLabel(band)}
                            <span className="mt-0.5 block font-sans text-[10px] text-muted-foreground">
                              {band.note}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Nincs külön starter</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function PrivateMonetizationSim() {
  const [sub, setSub] = useState(subscriptionBaselineSliders);
  const [perp, setPerp] = useState(perpetualBaselineSliders);
  const [ent, setEnt] = useState(enterpriseBaselineSliders);

  const subResult = useMemo(() => simulateSubscriptionSlot(sub), [sub]);
  const perpResult = useMemo(() => simulatePerpetualSlot(perp), [perp]);
  const entResult = useMemo(() => simulateEnterpriseSlot(ent), [ent]);

  const handleReset = () => {
    setSub(subscriptionBaselineSliders());
    setPerp(perpetualBaselineSliders());
    setEnt(enterpriseBaselineSliders());
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
            halmozott nettó (bevétel − CAC). Piaci kontroll-alap a publikus SaaS / örökös árazásokból.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
          Csúszkák alaphelyzetbe
        </Button>
      </div>

      <MarketMatrix />
      <CompetitorPanels />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            setSub((s) => ({
              ...s,
              seatPriceMonthly: MARKET_CONTROL_MATRIX[0]!.saasMonthlyHuf.max,
            }))
          }
        >
          SaaS Starter kontroll (15 e Ft/hó)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setSub((s) => ({ ...s, seatPriceMonthly: SAAS_CONTROL_SEAT_MONTHLY_HUF }))}
        >
          SaaS Pro kontroll (Causal 92 e Ft/hó)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setPerp((s) => ({ ...s, perpetualPrice: PERPETUAL_MARKET_PRO_MID_HUF }))}
        >
          Örökös piaci Pro közép (200 e Ft)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setPerp((s) => ({ ...s, perpetualPrice: OURS_SOLO_PERPETUAL_HUF }))}
        >
          Solo listaárunk (199 e Ft)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setPerp((s) => ({ ...s, perpetualPrice: OURS_PRO_PERPETUAL_HUF }))}
        >
          Pro listaárunk (399 e Ft)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setEnt((s) => ({ ...s, basePackagePrice: OURS_ENTERPRISE_PERPETUAL_HUF }))}
        >
          Enterprise listaárunk (799 e Ft)
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="border-b border-border/50 pb-2 text-sm font-semibold text-emerald-400">
            {PRIVATE_MONETIZATION_CASE.slot1.name}
          </h2>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Havi Seat ár (SaaS kontroll)</span>
              <span className="font-mono text-foreground">
                {sub.seatPriceMonthly.toLocaleString("hu-HU")} Ft/hó
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={250_000}
              step={1_000}
              value={sub.seatPriceMonthly}
              onChange={(e) => setSub((s) => ({ ...s, seatPriceMonthly: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Havi organic növekedés</span>
              <span className="font-mono text-foreground">{sub.monthlyGrowthRatePct}% / hó</span>
            </span>
            <input
              type="range"
              min={1}
              max={25}
              step={0.5}
              value={sub.monthlyGrowthRatePct}
              onChange={(e) =>
                setSub((s) => ({ ...s, monthlyGrowthRatePct: Number(e.target.value) }))
              }
              className="w-full accent-emerald-500"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Havi churn</span>
              <span className="font-mono text-foreground">{sub.churnRatePct}%</span>
            </span>
            <input
              type="range"
              min={0.1}
              max={8}
              step={0.1}
              value={sub.churnRatePct}
              onChange={(e) => setSub((s) => ({ ...s, churnRatePct: Number(e.target.value) }))}
              className="w-full accent-emerald-500"
            />
          </label>
          <ProLinesChart data={subResult.chart} />
          <EndStats result={subResult} />
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4">
          <h2 className="border-b border-border/50 pb-2 text-sm font-semibold text-sky-400">
            {PRIVATE_MONETIZATION_CASE.slot2.name}
          </h2>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Örökös licenc ár</span>
              <span className="font-mono text-foreground">
                {perp.perpetualPrice.toLocaleString("hu-HU")} Ft
              </span>
            </span>
            <input
              type="range"
              min={22_000}
              max={1_000_000}
              step={1_000}
              value={perp.perpetualPrice}
              onChange={(e) => setPerp((s) => ({ ...s, perpetualPrice: Number(e.target.value) }))}
              className="w-full accent-sky-500"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Éves frissítési arány (2. &amp; 3. év)</span>
              <span className="font-mono text-foreground">{perp.renewalRatePct}%</span>
            </span>
            <input
              type="range"
              min={30}
              max={95}
              step={5}
              value={perp.renewalRatePct}
              onChange={(e) => setPerp((s) => ({ ...s, renewalRatePct: Number(e.target.value) }))}
              className="w-full accent-sky-500"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Hűséglétra:{" "}
            <span className="font-mono text-foreground">
              {PRIVATE_MONETIZATION_CASE.slot2.baseValues.maintenanceFeeY2.toLocaleString("hu-HU")} Ft (2. év)
            </span>
            {" · "}
            <span className="font-mono text-foreground">
              {PRIVATE_MONETIZATION_CASE.slot2.baseValues.maintenanceFeeY3.toLocaleString("hu-HU")} Ft (3. év)
            </span>
            {" · "}
            <span className="font-mono text-foreground">0 Ft (4. évtől)</span>.
          </p>
          <ProLinesChart data={perpResult.chart} />
          <EndStats result={perpResult} />
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card/40 p-4 lg:col-span-2 xl:col-span-1">
          <h2 className="border-b border-border/50 pb-2 text-sm font-semibold text-amber-300">
            {PRIVATE_MONETIZATION_CASE.slot3.name}
          </h2>
          <p className="text-[11px] leading-snug text-muted-foreground">
            {PRIVATE_MONETIZATION_CASE.slot3.description}
          </p>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Alap Enterprise ár (örökös)</span>
              <span className="font-mono text-foreground">
                {ent.basePackagePrice.toLocaleString("hu-HU")} Ft
              </span>
            </span>
            <input
              type="range"
              min={399_000}
              max={2_500_000}
              step={10_000}
              value={ent.basePackagePrice}
              onChange={(e) => setEnt((s) => ({ ...s, basePackagePrice: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Várható havi Enterprise értékesítés</span>
              <span className="font-mono text-foreground">{ent.monthlySalesVolume} db/hó</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={12}
              step={0.5}
              value={ent.monthlySalesVolume}
              onChange={(e) => setEnt((s) => ({ ...s, monthlySalesVolume: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <label className="block space-y-1 text-xs text-muted-foreground">
            <span className="flex justify-between gap-2">
              <span>Éves frissítési megújítási arány</span>
              <span className="font-mono text-foreground">{ent.renewalRatePct}%</span>
            </span>
            <input
              type="range"
              min={50}
              max={98}
              step={1}
              value={ent.renewalRatePct}
              onChange={(e) => setEnt((s) => ({ ...s, renewalRatePct: Number(e.target.value) }))}
              className="w-full accent-amber-400"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Alapcsomag: 5 Aktív Case · 4 Aktív Slot/Case · 3 Seat + 20 Guest · JIT{" "}
            <span className="font-mono text-foreground">
              +{PRIVATE_MONETIZATION_CASE.slot3.baseValues.extraCasePrice.toLocaleString("hu-HU")} Ft/Case
            </span>
            {" · "}
            <span className="font-mono text-foreground">
              +{PRIVATE_MONETIZATION_CASE.slot3.baseValues.extraSeatPrice.toLocaleString("hu-HU")} Ft/Seat
            </span>
            {" · "}
            <span className="font-mono text-foreground">
              +{PRIVATE_MONETIZATION_CASE.slot3.baseValues.extraSlotPrice.toLocaleString("hu-HU")} Ft/Slot
            </span>
            . Hűséglétra:{" "}
            <span className="font-mono text-foreground">
              {PRIVATE_MONETIZATION_CASE.slot3.baseValues.maintenanceFeeY2.toLocaleString("hu-HU")} /
              {PRIVATE_MONETIZATION_CASE.slot3.baseValues.maintenanceFeeY3.toLocaleString("hu-HU")} / 0 Ft
            </span>
            .
          </p>
          <ProLinesChart data={entResult.chart} />
          <EndStats result={entResult} />
        </section>
      </div>

      <aside className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
        <strong className="text-amber-200/90">Konklúzió:</strong> Pro 399 e Ft és Enterprise 799 e Ft
        egyszeri listaáron önkiszolgáló — nincs „keressen minket” súrlódás. A 3. slot a multi-seat
        volumennel mutatja a 36 hónapos nettó pályát (P-R-O).
      </aside>

      <p className="text-xs text-muted-foreground">
        A három görbe egyidejűleg futó P-R-O sáv (nem párhuzamos pálya-állítás). A band-szorzók a
        növekedés / churn / renewal érzékenységét modellezik a csúszkaértékek körül.
      </p>
    </div>
  );
}
