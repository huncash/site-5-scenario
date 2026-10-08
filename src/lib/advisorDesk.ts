import { ADVISOR_CASE_FRAME, ADVISOR_GUEST_FRAME } from "@/config/plans";
import { isDemoProfileName } from "@/lib/demoSession";
import { readLicense } from "@/lib/license";

export { ADVISOR_CASE_FRAME, ADVISOR_GUEST_FRAME };

export function hasAdvisorDesk(addons = readLicense()?.addons): boolean {
  return (addons ?? []).includes("advisor_desk");
}

/** Demó minták nem terhelik a licenckeretet — egy nyitott demó asztal = 1. */
export function usedLiveCaseCount(profiles: Array<{ name?: string }> | undefined): number {
  const list = profiles ?? [];
  const live = list.filter((p) => !isDemoProfileName(p.name));
  if (live.length > 0) return live.length;
  return list.length ? 1 : 1;
}
