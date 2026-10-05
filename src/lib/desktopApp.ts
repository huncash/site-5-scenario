import { resolvePlanId } from "@/config/plans";
import type { LicenseEntitlement } from "@/lib/license";
import { evaluateLicenseGate } from "@/lib/planPermissions";
import { isSchoolHost } from "@/lib/school";

/** Enterprise Desktop soha nem kapu a webes indításhoz. */
export const ENTERPRISE_DESKTOP_BLOCKS_WEB = false as const;

export const COMPARE_ADDON_MARK = "ADDON:";

export const PRO_DESKTOP_DOWNLOADS = {
  windows: {
    href: "/desktop/Szcenario-Pro-windows.msi",
    os: "windows" as const,
  },
  macos: {
    href: "/desktop/Szcenario-Pro-macos.dmg",
    os: "macos" as const,
  },
} as const;

export function canDownloadProDesktop(license: LicenseEntitlement | null): boolean {
  if (typeof window !== "undefined" && isSchoolHost()) return false;
  if (!license) return false;
  if (license.status !== "paid" && license.status !== "local") return false;
  if (!evaluateLicenseGate(license).runtimeOk) return false;
  const raw = (license.tier ?? "").toLowerCase();
  const plan = resolvePlanId(raw === "enterprise" ? "expert" : license.tier);
  return plan === "pro" || plan === "expert";
}
