// Offline profil-teleport: exportál egy titkosított profil-snapshotot
// (só + verifier + titkosított sorok) QR-kompatibilis, chunkolt frame-ekbe.
// A mesterjelszó SOHA nem kerül a payloadba — a fogadó eszközön újra beírod.

import {
  localdb,
  type EncGoalRow,
  type EncTxnRow,
  type Profile,
} from "@/lib/localdb";

export type TransferKind = "profile-full" | "profile-shell";

export type TransferPayload = {
  v: 1;
  kind: TransferKind;
  profile: Pick<Profile, "name" | "salt" | "verifier" | "created_at">;
  txns: Array<Omit<EncTxnRow, "profile_id">>;
  goals: Array<Omit<EncGoalRow, "profile_id">>;
  settings: { data_enc: string } | null;
};

export async function buildTransferPayload(
  kind: TransferKind,
): Promise<TransferPayload> {
  const activeId = localdb.getActiveProfile();
  if (!activeId) throw new Error("Nincs aktív profil.");
  const profile = await localdb.getProfile(activeId);
  if (!profile) throw new Error("Profil nem található.");
  const base = {
    v: 1 as const,
    kind,
    profile: {
      name: profile.name,
      salt: profile.salt,
      verifier: profile.verifier,
      created_at: profile.created_at,
    },
  };
  if (kind === "profile-shell") {
    return { ...base, txns: [], goals: [], settings: null };
  }
  const [txns, goals, settings] = await Promise.all([
    localdb.listTxns(),
    localdb.listGoals(),
    localdb.getSettings(),
  ]);
  return {
    ...base,
    txns: txns.map(({ profile_id: _p, ...r }) => r),
    goals: goals.map(({ profile_id: _p, ...r }) => r),
    settings: settings ? { data_enc: settings.data_enc } : null,
  };
}

export async function applyTransferPayload(
  payload: TransferPayload,
): Promise<Profile> {
  if (payload.v !== 1) throw new Error("Ismeretlen adatformátum.");
  const existing = await localdb.listProfiles();
  const dup = existing.find(
    (p) =>
      p.salt === payload.profile.salt && p.verifier === payload.profile.verifier,
  );
  if (dup) {
    throw new Error(
      `Ez a profil már létezik ezen az eszközön „${dup.name}" néven.`,
    );
  }
  const created = await localdb.createProfile({
    name: payload.profile.name,
    salt: payload.profile.salt,
    verifier: payload.profile.verifier,
  });
  for (const t of payload.txns) {
    await localdb.putTxn({ ...t, profile_id: created.id });
  }
  for (const g of payload.goals) {
    await localdb.putGoal({ ...g, profile_id: created.id });
  }
  if (payload.settings) {
    await localdb.putSettingsFor(created.id, payload.settings.data_enc);
  }
  return created;
}

// --- Chunkolt frame kódolás/dekódolás -------------------------------------

const HEADER = "LFV1";
const CHUNK_SIZE = 1200;

function utf8ToB64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64ToUtf8(s: string): string {
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function encodeFrames(payload: TransferPayload): string[] {
  const b64 = utf8ToB64(JSON.stringify(payload));
  const id = shortId();
  const chunks: string[] = [];
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    chunks.push(b64.slice(i, i + CHUNK_SIZE));
  }
  const n = chunks.length || 1;
  const effective = chunks.length ? chunks : [""];
  return effective.map((c, i) => `${HEADER}|${id}|${i}|${n}|${c}`);
}

export function isTransferFrame(s: string): boolean {
  return s.startsWith(HEADER + "|");
}

export class FrameCollector {
  private id: string | null = null;
  private total = 0;
  private parts = new Map<number, string>();

  ingest(frame: string): {
    accepted: boolean;
    done: boolean;
    got: number;
    total: number;
    error?: string;
  } {
    const parts = frame.split("|");
    if (parts[0] !== HEADER || parts.length !== 5) {
      return {
        accepted: false,
        done: false,
        got: this.parts.size,
        total: this.total,
        error: "Ismeretlen QR formátum.",
      };
    }
    const [, id, iStr, nStr, chunk] = parts;
    const i = Number.parseInt(iStr, 10);
    const n = Number.parseInt(nStr, 10);
    if (!Number.isFinite(i) || !Number.isFinite(n) || n < 1 || i < 0 || i >= n) {
      return {
        accepted: false,
        done: false,
        got: this.parts.size,
        total: this.total,
        error: "Sérült QR frame.",
      };
    }
    if (this.id !== id) {
      this.id = id;
      this.total = n;
      this.parts.clear();
    }
    this.parts.set(i, chunk);
    const done = this.parts.size === n;
    return { accepted: true, done, got: this.parts.size, total: n };
  }

  reset() {
    this.id = null;
    this.total = 0;
    this.parts.clear();
  }

  assemble(): TransferPayload {
    if (this.id === null || this.parts.size !== this.total) {
      throw new Error("Hiányos adat.");
    }
    let combined = "";
    for (let i = 0; i < this.total; i++) {
      const c = this.parts.get(i);
      if (c === undefined) {
        throw new Error(`Hiányzó ${i + 1}/${this.total}. rész.`);
      }
      combined += c;
    }
    return JSON.parse(b64ToUtf8(combined)) as TransferPayload;
  }
}
