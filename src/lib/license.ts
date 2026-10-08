import { ENGINE_VERSION, type JitAddonId } from "@/config/plans";
import { billPublicOrigin } from "@/lib/billing";
import {
  admitLicenseToken,
  FUSION_ERROR_HU,
  lastLicenseFusionError,
  logFusionAttempt,
  readInstanceBind,
} from "@/lib/licenseFusion";
import { installment2ArrearsActive } from "@/lib/installmentPlan";
import {
  activeGiftSlotsFromCredits,
  ensureReferralCode,
  permanentSlotsFromCredits,
  revokeAllReferralCredits,
  writeReferralCode,
} from "@/lib/referral";
import { isSchoolHost } from "@/lib/school";
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
  /** JIT örökös modulok a licencrosteren (Case / Slot / Edge / Seat / vendég). */
  addons?: JitAddonId[];
  /** Extra motorok ugyanazon a tokenen (economic mindig jár). Nem duzzaszt kvótát. */
  engines?: Array<"education" | "resilience">;
  /** Két egyenlő 1. évi részlet. */
  installmentPlan?: boolean;
  installment2Paid?: boolean;
  year1StartedAt?: string;
  installment2DueAt?: string | null;
};

export { FUSION_ERROR_HU, lastLicenseFusionError } from "@/lib/licenseFusion";

const KEY = "szcenario_license_v1";
const LEDGER_KEY = "szcenario_slot_ledger_v1";
export const LICENSE_CHANGE_EVENT = "szcenario:license";

function emitLicenseChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LICENSE_CHANGE_EVENT));
}

function clampSchoolEntitlement(e: LicenseEntitlement): LicenseEntitlement {
  if (!isSchoolHost()) return e;
  return { ...e, tier: "campus", slotPacks: [], permanentSlots: 0 };
}

export function readLicense(): LicenseEntitlement | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const t = JSON.parse(raw) as LicenseEntitlement;
    if (!t?.token) return null;
    const bound = readInstanceBind();
    if (bound && bound.token.trim() !== t.token.trim()) {
      logFusionAttempt({
        ok: false,
        reason: "token_mismatch",
        boundToken: bound.token,
        incomingToken: t.token,
        message: FUSION_ERROR_HU,
      });
      return null;
    }
    return clampSchoolEntitlement(t);
  } catch {
    return null;
  }
}

export function writeLicense(e: LicenseEntitlement): boolean {
  const next = clampSchoolEntitlement(e);
  const admitted = admitLicenseToken(next.token);
  if (!admitted.ok) return false;
  localStorage.setItem(KEY, JSON.stringify(next));
  if (next.referralCode) writeReferralCode(next.referralCode);
  syncLedgerFromLicense(next);
  emitLicenseChange();
  return true;
}

export function clearLicense(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  emitLicenseChange();
}

export function hasWorkspaceAccess(): boolean {
  const e = readLicense();
  if (!e) return false;
  return e.status === "paid" || e.status === "invoiced" || e.status === "awaiting_transfer" || e.status === "local";
}

/** 60. naptól: 2. részlet hátralék — nem zár, csak figyelmeztet. */
export function licenseInstallmentArrears(lic: LicenseEntitlement | null = readLicense(), now = new Date()): boolean {
  if (!lic || lic.status === "local") return false;
  return installment2ArrearsActive(
    {
      installmentPlan: Boolean(lic.installmentPlan),
      installment2Paid: Boolean(lic.installment2Paid),
      year1StartedAt: lic.year1StartedAt ?? lic.verifiedAt,
    },
    now,
  );
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
  if (isSchoolHost()) return emptySlotLedger("campus");
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
  const next = isSchoolHost() ? emptySlotLedger("campus") : ledger;
  localStorage.setItem(LEDGER_KEY, JSON.stringify(next));
  if (typeof window === "undefined") return;
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
    engines: ["education", "resilience"],
  };
  if (!writeLicense(entitlement)) {
    const cur = readLicense();
    if (cur) return cur;
    throw new Error(lastLicenseFusionError() ?? FUSION_ERROR_HU);
  }
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
      installmentPlan?: boolean;
      installment2Paid?: boolean;
      year1StartedAt?: string;
      installment2DueAt?: string;
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
      installmentPlan: Boolean(data.installmentPlan),
      installment2Paid: Boolean(data.installment2Paid),
      year1StartedAt: data.year1StartedAt,
      installment2DueAt: data.installment2DueAt ?? null,
    };
    if (!writeLicense(entitlement)) return null;
    return entitlement;
  } catch {
    return null;
  }
}

export function recordLocalSlotPackPurchase(packId: SlotPackId): SlotLedger {
  if (isSchoolHost()) return readSlotLedger();
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
