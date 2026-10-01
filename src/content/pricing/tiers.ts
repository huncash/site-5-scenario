export type TierId = "starter" | "pro" | "expert";

export type TierCore = {
  id: TierId;
  /** Short label used in UI (must be stable across funnels). */
  label: string;
  /** Optional badge. */
  badge?: "Ajánlott" | "Multi‑site";
};

export type TierCopy = {
  tagline: string;
  description: string;
  includes: string[];
  /** Explicit limits (marketing copy; NOT enforced in code). */
  limits: string[];
};

export type TierOffer = TierCore & TierCopy;

// Shared marketing bullets that should stay consistent across funnels.
// (Marketing-only; not enforced in the application engine.)
export const PRO_MULTIUSER_BULLET =
  "Több felhasználó / több eszköz (egy cég több alkalmazottja saját eszközön, egymástól függetlenül)";
export const PRO_P2P_SYNC_BULLET =
  "Opcionális közeli eszköz↔eszköz szinkron (QR párosítással, P2P; export/import helyett)";

/**
 * NOTE: These tiers are marketing-only in this build.
 * They are NOT enforced in the application engine (zero feature expansion).
 *
 * Keep this file as the single source of truth for stable tier identities across all funnels.
 * Funnel-specific copy belongs in `src/content/funnels/*`.
 */
export const TIER_CORE: TierCore[] = [
  { id: "starter", label: "Starter / Solo" },
  { id: "pro", label: "Pro / Vállalkozás", badge: "Ajánlott" },
  { id: "expert", label: "Expert / Multi‑Site", badge: "Multi‑site" },
];

export function getTierCore(id: string | null | undefined): TierCore | null {
  if (!id) return null;
  return TIER_CORE.find((t) => t.id === id) ?? null;
}

export function isTierId(v: unknown): v is TierId {
  return v === "starter" || v === "pro" || v === "expert";
}

export function buildTierOffers(map: Record<TierId, TierCopy>): TierOffer[] {
  return TIER_CORE.map((t) => ({ ...t, ...map[t.id] }));
}

