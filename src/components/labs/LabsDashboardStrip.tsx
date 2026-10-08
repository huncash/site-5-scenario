import { CapacityHudBar } from "@/components/labs/CapacityHudBar";
import { LabActiveDot } from "@/components/labs/LabActiveDot";
import { useDashboardLab } from "@/hooks/useDashboardLabs";
import { useEntitled } from "@/hooks/useEntitlement";
import { useLabsEngines } from "@/hooks/useLabsEngines";
import { useI18n } from "@/i18n";
import {
  DASHBOARD_LABS,
  dashboardLabById,
  labChipVisible,
  resolveLabSurface,
  type DashboardLabId,
} from "@/lib/dashboardLabs";
import { requestLabFocus, requestSzummaEnter } from "@/lib/labFocus";
import { labsModuleById } from "@/lib/labsTechTree";
import { isLocalDevHost } from "@/lib/license";
import { cn } from "@/lib/utils";

function LabStripChip({ id, engineOn }: { id: DashboardLabId; engineOn: boolean }) {
  const { t } = useI18n();
  const lab = dashboardLabById(id);
  const { isOpen, setOpen } = useDashboardLab(id);
  const entitled = useEntitled(id);
  const onDashboard = resolveLabSurface({
    entitled: entitled || isLocalDevHost(),
    pipedToDashboard: isOpen,
  }).onDashboard;
  if (!labChipVisible(id, { engineOn, onDashboard })) return null;

  const onChip = () => {
    if (!onDashboard) setOpen(true);
    if (id === "labs-szumma") requestSzummaEnter();
    requestLabFocus(id);
  };

  return (
    <li>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold",
          onDashboard
            ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-500/20 dark:text-emerald-300"
            : "border-border/70 bg-card/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
        )}
        title={t("labs.activeHint", {
          label: t(lab.labelKey),
          status: onDashboard ? t("labs.active") : t("labs.preview"),
        })}
        onClick={onChip}
      >
        {onDashboard ? <LabActiveDot /> : null}
        {t(lab.chipKey)}
      </button>
    </li>
  );
}

export function LabsDashboardStrip({
  workspaceIds = [],
  profileCount = 1,
}: {
  workspaceIds?: readonly string[];
  profileCount?: number;
}) {
  const { t } = useI18n();
  const { on: engines } = useLabsEngines();

  return (
    <div
      data-labs-dashboard-strip=""
      className="flex min-w-0 w-full flex-wrap items-center gap-x-2 gap-y-1 py-0.5"
    >
    <ul
      className="flex min-w-0 flex-wrap items-center gap-1.5"
      aria-label={t("labs.activeAria")}
    >
      <li>
        <span
          className="inline-flex items-center gap-1.5 rounded-md border border-cyan-400/40 bg-cyan-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-800 dark:text-cyan-200"
          title={t("labs.coreHint")}
        >
          <LabActiveDot className="bg-cyan-500" />
          {t("labs.coreLabel")}
        </span>
      </li>
      {DASHBOARD_LABS.map((lab) => (
        <LabStripChip key={lab.id} id={lab.id} engineOn={engines[labsModuleById(lab.id).engine]} />
      ))}
    </ul>
      <CapacityHudBar compact workspaceIds={workspaceIds} profileCount={profileCount} />
    </div>
  );
}
