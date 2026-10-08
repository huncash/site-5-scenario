/**
 * N-unique anonymous Guest Code Slot pool.
 * Zero PII: no email/name — only opaque codes + optional local password on the Guest device.
 */

import { PLANS_CONFIG, isPublicPlanId, type PublicPlanId } from "@/config/plans";
import { ADVISOR_GUEST_FRAME, hasAdvisorDesk } from "@/lib/advisorDesk";
import { readLicense } from "@/lib/license";
import { normalizeTierId, type SlotTierId } from "@/lib/scenarioSlots";
import { sha256Hex } from "@/lib/hash";

type TierId = PublicPlanId;

export type GuestCodeSlot = {
  /** 1-based slot index (#01 …). */
  index: number;
  /** Full code e.g. GUEST-8F3K-01 — null while unused. */
  code: string | null;
  /** Short fragment for watermark e.g. 8F3K. */
  fragment: string | null;
  createdAt: string | null;
  revokedAt: string | null;
};

export type GuestSessionClaim = {
  code: string;
  sessionId: string;
  slotIndex: number;
  fragment: string;
  claimedAt: number;
};

const POOL_KEY = "szcenario_guest_code_slots_v1";
const CLAIM_KEY = "szcenario_guest_session_claim_v1";
const ACTIVE_KEY = "szcenario_guest_active_v1";
const LOCAL_PW_PREFIX = "szcenario_guest_local_pw_v1:";
const CHANNEL = "szcenario-guest-session";
const EVENT_POOL = "szcenario:guest_slots";
const EVENT_KICK = "szcenario:guest_session_kick";

/** Unique Guest Code slots per plan (not Seat count) — PLANS_CONFIG.guests. */
export const GUEST_CODE_SLOTS_PER_TIER: Record<TierId, number> = {
  starter: PLANS_CONFIG.starter.quotas.guests,
  pro: PLANS_CONFIG.pro.quotas.guests,
  expert: PLANS_CONFIG.expert.quotas.guests,
};

export function guestCodeSlotsForTier(tier: SlotTierId): number {
  let base = PLANS_CONFIG.demo.quotas.guests;
  if (tier === "campus") base = PLANS_CONFIG.campus.quotas.guests;
  else if (tier === "local") base = PLANS_CONFIG.local.quotas.guests;
  else if (isPublicPlanId(tier)) base = PLANS_CONFIG[tier].quotas.guests;
  return hasAdvisorDesk() ? Math.max(base, ADVISOR_GUEST_FRAME) : base;
}

export function resolveGuestTier(): SlotTierId {
  const lic = readLicense();
  return normalizeTierId(lic?.tier ?? "starter");
}

function emptySlot(index: number): GuestCodeSlot {
  return { index, code: null, fragment: null, createdAt: null, revokedAt: null };
}

function loadPoolRaw(): GuestCodeSlot[] {
  try {
    const raw = localStorage.getItem(POOL_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as GuestCodeSlot[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function savePool(rows: GuestCodeSlot[]): void {
  localStorage.setItem(POOL_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_POOL));
}

function randomFragment(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function formatCode(fragment: string, index: number): string {
  return `GUEST-${fragment}-${String(index).padStart(2, "0")}`;
}

/** Ensure pool length matches tier; keep existing codes. */
export function ensureGuestSlotPool(tier: SlotTierId = resolveGuestTier()): GuestCodeSlot[] {
  const limit = guestCodeSlotsForTier(tier);
  const prev = loadPoolRaw();
  const byIndex = new Map(prev.map((s) => [s.index, s]));
  const next: GuestCodeSlot[] = [];
  for (let i = 1; i <= limit; i++) {
    next.push(byIndex.get(i) ?? emptySlot(i));
  }
  savePool(next);
  return next;
}

export function listGuestSlots(tier: SlotTierId = resolveGuestTier()): GuestCodeSlot[] {
  return ensureGuestSlotPool(tier);
}

export function countActiveGuestCodes(tier: SlotTierId = resolveGuestTier()): number {
  return listGuestSlots(tier).filter((s) => s.code && !s.revokedAt).length;
}

export function findGuestSlotByCode(code: string): GuestCodeSlot | null {
  const t = normalizeGuestCode(code);
  if (!t) return null;
  return loadPoolRaw().find((s) => s.code === t) ?? null;
}

export function normalizeGuestCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function parseGuestCode(code: string): { fragment: string; index: number } | null {
  const m = /^GUEST-([A-Z0-9]{4})-(\d{2})$/.exec(normalizeGuestCode(code));
  if (!m) return null;
  return { fragment: m[1], index: Number(m[2]) };
}

export type GenerateGuestCodeResult =
  | { ok: true; slot: GuestCodeSlot }
  | { ok: false; reason: "invalid_index" | "already_active" | "pool_full" };

/** Generate or regenerate code for a specific Guest Slot index. */
export function generateGuestCodeForSlot(
  index: number,
  tier: SlotTierId = resolveGuestTier(),
): GenerateGuestCodeResult {
  const pool = ensureGuestSlotPool(tier);
  const slot = pool.find((s) => s.index === index);
  if (!slot) return { ok: false, reason: "invalid_index" };
  if (slot.code && !slot.revokedAt) return { ok: false, reason: "already_active" };

  const fragment = randomFragment();
  const code = formatCode(fragment, index);
  const updated: GuestCodeSlot = {
    index,
    code,
    fragment,
    createdAt: new Date().toISOString(),
    revokedAt: null,
  };
  savePool(pool.map((s) => (s.index === index ? updated : s)));
  return { ok: true, slot: updated };
}

/** First unused / revoked slot — Seat one-click generate. */
export function generateNextGuestCode(tier: SlotTierId = resolveGuestTier()): GenerateGuestCodeResult {
  const pool = ensureGuestSlotPool(tier);
  const free = pool.find((s) => !s.code || s.revokedAt);
  if (!free) return { ok: false, reason: "pool_full" };
  return generateGuestCodeForSlot(free.index, tier);
}

export function revokeGuestCode(code: string): boolean {
  const t = normalizeGuestCode(code);
  const pool = loadPoolRaw();
  const i = pool.findIndex((s) => s.code === t);
  if (i < 0) return false;
  if (pool[i].revokedAt) return true;
  pool[i] = { ...pool[i], revokedAt: new Date().toISOString() };
  savePool(pool);
  kickGuestSessionsForCode(t, "revoked");
  return true;
}

export function revokeGuestSlotIndex(index: number): boolean {
  const pool = loadPoolRaw();
  const i = pool.findIndex((s) => s.index === index);
  if (i < 0 || !pool[i].code) return false;
  return revokeGuestCode(pool[i].code!);
}

export function isGuestCodeActive(code: string): boolean {
  const slot = findGuestSlotByCode(code);
  if (!slot) {
    // Vendég eszközön nincs Seat-pool: formai ellenőrzés elegendő a belépéshez.
    return Boolean(parseGuestCode(code));
  }
  return Boolean(slot.code && !slot.revokedAt);
}

export function guestWatermarkLabel(
  claim: Pick<GuestSessionClaim, "slotIndex" | "fragment" | "code">,
): string {
  const code = claim.code ?? `GUEST-${claim.fragment}-${String(claim.slotIndex).padStart(2, "0")}`;
  return `KÓD: #${code}`;
}

export function newGuestSessionId(): string {
  return crypto.randomUUID();
}

function readClaimMap(): Record<string, GuestSessionClaim> {
  try {
    const raw = localStorage.getItem(CLAIM_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as Record<string, GuestSessionClaim>;
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

function writeClaimMap(map: Record<string, GuestSessionClaim>): void {
  localStorage.setItem(CLAIM_KEY, JSON.stringify(map));
}

export function readActiveGuestSession(): GuestSessionClaim | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestSessionClaim;
  } catch {
    return null;
  }
}

function writeActiveGuestSession(claim: GuestSessionClaim | null): void {
  if (!claim) localStorage.removeItem(ACTIVE_KEY);
  else localStorage.setItem(ACTIVE_KEY, JSON.stringify(claim));
}

function postKick(code: string, exceptSessionId: string, reason: string): void {
  const detail = { code, exceptSessionId, reason };
  try {
    const ch = new BroadcastChannel(CHANNEL);
    ch.postMessage({ type: "kick", ...detail });
    ch.close();
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(EVENT_KICK, { detail }));
}

export function kickGuestSessionsForCode(code: string, reason: string): void {
  const t = normalizeGuestCode(code);
  const map = readClaimMap();
  delete map[t];
  writeClaimMap(map);
  postKick(t, "", reason);
}

export type ClaimGuestResult =
  | { ok: true; claim: GuestSessionClaim; displaced: boolean }
  | { ok: false; reason: "invalid_code" | "revoked" | "bad_password" };

/**
 * Claim exclusive session for a Guest code (1 concurrent device/session).
 * Displaces any prior claim for the same code.
 */
export async function claimGuestSession(input: {
  code: string;
  localPassword?: string;
  sessionId?: string;
}): Promise<ClaimGuestResult> {
  const code = normalizeGuestCode(input.code);
  const parsed = parseGuestCode(code);
  if (!parsed) return { ok: false, reason: "invalid_code" };

  const localSlot = findGuestSlotByCode(code);
  if (localSlot?.revokedAt) return { ok: false, reason: "revoked" };
  if (localSlot && !localSlot.code) return { ok: false, reason: "invalid_code" };

  const pwCheck = await verifyGuestLocalPassword(code, input.localPassword);
  if (!pwCheck) return { ok: false, reason: "bad_password" };

  if (input.localPassword?.trim()) {
    await setGuestLocalPassword(code, input.localPassword.trim());
  }

  const map = readClaimMap();
  const prev = map[code];
  const displaced = Boolean(prev && prev.sessionId);
  const sessionId = input.sessionId ?? newGuestSessionId();
  const claim: GuestSessionClaim = {
    code,
    sessionId,
    slotIndex: parsed.index,
    fragment: parsed.fragment,
    claimedAt: Date.now(),
  };
  map[code] = claim;
  writeClaimMap(map);
  writeActiveGuestSession(claim);
  if (displaced && prev) {
    postKick(code, sessionId, "taken_over");
  } else {
    postKick(code, sessionId, "claimed");
  }
  return { ok: true, claim, displaced };
}

export function clearActiveGuestSession(): void {
  const active = readActiveGuestSession();
  if (active) {
    const map = readClaimMap();
    if (map[active.code]?.sessionId === active.sessionId) {
      delete map[active.code];
      writeClaimMap(map);
    }
  }
  writeActiveGuestSession(null);
}

export function guestKickMessage(slotIndex: number): string {
  return `A(z) #${String(slotIndex).padStart(2, "0")} azonosítójú vendégkódot egy másik eszközön aktiválták.`;
}

/** Subscribe to pool + kick events. Returns unsubscribe. */
export function subscribeGuestSession(handlers: {
  onKick?: (info: { code: string; exceptSessionId: string; reason: string }) => void;
  onPool?: () => void;
}): () => void {
  const onPool = () => handlers.onPool?.();
  const onKickEv = (e: Event) => {
    const d = (e as CustomEvent).detail as { code: string; exceptSessionId: string; reason: string };
    handlers.onKick?.(d);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === CLAIM_KEY || e.key === ACTIVE_KEY) {
      const active = readActiveGuestSession();
      if (!active) return;
      const map = readClaimMap();
      const claim = map[active.code];
      if (claim && claim.sessionId !== active.sessionId) {
        handlers.onKick?.({
          code: active.code,
          exceptSessionId: claim.sessionId,
          reason: "taken_over",
        });
      }
    }
    if (e.key === POOL_KEY) onPool();
  };

  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = (ev) => {
      const data = ev.data as { type?: string; code?: string; exceptSessionId?: string; reason?: string };
      if (data?.type === "kick" && data.code) {
        handlers.onKick?.({
          code: data.code,
          exceptSessionId: data.exceptSessionId ?? "",
          reason: data.reason ?? "taken_over",
        });
      }
    };
  } catch {
    ch = null;
  }

  window.addEventListener(EVENT_POOL, onPool);
  window.addEventListener(EVENT_KICK, onKickEv);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT_POOL, onPool);
    window.removeEventListener(EVENT_KICK, onKickEv);
    window.removeEventListener("storage", onStorage);
    ch?.close();
  };
}

export async function setGuestLocalPassword(code: string, password: string): Promise<void> {
  const t = normalizeGuestCode(code);
  const hash = await sha256Hex(`${t}::${password}`);
  localStorage.setItem(`${LOCAL_PW_PREFIX}${t}`, hash);
}

export async function verifyGuestLocalPassword(code: string, password?: string): Promise<boolean> {
  const t = normalizeGuestCode(code);
  const stored = localStorage.getItem(`${LOCAL_PW_PREFIX}${t}`);
  if (!stored) return true; // no password set yet
  if (!password?.trim()) return false;
  const hash = await sha256Hex(`${t}::${password.trim()}`);
  return hash === stored;
}

/** Sync marketing capacity numbers (guests field) with code-slot pool. */
export function guestCapacityNote(tier: TierId): string {
  const n = GUEST_CODE_SLOTS_PER_TIER[tier];
  return `${n} unique Guest Code slot`;
}
