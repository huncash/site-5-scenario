import { ENGINE_VERSION } from "@/config/plans";
import { billPublicOrigin } from "@/lib/billing";
import {
  activeGiftSlotsFromCredits,
  ensureReferralCode,
  permanentSlotsFromCredits,
  revokeAllReferralCredits,
  writeReferralCode,
} from "@/lib/referral";
import {
  addPurchasedPack,
  emptySlotLedger,
  isSlotPackId,
  MAX_REFERRAL_GIFT_SLOTS,
  normalizeTierId,
  setGiftBonusSlots,
  type SlotLedger,
  type SlotPackId,
  type SlotTierId,
} from "@/lib/scenarioSlots";

export type LicenseStatus = "paid" | "invoiced" | "awaiting_transfer" | "local";

export type LicenseEntitlement = {
  token: string;
  tier: string;
  /** @deprecated Perpetual modell — legacy bill mező; „perpetual” / „maintenance”. */
  interval: string;
  status: LicenseStatus;
  verifiedAt: string;
  /** Licencelt motorverzió (semver) — frissítés nélkül efölé nem lép. */
  engineVersion?: string;
  /** Frissítési jogosultság vége (ISO) — included year vagy maintenance. */
  updatesUntil?: string | null;
  /** Runtime lejárat (ISO); null/undefined = örökös használat. */
  licenseExpiryDate?: string | null;
  /** Saját ajánlói kód (bill / helyi). */
  referralCode?: string;
  /** Aktív ajánlói ajándék slotok a bill szerint (páros előfizetés + max 25). */
  permanentSlots?: number;
  /** Megvásárolt bővítő pack id-k ismétléssel. */
  slotPacks?: SlotPackId[];
};

const KEY = "szcenario_license_v1";
const LEDGER_KEY = "szcenario_slot_ledger_v1";

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
  if (e.referralCode) writeReferralCode(e.referralCode);
  syncLedgerFromLicense(e);
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

export function readSlotLedger(): SlotLedger {
  try {
    const raw = localStorage.getItem(LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SlotLedger;
      if (parsed?.tier) return parsed;
    }
  } catch {
    // ignore
  }
  const lic = readLicense();
  const tier = normalizeTierId(lic?.tier ?? (isLocalDevHost() ? "local" : "starter"));
  return emptySlotLedger(tier);
}

export function writeSlotLedger(ledger: SlotLedger): void {
  localStorage.setItem(LEDGER_KEY, JSON.stringify(ledger));
  window.dispatchEvent(new Event("szcenario:slot_ledger"));
}

function giftSlotsActiveForLicense(e: LicenseEntitlement): boolean {
  return e.status === "paid" || e.status === "invoiced" || e.status === "local";
}

function syncLedgerFromLicense(e: LicenseEntitlement): void {
  const tier = normalizeTierId(e.tier) as SlotTierId;
  let ledger = emptySlotLedger(tier);
  for (const pack of e.slotPacks ?? []) {
    if (isSlotPackId(pack)) ledger = addPurchasedPack(ledger, pack, 1);
  }
  if (!giftSlotsActiveForLicense(e)) {
    revokeAllReferralCredits();
    ledger = setGiftBonusSlots(ledger, 0);
    writeSlotLedger(ledger);
    return;
  }
  const bonus = Math.min(
    MAX_REFERRAL_GIFT_SLOTS,
    Math.max(e.permanentSlots ?? 0, activeGiftSlotsFromCredits(), permanentSlotsFromCredits()),
  );
  ledger = setGiftBonusSlots(ledger, bonus);
  writeSlotLedger(ledger);
}

export function grantLocalLicense(tier: SlotTierId = "local"): LicenseEntitlement {
  const code = ensureReferralCode();
  const far = new Date();
  far.setFullYear(far.getFullYear() + 99);
  const entitlement: LicenseEntitlement = {
    token: `local-${code}`,
    tier,
    interval: "perpetual",
    status: "local",
    verifiedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
    updatesUntil: far.toISOString(),
    licenseExpiryDate: null,
    referralCode: code,
    permanentSlots: permanentSlotsFromCredits(),
    slotPacks: [],
  };
  writeLicense(entitlement);
  return entitlement;
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
      referralCode?: string;
      permanentSlots?: number;
      slotPacks?: string[];
    };
    if (!data.ok || !data.token) return null;
    const status = data.status;
    if (status !== "paid" && status !== "invoiced" && status !== "awaiting_transfer") return null;
    const packs = (data.slotPacks ?? []).filter(isSlotPackId);
    const entitlement: LicenseEntitlement = {
      token: data.token,
      tier: String(data.tier ?? ""),
      interval: String(data.interval ?? "yearly"),
      status,
      verifiedAt: new Date().toISOString(),
      referralCode: data.referralCode ?? ensureReferralCode(),
      permanentSlots: Number(data.permanentSlots ?? 0),
      slotPacks: packs,
    };
    writeLicense(entitlement);
    return entitlement;
  } catch {
    return null;
  }
}

export function recordLocalSlotPackPurchase(packId: SlotPackId): SlotLedger {
  const ledger = addPurchasedPack(readSlotLedger(), packId, 1);
  writeSlotLedger(ledger);
  const lic = readLicense();
  if (lic) {
    writeLicense({
      ...lic,
      slotPacks: [...(lic.slotPacks ?? []), packId],
    });
  }
  return ledger;
}
