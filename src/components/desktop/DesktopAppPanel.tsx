import { useEffect, useState } from "react";
import { Info, Monitor } from "lucide-react";

import { AddonModuleDialog } from "@/components/cases/AddonModuleDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n, type MessageKey } from "@/i18n";
import { billCheckoutUrl } from "@/lib/billing";
import {
  canDownloadProDesktop,
  DESKTOP_ROADMAP_PHASES,
  ENTERPRISE_DESKTOP_BLOCKS_WEB,
  PRO_DESKTOP_DOWNLOADS,
  probeDesktopArtifact,
  type DesktopRoadmapPhase,
} from "@/lib/desktopApp";
import { LICENSE_CHANGE_EVENT, readLicense } from "@/lib/license";
import { supportPricingHref } from "@/lib/support";

const PHASE_COPY: Record<DesktopRoadmapPhase, { title: MessageKey; body: MessageKey }> = {
  build: { title: "desktop.phase1Title", body: "desktop.phase1Body" },
  vault: { title: "desktop.phase2Title", body: "desktop.phase2Body" },
  import: { title: "desktop.phase3Title", body: "desktop.phase3Body" },
  sovereign: { title: "desktop.phase4Title", body: "desktop.phase4Body" },
};

export function DesktopAppPanel({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [checked, setChecked] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const [soonOpen, setSoonOpen] = useState(false);
  const [eligible, setEligible] = useState(() => canDownloadProDesktop(readLicense()));
  const [live, setLive] = useState({ windows: false, macos: false });

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

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      probeDesktopArtifact(PRO_DESKTOP_DOWNLOADS.windows.href),
      probeDesktopArtifact(PRO_DESKTOP_DOWNLOADS.macos.href),
    ]).then(([windows, macos]) => {
      if (!cancelled) setLive({ windows, macos });
    });
    return () => {
      cancelled = true;
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
          <div className="mt-4 space-y-2">
            {live.windows || live.macos ? (
              eligible ? (
                <>
                  <div className="text-[13px] font-semibold text-foreground">{t("desktop.downloadCta")}</div>
                  <div className="flex flex-wrap gap-2">
                    {live.windows ? (
                      <Button asChild size="sm" className="btn-cta">
                        <a href={PRO_DESKTOP_DOWNLOADS.windows.href}>{t("desktop.windows")}</a>
                      </Button>
                    ) : null}
                    {live.macos ? (
                      <Button asChild size="sm" className="btn-cta">
                        <a href={PRO_DESKTOP_DOWNLOADS.macos.href}>{t("desktop.macos")}</a>
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
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
                      <a className="underline underline-offset-2" href={supportPricingHref("desktop")}>
                        {t("pricing.moreInfo")}
                      </a>
                    </p>
                  ) : null}
                </>
              )
            ) : (
              <>
                <div className="text-[13px] font-semibold text-foreground">{t("desktop.soonCta")}</div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setSoonOpen(true)}>
                    <Info className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    {t("desktop.windowsSoon")}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setSoonOpen(true)}>
                    <Info className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    {t("desktop.macosSoon")}
                  </Button>
                </div>
              </>
            )}
          </div>
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

      <div className="rounded-xl border border-white/12 bg-card/60 p-4">
        <div className="text-[13px] font-semibold text-foreground">{t("desktop.roadmapTitle")}</div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{t("desktop.roadmapLead")}</p>
        <ol className="mt-3 space-y-2.5">
          {DESKTOP_ROADMAP_PHASES.map((phase) => (
            <li key={phase} className="text-[13px] leading-snug">
              <span className="font-medium text-foreground">{t(PHASE_COPY[phase].title)}</span>
              {compact ? null : (
                <span className="mt-0.5 block text-[12px] text-muted-foreground">
                  {t(PHASE_COPY[phase].body)}
                  {phase === "sovereign" ? (
                    <>
                      {" "}
                      <a className="underline underline-offset-2" href={supportPricingHref("own-line")}>
                        {t("pricing.moreInfo")}
                      </a>
                    </>
                  ) : null}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>

      <Dialog open={soonOpen} onOpenChange={setSoonOpen}>
        <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg tracking-tight">{t("desktop.soonTitle")}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {t("desktop.soonBody")}
              <span className="mt-2 block">{t("desktop.soonNote")}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="btn-cta" onClick={() => setSoonOpen(false)}>
              {t("chrome.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddonModuleDialog
        open={enterpriseOpen}
        title={t("desktop.enterpriseTitle")}
        onOpenChange={setEnterpriseOpen}
      />
    </section>
  );
}
