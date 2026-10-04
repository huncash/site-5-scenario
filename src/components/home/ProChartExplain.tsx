import { HelpIcon } from "@/components/HelpIcon";
import { useI18n } from "@/i18n";
import { PRO_LINE_CLASS, PRO_OPT, PRO_PESS, PRO_REAL, PRO_SWATCH_CLASS } from "@/lib/proChart";

export function ProChartCallout(props: { compact?: boolean; className?: string }) {
  const { compact = false, className } = props;
  const { t } = useI18n();
  return (
    <aside className={className ?? "rounded-xl border border-border/60 bg-card px-4 py-3"}>
      <div className="flex items-start gap-2">
        <p className="min-w-0 text-sm font-semibold text-foreground">{t("brand.proCallout")}</p>
        <HelpIcon kbId="pro-chart" title={t("brand.proSketchAria")} />
      </div>
      {compact ? null : (
        <div className="mt-1.5 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          <p>{t("brand.proWhy")}</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2">
              <span className={PRO_SWATCH_CLASS.opt} aria-hidden />
              <span>{t("brand.proWhyOpt")}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={PRO_SWATCH_CLASS.real} aria-hidden />
              <span>{t("brand.proWhyReal")}</span>
            </li>
            <li className="flex items-center gap-2">
              <span className={PRO_SWATCH_CLASS.pess} aria-hidden />
              <span>{t("brand.proWhyPess")}</span>
            </li>
          </ul>
          <p>{t("brand.proWhyRule")}</p>
        </div>
      )}
    </aside>
  );
}

const SKETCH = {
  pess: { d: "36,92 110,98 184,104 258,108 348,112", marks: [[36, 92], [184, 104], [348, 112]] as const },
  real: { d: "36,78 110,70 184,66 258,58 348,52", marks: [[36, 78], [184, 66], [348, 52]] as const },
  opt: { d: "36,70 110,54 184,40 258,28 348,18", marks: [[36, 70], [184, 40], [348, 18]] as const },
};

/** Dekoratív PRO-sáv (nem adat). A feliratok a vonalak mellett, nem a vonalon. */
export function ProChartSketch() {
  const { t } = useI18n();
  return (
    <figure className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("brand.proSketch")}
      </div>
      <svg viewBox="0 0 360 140" className="mt-3 h-36 w-full" role="img" aria-label={t("brand.proSketchAria")}>
        <title>{t("brand.proSketchAria")}</title>
        <line x1="36" y1="12" x2="36" y2="118" stroke="currentColor" strokeOpacity="0.22" />
        <line x1="36" y1="118" x2="348" y2="118" stroke="currentColor" strokeOpacity="0.22" />
        <polyline
          fill="none"
          className={PRO_LINE_CLASS.pess}
          stroke={PRO_PESS}
          strokeWidth="2.4"
          points={SKETCH.pess.d}
        />
        <polyline
          fill="none"
          className={PRO_LINE_CLASS.real}
          stroke={PRO_REAL}
          strokeWidth="2.4"
          points={SKETCH.real.d}
        />
        <polyline
          fill="none"
          className={PRO_LINE_CLASS.opt}
          stroke={PRO_OPT}
          strokeWidth="2.4"
          points={SKETCH.opt.d}
        />
        {SKETCH.pess.marks.map(([x, y], i) => (
          <circle key={`pess-${i}`} cx={x} cy={y} r="3.2" fill="var(--card-bg)" stroke={PRO_PESS} strokeWidth="1.6" />
        ))}
        {SKETCH.real.marks.map(([x, y], i) => (
          <circle key={`real-${i}`} cx={x} cy={y} r="3.2" fill="var(--card-bg)" stroke={PRO_REAL} strokeWidth="1.6" />
        ))}
        {SKETCH.opt.marks.map(([x, y], i) => (
          <circle key={`opt-${i}`} cx={x} cy={y} r="3.2" fill="var(--card-bg)" stroke={PRO_OPT} strokeWidth="1.6" />
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <li className="inline-flex items-center gap-1.5">
          <span className={PRO_SWATCH_CLASS.pess} aria-hidden /> {t("brand.pess")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className={PRO_SWATCH_CLASS.real} aria-hidden /> {t("brand.real")}
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className={PRO_SWATCH_CLASS.opt} aria-hidden /> {t("brand.opt")}
        </li>
      </ul>
    </figure>
  );
}
