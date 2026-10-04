import { createFileRoute } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { ProChartCallout, ProChartSketch } from "@/components/home/ProChartExplain";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t } = useI18n();
  return (
    <FunnelShell eyebrow={t("chrome.about")} title={t("brand.whyTitle")} subtitle={t("brand.aboutTagline")}>
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-relaxed text-muted-foreground">
        <p className="text-foreground">{t("brand.aboutLead")}</p>
        <p>{t("brand.whyLead")}</p>
        <p>{t("brand.whyBody")}</p>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t("brand.dailyOpsTitle")}</h2>
          <p>{t("brand.dailyOpsBody")}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{t("brand.aboutProTitle")}</h2>
          <ProChartSketch />
          <ProChartCallout />
          <div className="whitespace-pre-wrap">{t("brand.aboutProBody")}</div>
        </section>

      </div>
    </FunnelShell>
  );
}
