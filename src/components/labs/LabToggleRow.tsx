import { useNavigate } from "@tanstack/react-router";

import { LabActiveDot } from "@/components/labs/LabActiveDot";
import { LAB_ICON } from "@/components/labs/labIcons";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n";
import { useDashboardLab } from "@/hooks/useDashboardLabs";
import { useEntitled, useEntitlementGuard } from "@/hooks/useEntitlement";
import { dashboardLabById, labShowsOnDashboard, resolveLabSurface, type DashboardLabId } from "@/lib/dashboardLabs";
import { labAccessKind, labAccessReasonHu } from "@/lib/entitlement";
import { ensureDashboardHome, requestLabFocus, requestSzummaEnter } from "@/lib/labFocus";
import { langSearch } from "@/lib/langSearch";
import { isLocalDevHost } from "@/lib/license";
import { toast } from "sonner";

export function LabToggleRow({ id }: { id: DashboardLabId }) {
  const { t } = useI18n();
  const lab = dashboardLabById(id);
  const { isOpen, setOpen } = useDashboardLab(id);
  const entitled = useEntitled(id);
  const { requestEnable } = useEntitlementGuard();
  const navigate = useNavigate();
  const localTest = isLocalDevHost();
  const canPipe = entitled || localTest;
  const ready = labShowsOnDashboard(id);
  const surface = resolveLabSurface({ entitled: canPipe, pipedToDashboard: isOpen });
  const kind = labAccessKind(id);
  const reason = labAccessReasonHu(kind !== "none" ? kind : localTest && isOpen ? "local" : "none");
  const checked = ready && surface.onDashboard;
  const Icon = LAB_ICON[id];

  const afterPiped = () => {
    if (id === "labs-szumma") requestSzummaEnter();
    requestLabFocus(id);
    ensureDashboardHome();
    void navigate({ to: "/", search: langSearch() });
  };

  const tryEnable = () => {
    if (!ready) {
      toast.message(t("labs.comingSoonToast"));
      return;
    }
    if (canPipe) {
      setOpen(true);
      afterPiped();
      return;
    }
    requestEnable(id, () => {
      setOpen(true);
      afterPiped();
    });
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card/80 text-foreground">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="text-sm font-medium">{t(lab.labelKey)}</div>
          {checked ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
              <LabActiveDot />
              {t("labs.active")}
              {reason ? <span className="font-medium normal-case tracking-normal text-emerald-800/80 dark:text-emerald-200/80">· {reason}</span> : null}
            </span>
          ) : (
            <button
              type="button"
              className="rounded-md border border-border/70 bg-card/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              onClick={tryEnable}
            >
              {ready ? t("labs.preview") : t("labs.prep")}
            </button>
          )}
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-foreground/80">{t(lab.valueKey)}</p>
      </div>
      <Switch
        checked={checked}
        disabled={!ready}
        onCheckedChange={(on) => {
          if (!on) {
            setOpen(false);
            return;
          }
          tryEnable();
        }}
        aria-label={t(lab.labelKey)}
      />
    </div>
  );
}
