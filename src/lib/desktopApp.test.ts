import { describe, expect, it } from "vitest";

import { hu } from "@/i18n/hu";
import type { LicenseEntitlement } from "@/lib/license";
import {
  canDownloadProDesktop,
  COMPARE_ADDON_MARK,
  desktopArtifactLooksLive,
  ENTERPRISE_DESKTOP_BLOCKS_WEB,
  PRO_DESKTOP_DOWNLOADS,
  probeDesktopArtifact,
} from "@/lib/desktopApp";

function lic(tier: string, status: LicenseEntitlement["status"] = "paid"): LicenseEntitlement {
  return {
    token: "t",
    tier,
    interval: "perpetual",
    status,
    verifiedAt: new Date().toISOString(),
    licenseExpiryDate: null,
  };
}

describe("desktop app strategy", () => {
  it("never lets Enterprise Desktop block the web launch", () => {
    expect(ENTERPRISE_DESKTOP_BLOCKS_WEB).toBe(false);
  });

  it("offers Pro Desktop only for an active Pro or Enterprise license", () => {
    expect(canDownloadProDesktop(null)).toBe(false);
    expect(canDownloadProDesktop(lic("starter"))).toBe(false);
    expect(canDownloadProDesktop(lic("pro", "invoiced"))).toBe(false);
    expect(canDownloadProDesktop(lic("pro"))).toBe(true);
    expect(canDownloadProDesktop(lic("expert"))).toBe(true);
    expect(canDownloadProDesktop(lic("enterprise"))).toBe(true);
    expect(canDownloadProDesktop(lic("pro", "local"))).toBe(true);
    expect(canDownloadProDesktop(lic("local"))).toBe(false);
  });

  it("uses Case / Slot wording without a szcenárió prefix", () => {
    const blob = Object.values(hu.desktop).join(" ");
    expect(blob).toMatch(/Case/);
    expect(blob).toMatch(/Slot/);
    expect(blob).not.toMatch(/szcenárió\s+slot/i);
    expect(blob).not.toMatch(/szcenárió-slot/i);
    expect(hu.desktop.downloadCta).toBe("Desktop App letöltése (Windows / macOS)");
    expect(hu.desktop.windowsSoon).toMatch(/2027/);
    expect(hu.desktop.soonTitle).toMatch(/böngészőben/);

  it("keeps Windows / macOS artifact paths without a Slot szcenárió prefix", () => {
    expect(PRO_DESKTOP_DOWNLOADS.windows.href).toMatch(/Szcenario-Pro-windows/);
    expect(PRO_DESKTOP_DOWNLOADS.macos.href).toMatch(/Szcenario-Pro-macos/);
    expect(COMPARE_ADDON_MARK).toBe("ADDON:");
  });
});
