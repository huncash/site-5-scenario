import { ACCESS_ROLE, type AccessRole } from "@/lib/accessRole";
import {
  findGuestSlotByCode,
  generateNextGuestCode,
  isGuestCodeActive,
  listGuestSlots,
  normalizeGuestCode,
  revokeGuestCode,
  type GuestCodeSlot,
} from "@/lib/auth/guestSlots";

/** @deprecated Prefer GuestCodeSlot — kept for connect / panel compatibility. */
export type ViewerInvite = {
  id: string;
  token: string;
  createdAt: string;
  revokedAt: string | null;
  label?: string;
  slotIndex?: number;
  fragment?: string | null;
};

function slotToInvite(s: GuestCodeSlot): ViewerInvite | null {
  if (!s.code) return null;
  return {
    id: `guest-slot-${s.index}`,
    token: s.code,
    createdAt: s.createdAt ?? new Date().toISOString(),
    revokedAt: s.revokedAt,
    label: `Guest #${String(s.index).padStart(2, "0")}`,
    slotIndex: s.index,
    fragment: s.fragment,
  };
}

/** Seat: következő szabad Guest Code Slot feltöltése. */
export function createViewerInvite(label?: string): ViewerInvite {
  void label;
  const res = generateNextGuestCode();
  if (!res.ok) {
    throw new Error(
      res.reason === "pool_full"
        ? "Nincs szabad Guest Code Slot a csomagban."
        : "Guest kód nem generálható.",
    );
  }
  const inv = slotToInvite(res.slot);
  if (!inv) throw new Error("Guest kód nem generálható.");
  return inv;
}

export function listViewerInvites(): ViewerInvite[] {
  return listGuestSlots()
    .map(slotToInvite)
    .filter((x): x is ViewerInvite => Boolean(x));
}

export function revokeViewerInvite(token: string): boolean {
  return revokeGuestCode(token);
}

export function findViewerInvite(token: string): ViewerInvite | null {
  const slot = findGuestSlotByCode(token);
  return slot ? slotToInvite(slot) : null;
}

/**
 * Seat gépen: csak aktív (nem visszavont) kód.
 * Vendég gépen (nincs helyi pool rekord): formai Guest kód elfogadott.
 */
export function isViewerInviteActive(token: string): boolean {
  return isGuestCodeActive(token);
}

export function isViewerInviteRevokedLocally(token: string): boolean {
  const inv = findViewerInvite(token);
  return Boolean(inv?.revokedAt);
}

export function viewerConnectUrl(token: string, origin = typeof window !== "undefined" ? window.location.origin : ""): string {
  const url = new URL("/connect", origin || "https://app.szcenario.hu");
  url.searchParams.set("session", normalizeGuestCode(token));
  url.searchParams.set("role", ACCESS_ROLE.VIEWER_READONLY);
  return url.toString();
}

export function roleFromConnectSearch(role: string | undefined | null): AccessRole {
  return role === ACCESS_ROLE.VIEWER_READONLY ? ACCESS_ROLE.VIEWER_READONLY : ACCESS_ROLE.OWNER_EDITOR;
}
