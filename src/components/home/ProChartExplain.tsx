import { HelpIcon } from "@/components/HelpIcon";
import {
  PRO_CHART_CALLOUT,
  PRO_CHART_WHY,
} from "@/content/branding";

export function ProChartCallout(props: { compact?: boolean; className?: string }) {
  const { compact = false, className } = props;
  return (
    <aside className={className ?? "rounded-xl border border-border/60 bg-card px-4 py-3"}>
      <div className="flex items-start gap-2">
        <p className="min-w-0 text-sm font-semibold text-foreground">{PRO_CHART_CALLOUT}</p>
        <HelpIcon kbId="pro-chart" title="Hogyan értelmezzük a PRO-grafikont?" />
      </div>
      {compact ? null : (
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{PRO_CHART_WHY}</p>
      )}
    </aside>
  );
}

/** Dekoratív PRO-sáv (nem adat). A feliratok a vonalak mellett, nem a vonalon. */
export function ProChartSketch() {
  return (
    <figure className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Pesszimista · Realista · Optimista
      </div>
      <svg viewBox="0 0 360 140" className="mt-3 h-36 w-full" role="img" aria-label="PRO-grafikon vázlat: három pálya">
        <title>PRO-grafikon vázlat</title>
        <line x1="36" y1="12" x2="36" y2="118" stroke="currentColor" strokeOpacity="0.22" />
        <line x1="36" y1="118" x2="348" y2="118" stroke="currentColor" strokeOpacity="0.22" />
        <polyline
          fill="none"
          stroke="#fb7185"
          strokeWidth="2"
          points="36,92 110,98 184,104 258,108 348,112"
        />
        <polyline
          fill="none"
          stroke="var(--accent-color)"
          strokeWidth="2"
          points="36,78 110,70 184,66 258,58 348,52"
        />
        <polyline
          fill="none"
          stroke="var(--accent-emerald, #10b981)"
          strokeWidth="2"
          points="36,70 110,54 184,40 258,28 348,18"
        />
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[#fb7185]" aria-hidden /> Pesszimista
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[var(--accent-color)]" aria-hidden /> Realista
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[var(--accent-emerald,#10b981)]" aria-hidden /> Optimista
        </li>
      </ul>
    </figure>
  );
}
