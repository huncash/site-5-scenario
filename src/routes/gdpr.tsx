import { createFileRoute, Link } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { DATA_CONTROLLER } from "@/content/legal";
import { useI18n } from "@/i18n";

export const Route = createFileRoute("/gdpr")({
  component: GdprPage,
});

function GdprPage() {
  const { t } = useI18n();
  const c = DATA_CONTROLLER;

  return (
    <FunnelShell eyebrow={t("footer.gdpr")} title={t("legal.pageTitle")} subtitle={t("legal.pageLead")}>
      <div className="mx-auto max-w-3xl space-y-8 text-[14px] leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.controllerTitle")}</h2>
          <p className="text-foreground">{c.legalName}</p>
          <p>
            {t("legal.controllerAddress")}: {c.address}
          </p>
          <p>
            {t("legal.controllerTax")}: {c.taxId}
          </p>
          <p>
            {t("legal.controllerContact")}: {c.contactChannel}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.localTitle")}</h2>
          <p>{t("legal.localBody")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.billingTitle")}</h2>
          <p>{t("legal.billingBody")}</p>
          <p>
            {t("legal.billingProcessor")}: {c.invoiceProcessor}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.cookiesTitle")}</h2>
          <p>{t("legal.cookiesBody")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.rightsTitle")}</h2>
          <p>{t("legal.rightsBody")}</p>
          <p>{t("legal.naih")}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t("legal.aiActTitle")}</h2>
          <p>{t("legal.aiActBody")}</p>
        </section>

        <p>
          <Link to="/" className="text-[var(--accent)] underline-offset-4 hover:underline">
            {t("brand.aboutBack")}
          </Link>
        </p>
      </div>
    </FunnelShell>
  );
}
