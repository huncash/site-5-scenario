import type { SurvivalGauge } from "@/lib/physicalMetrics";

export function SurvivalGauges(props: { gauges: SurvivalGauge[] }) {
  if (!props.gauges.length) return null;
  return (
    <ul className="surv-gauges">
      {props.gauges.map((g) => {
        const pct = Math.max(2, Math.min(100, (g.remaining / Math.max(0.0001, g.id === "ttr" ? Math.max(g.remaining, g.target) : g.target)) * 100));
        const fillPct = g.id === "ttr" ? Math.max(2, Math.min(100, (g.target / Math.max(0.0001, g.remaining)) * 100)) : pct;
        return (
          <li key={g.id} className="surv-gauge">
            <div className="surv-gauge-head">
              <span className="surv-label-chip">{g.label}</span>
              <span className={`surv-value-chip surv-${g.band}`}>{g.display}</span>
            </div>
            <div className="surv-track" role="meter" aria-label={g.label} aria-valuemin={0} aria-valuemax={g.target} aria-valuenow={g.remaining}>
              <div className={`surv-fill surv-${g.band}`} style={{ width: `${fillPct}%` }} />
            </div>
            <p className="surv-hint">{g.hint}</p>
          </li>
        );
      })}
    </ul>
  );
}
