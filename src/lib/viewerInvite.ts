import { ACCESS_ROLE, type AccessRole } from "@/lib/accessRole";

export type ViewerInvite = {
  id: string;
  token: string;
  createdAt: string;
  revokedAt: string | null;
  label?: string;
};

const STORE_KEY = "szcenario_viewer_invites_v1";

function load(): ViewerInvite[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as ViewerInvite[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function save(rows: ViewerInvite[]): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("szcenario:viewer_invites"));
}

function randomToken(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `VW-${hex.slice(0, 8).toUpperCase()}-${hex.slice(8, 16).toUpperCase()}`;
}

/** Tulajdonos: egy kattintással korlátozott szinkronkulcs. */
export function createViewerInvite(label?: string): ViewerInvite {
  const invite: ViewerInvite = {
    id: crypto.randomUUID(),
    token: randomToken(),
    createdAt: new Date().toISOString(),
    revokedAt: null,
    label: label?.trim() || undefined,
  };
  const rows = load();
  rows.unshift(invite);
  save(rows);
  return invite;
}

export function listViewerInvites(): ViewerInvite[] {
  return load();
}

export function revokeViewerInvite(token: string): boolean {
  const rows = load();
  const i = rows.findIndex((r) => r.token === token);
  if (i < 0) return false;
  if (rows[i].revokedAt) return true;
  rows[i] = { ...rows[i], revokedAt: new Date().toISOString() };
  save(rows);
  return true;
}

export function findViewerInvite(token: string): ViewerInvite | null {
  const t = token.trim();
  if (!t) return null;
  return load().find((r) => r.token === t) ?? null;
}

/**
 * Tulajdonos gépen: csak aktív meghívó engedélyezett.
 * Vendég gépen (nincs helyi meghívó rekord): a URL szerepköre érvényes, amíg a tulajdonos
 * visszavonás után új párosítást nem utasít el.
 */
export function isViewerInviteActive(token: string): boolean {
  const inv = findViewerInvite(token);
  if (!inv) return true;
  return !inv.revokedAt;
}

export function isViewerInviteRevokedLocally(token: string): boolean {
  const inv = findViewerInvite(token);
  return Boolean(inv?.revokedAt);
}

export function viewerConnectUrl(token: string, origin = typeof window !== "undefined" ? window.location.origin : ""): string {
  const url = new URL("/connect", origin || "https://app.szcenario.hu");
  url.searchParams.set("session", token);
  url.searchParams.set("role", ACCESS_ROLE.VIEWER_READONLY);
  return url.toString();
}

export function roleFromConnectSearch(role: string | undefined | null): AccessRole {
  return role === ACCESS_ROLE.VIEWER_READONLY ? ACCESS_ROLE.VIEWER_READONLY : ACCESS_ROLE.OWNER_EDITOR;
}
