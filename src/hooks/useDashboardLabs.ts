import { useDashboardBlockOpen } from "@/hooks/useDashboardBlockOpen";
import { useEntitled } from "@/hooks/useEntitlement";
import {
  labDefaultOnDashboard,
  labShowsOnDashboard,
  resolveLabSurface,
  type DashboardLabId,
} from "@/lib/dashboardLabs";
import { isLocalDevHost } from "@/lib/license";

export function useDashboardLab(id: DashboardLabId) {
  return useDashboardBlockOpen(id, labDefaultOnDashboard(id));
}

/** Alapcsomag / vásárlás, vagy localhoston a teszt-pipa. */
export function useLabOnDashboard(id: DashboardLabId): boolean {
  const { isOpen } = useDashboardLab(id);
  const entitled = useEntitled(id);
  if (!labShowsOnDashboard(id)) return false;
  return resolveLabSurface({
    entitled: entitled || isLocalDevHost(),
    pipedToDashboard: isOpen,
  }).onDashboard;
}

export function useDashboardLabs() {
  return {
    baseline: useLabOnDashboard("labs-baseline"),
    sim: useLabOnDashboard("labs-sim"),
    shock: useLabOnDashboard("labs-shock"),
    advise: useLabOnDashboard("labs-advise"),
    halmozott: useLabOnDashboard("labs-halmozott"),
    szumma: useLabOnDashboard("labs-szumma"),
    edge: useLabOnDashboard("labs-edge"),
    anon: useLabOnDashboard("labs-anon"),
  };
}
