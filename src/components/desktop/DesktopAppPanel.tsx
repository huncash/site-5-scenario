import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

import { AddonModuleDialog } from "@/components/cases/AddonModuleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
import { canDownloadProDesktop, ENTERPRISE_DESKTOP_BLOCKS_WEB, PRO_DESKTOP_DOWNLOADS } from "@/lib/desktopApp";
import { LICENSE_CHANGE_EVENT, readLicense } from "@/lib/license";
import { supportPricingHref } from "@/lib/support";

export function DesktopAppPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [eligible, setEligible] = useState(() => canDownloadProDesktop(readLicense()));

  useEffect(() => {
    const sync = () => setEligible(canDownloadProDesktop(readLicense()));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(LICENSE_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(LICENSE_CHANGE_EVENT, sync);
    };
  }, []);

  return (
    <section id={compact ? undefined : "desktop"} className="scroll-mt-24 space-y-3">
      {compact ? null : (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("desktop.eyebrow")}
          </div>
          <h2 className="mt-1 max-w-2xl text-pretty text-lg font-semibold leading-snug text-foreground sm:text-xl">
            {t("desktop.title")}
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground">{t("desktop.lead")}</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="flex h-full min-w-0 flex-col rounded-xl border border-amber-300/40 bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" aria-hidden />
            <h3 className="text-base font-semibold text-foreground">{t("desktop.proTitle")}</h3>
            <Badge variant="default">{t("pricing.pro")}</Badge>
          </div>
          <p className="mt-2 flex-1 text-[13px] leading-snug text-muted-foreground">{t("desktop.proBody")}</p>
          {eligible ? (
            <div className="mt-4 space-y-2">
              <div className="text-[13px] font-semibold text-foreground">{t("desktop.downloadCta")}</div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="btn-cta">
                  <a href={PRO_DESKTOP_DOWNLOADS.windows.href}>{t("desktop.windows")}</a>
                </Button>
                <Button asChild size="sm" className="btn-cta">
                  <a href={PRO_DESKTOP_DOWNLOADS.macos.href}>{t("desktop.macos")}</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Button type="button" size="sm" className="btn-cta w-full sm:w-auto" onClick={() => setChecked(true)}>
                {t("desktop.checkCta")}
              </Button>
              {checked ? (
                <p className="text-[12px] text-muted-foreground">
                  {t("desktop.needPro")}{" "}
                  <a className="underline underline-offset-2" href={billCheckoutUrl({ tier: "pro", interval: "yearly" })}>
                    {t("pricing.order")}
                  </a>
                  {" · "}
                  <a className="underline underline-offset-2" href={supportPricingHref("pro")}>
                    {t("pricing.moreInfo")}
                  </a>
                </p>
              ) : null}
            </div>
          )}
        </article>

        <article className="flex h-full min-w-0 flex-col rounded-xl border border-dashed border-white/15 bg-card/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">{t("desktop.enterpriseTitle")}</h3>
            <Badge variant="outline" className="text-[10px] font-medium">
              {t("desktop.enterpriseBadge")}
            </Badge>
          </div>
          <p className="mt-2 flex-1 text-[13px] leading-snug text-muted-foreground">{t("desktop.enterpriseBody")}</p>
          {!ENTERPRISE_DESKTOP_BLOCKS_WEB ? (
            <p className="mt-2 text-[11px] text-muted-foreground">{t("desktop.webUnaffected")}</p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4 w-full sm:w-auto"
            onClick={() => setEnterpriseOpen(true)}
          >
            {t("desktop.enterpriseCta")}
          </Button>
        </article>
      </div>

      <AddonModuleDialog
        open={enterpriseOpen}
        title={t("desktop.enterpriseTitle")}
        onOpenChange={setEnterpriseOpen}
      />
    </section>
  );
}
