import { Link } from "@tanstack/react-router";

import { BcpPracticeDelta } from "@/components/engine/BcpPracticeDelta";
import { anonymizeEconomicSnapshot } from "@/lib/educationAnonymize";
import { buildEconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import { formatCurrency, useI18n } from "@/i18n";
import { langSearch } from "@/lib/langSearch";

export function LabsMeshDesk() {
  const { t } = useI18n();
  const snap = buildEconomicReadSnapshot({});
  const study = anonymizeEconomicSnapshot(snap);

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/90">{t("labs.meshDesk")}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{t("labs.meshDeskTitle")}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("labs.meshDeskLead")}</p>
        </div>
        <Link
          to="/"
          search={langSearch}
          className="rounded-md border border-border px-3 py-1.5 text-[12px] hover:bg-accent"
        >
          {t("labs.backToStable")}
        </Link>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="rounded-xl border border-border/60 bg-card/70 p-3">
          <h2 className="text-[12px] font-semibold text-foreground">{t("labs.engineEconomic")}</h2>
          <dl className="mt-2 space-y-1.5 text-[12px]">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("frame.reserveDepth")}</dt>
              <dd className="font-mono">{formatCurrency(snap.reserveDepthHuf)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("frame.opex")}</dt>
              <dd className="font-mono">{formatCurrency(snap.monthlyOpexHuf)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("frame.runway")}</dt>
              <dd className="font-mono">
                {snap.runwayMonths == null ? "—" : `${snap.runwayMonths.toFixed(1)} ${t("frame.monthUnit")}`}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-emerald-500/25 bg-card/70 p-3">
          <h2 className="text-[12px] font-semibold text-foreground">{t("labs.engineEducation")}</h2>
          <p className="mt-2 text-[12px] text-muted-foreground">
            {t("frame.studyAlias")}: {study.orgAlias}
          </p>
          <p className="mt-1 font-mono text-[12px]">
            {formatCurrency(study.cashHuf)} · {study.headcountBand}
          </p>
        </section>

        <section className="min-w-0">
          <h2 className="mb-2 text-[12px] font-semibold text-foreground">{t("labs.engineResilience")}</h2>
          <BcpPracticeDelta snapshot={snap} />
        </section>
      </div>
    </div>
  );
}
