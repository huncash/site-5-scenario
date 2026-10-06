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

export const DESKTOP_ROADMAP_PHASES = ["build", "vault", "import", "sovereign"] as const;
export type DesktopRoadmapPhase = (typeof DESKTOP_ROADMAP_PHASES)[number];

/** SPA-fallback HTML / 404 nem számít élő telepítőnek. */
export function desktopArtifactLooksLive(status: number, contentType: string | null | undefined): boolean {
  if (status < 200 || status >= 300) return false;
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("text/html") || ct.includes("application/json") || ct.includes("text/javascript")) return false;
  if (ct.includes("application/") || ct.includes("octet-stream") || ct.includes("binary")) return true;
  return false;
}

export async function probeDesktopArtifact(
  href: string,
  fetchImpl: typeof fetch = fetch,
  origin = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1",
): Promise<boolean> {
  try {
    const url = new URL(href, origin).toString();
    const head = await fetchImpl(url, { method: "HEAD", cache: "no-store" });
    if (desktopArtifactLooksLive(head.status, head.headers.get("content-type"))) return true;
    if (head.status !== 405 && head.status !== 501) return false;
    const get = await fetchImpl(url, {
      method: "GET",
      cache: "no-store",
      headers: { Range: "bytes=0-0" },
    });
    return desktopArtifactLooksLive(get.status, get.headers.get("content-type"));
  } catch {
    return false;
  }
}

export function canDownloadProDesktop(license: LicenseEntitlement | null): boolean {
  if (typeof window !== "undefined" && isSchoolHost()) return false;
  if (!license) return false;
  if (license.status !== "paid" && license.status !== "local") return false;
  if (!evaluateLicenseGate(license).runtimeOk) return false;
  const raw = (license.tier ?? "").toLowerCase();
  const plan = resolvePlanId(raw === "enterprise" ? "expert" : license.tier);
  return plan === "pro" || plan === "expert";
}
