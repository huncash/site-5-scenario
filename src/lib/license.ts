import { billPublicOrigin } from "@/lib/billing";

export type LicenseStatus = "paid" | "invoiced" | "awaiting_transfer" | "local";

export type LicenseEntitlement = {
  token: string;
  tier: string;
  interval: string;
  status: LicenseStatus;
  verifiedAt: string;
};

const KEY = "szcenario_license_v1";

export function readLicense(): LicenseEntitlement | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as LicenseEntitlement;
    if (!t?.token) return null;
    return t;
  } catch {
    return null;
  }
}

export function writeLicense(e: LicenseEntitlement): void {
  localStorage.setItem(KEY, JSON.stringify(e));
}

export function clearLicense(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function hasWorkspaceAccess(): boolean {
  const e = readLicense();
  if (!e) return false;
  return e.status === "paid" || e.status === "invoiced" || e.status === "awaiting_transfer" || e.status === "local";
}

export function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
}

export function isAppWorkspaceHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "app.szcenario.hu" || h.startsWith("app.");
}

export async function verifyBillLicense(token: string): Promise<LicenseEntitlement | null> {
  const t = token.trim();
  if (!t) return null;
  try {
    const url = new URL("/api/billing/license", billPublicOrigin());
    url.searchParams.set("token", t);
    const res = await fetch(url.toString(), { method: "GET" });
    const data = (await res.json()) as {
      ok?: boolean;
      token?: string;
      tier?: string;
      interval?: string;
      status?: string;
    };
    if (!data.ok || !data.token) return null;
    const status = data.status;
    if (status !== "paid" && status !== "invoiced" && status !== "awaiting_transfer") return null;
    const entitlement: LicenseEntitlement = {
      token: data.token,
      tier: String(data.tier ?? ""),
      interval: String(data.interval ?? "yearly"),
      status,
      verifiedAt: new Date().toISOString(),
    };
    writeLicense(entitlement);
    return entitlement;
  } catch {
    return null;
  }
}
