import { useI18n } from "@/i18n";
import { bisztroDoorPreview } from "@/lib/bisztroPreview";
import { formatMoney } from "@/lib/finance";
import { useLeanView } from "@/lib/leanView";
import { penaltyLabel } from "@/lib/simpleLabels";

export function BisztroRunwayHero({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const { lean } = useLeanView();
  const preview = bisztroDoorPreview();
  return (
    <div
      className={className ?? "rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-6 text-center"}
      data-testid="bisztro-runway-hero"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-200/80">
        {t("door.runwayHeroEyebrow")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t("door.runwayHeroTitle")}</p>
      <p className="mt-1 font-mono text-5xl font-semibold tabular-nums tracking-tight text-emerald-100 sm:text-6xl">
        {preview.runwayMonths}
      </p>
      <p className="mt-1 text-sm font-medium text-emerald-100/90">{t("door.runwayHeroUnit")}</p>
      <p className="mx-auto mt-2 max-w-md text-[12px] leading-snug text-muted-foreground">
        {t("door.runwayHeroHint")}
      </p>
      <dl className="mx-auto mt-4 grid max-w-lg grid-cols-3 gap-2 text-left">
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Runway</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">{preview.runwayMonths} hó</dd>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {penaltyLabel(lean, locale)}
          </dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {formatMoney(preview.exitPenaltyHuf, "HUF")}
          </dd>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 px-2 py-2">
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{t("door.kpiMonthly")}</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-foreground">
            {formatMoney(preview.monthlyObligationHuf, "HUF")}/hó
          </dd>
        </div>
      </dl>
    </div>
  );
}
