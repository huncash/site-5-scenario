import { useMemo, useSyncExternalStore } from "react";
import type { DataStore, DataStoreSchema, StoreKey } from "@/lib/mesh/dataStore";
import { InMemoryDataStore, LocalStorageDataStore } from "@/lib/mesh/dataStore";
import type { MeshSchema } from "@/lib/mesh/schema";
import type { MeshDevice } from "@/lib/mesh/device";
import type { MeshLogEntry } from "@/lib/mesh/log";
import type { Transaction } from "@/lib/mesh/transaction";
import { TransactionSchema } from "@/lib/mesh/transaction";
import type { WebRTCDataTransport } from "@/lib/mesh/transport";
import type { TransportStatus } from "@/lib/mesh/transport";

// BroadcastChannel a tabok közötti azonnali szinkronhoz
const meshChannel = typeof window !== "undefined" ? new BroadcastChannel('mesh-sync') : null;

export type MeshEvent =
  | { op: "save"; at: string; store: string; key?: StoreKey }
  | { op: "delete"; at: string; store: string; key: StoreKey };

export type MeshRepository<TSchema extends DataStoreSchema> = {
  get: DataStore<TSchema>["get"];
  getAll: DataStore<TSchema>["getAll"];
  save: DataStore<TSchema>["save"];
  delete: DataStore<TSchema>["delete"];
};

function idFromValue(value: unknown): StoreKey | undefined {
  if (!value || typeof value !== "object") return undefined;
  if (!("id" in value)) return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

function logMeshEvent(event: MeshEvent) {
  console.log("[mesh]", event);
}

type MeshWireMessage =
  | { v: 1; kind: "hello"; deviceId: string; name: string }
  | { v: 1; kind: "sync:full"; store: "transactions"; items: Transaction[] }
  | { v: 1; kind: "op:save"; store: "transactions"; item: Transaction }
  | { v: 1; kind: "op:delete"; store: "transactions"; key: string };

let _transport: WebRTCDataTransport | null = null;
let _applyingRemote = false;
let _syncFullCount = 0;

let _activeProfileId: string | null = null;
let _activeProfileName: string | null = null;
let _deviceId: string | null = null;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getOrCreateDeviceId(): string {
  if (_deviceId) return _deviceId;
  if (typeof window === "undefined") {
    _deviceId = `server-${newId()}`;
    return _deviceId;
  }
  const key = "mesh:deviceId";
  const existing = window.localStorage.getItem(key);
  if (existing) {
    _deviceId = existing;
    return existing;
  }
  const created = newId();
  window.localStorage.setItem(key, created);
  _deviceId = created;
  return created;
}

export function getMeshDeviceId(): string {
  return getOrCreateDeviceId();
}

export function setMeshActiveProfile(profileId: string, profileName?: string) {
  _activeProfileId = profileId;
  _activeProfileName = profileName ?? null;
}

type MeshConnectionSnapshot = {
  status: TransportStatus;
  open: boolean;
  syncingFull: boolean;
};

let _connSnapshot: MeshConnectionSnapshot = {
  status: "idle",
  open: false,
  syncingFull: false,
};

const _connListeners = new Set<() => void>();
let _offTransportStatus: (() => void) | null = null;

function emitConn() {
  for (const cb of _connListeners) cb();
}

function setSyncFull(active: boolean) {
  _syncFullCount = Math.max(0, _syncFullCount + (active ? 1 : -1));
  _connSnapshot = { ..._connSnapshot, syncingFull: _syncFullCount > 0 };
  emitConn();
}

function setConnFromTransport(t: WebRTCDataTransport | null) {
  const status = t?.getStatus() ?? "idle";
  _connSnapshot = {
    status,
    open: t?.isOpen() ?? false,
    syncingFull: _syncFullCount > 0,
  };
  emitConn();
}

export function subscribeMeshConnection(cb: () => void): () => void {
  _connListeners.add(cb);
  return () => _connListeners.delete(cb);
}

export function getMeshConnectionSnapshot(): MeshConnectionSnapshot {
  return _connSnapshot;
}

export function useMeshConnection(): MeshConnectionSnapshot {
  return useSyncExternalStore(
    subscribeMeshConnection,
    getMeshConnectionSnapshot,
    getMeshConnectionSnapshot,
  );
}

function safeParseWire(raw: string): MeshWireMessage | null {
  try {
    const msg = JSON.parse(raw) as MeshWireMessage;
    if (!msg || typeof msg !== "object" || (msg as { v?: unknown }).v !== 1) return null;
    return msg;
  } catch {
    return null;
  }
}

export function setMeshTransport(transport: WebRTCDataTransport | null) {
  _transport = transport;
  _offTransportStatus?.();
  _offTransportStatus = null;
  if (transport) {
    _offTransportStatus = transport.onStatus(() => setConnFromTransport(transport));
  }
  setConnFromTransport(transport);
}

export function createMeshRepository<TSchema extends DataStoreSchema>(
  store: DataStore<TSchema>,
): MeshRepository<TSchema> {
  const upsertLocalDevice = async () => {
    if (!_activeProfileId) return;
    const d: MeshDevice = {
      id: `${_activeProfileId}:${getOrCreateDeviceId()}`,
      profileId: _activeProfileId,
      deviceId: getOrCreateDeviceId(),
      name: _activeProfileName ?? (typeof navigator !== "undefined" ? navigator.platform || "Device" : "Device"),
      lastSeenAt: new Date().toISOString(),
    };
    await store.save("devices" as never, d as never);
  };

  const appendLog = async (entry: Omit<MeshLogEntry, "id" | "at" | "profileId" | "deviceId"> & { op: MeshLogEntry["op"]; store: string; key?: string; message?: string; deviceId?: string }) => {
    if (!_activeProfileId) return;
    const e: MeshLogEntry = {
      id: newId(),
      at: new Date().toISOString(),
      profileId: _activeProfileId,
      deviceId: entry.deviceId ?? getOrCreateDeviceId(),
      op: entry.op,
      store: entry.store,
      key: entry.key,
      message: entry.message,
    };
    await store.save("logs" as never, e as never);
  };

  const applyRemote = async (raw: string) => {
    const msg = safeParseWire(raw);
    if (!msg) return;

    if (msg.kind === "hello") {
      if (_activeProfileId) {
        const d: MeshDevice = {
          id: `${_activeProfileId}:${msg.deviceId}`,
          profileId: _activeProfileId,
          deviceId: msg.deviceId,
          name: msg.name,
          lastSeenAt: new Date().toISOString(),
        };
        await store.save("devices" as never, d as never);
        await appendLog({ op: "hello", store: "devices", key: msg.deviceId, deviceId: msg.deviceId });
        if (typeof window !== "undefined") window.dispatchEvent(new Event("mesh-data-updated"));
      }
      return;
    }

    if (msg.store !== "transactions") return;

    _applyingRemote = true;
    try {
      if (msg.kind === "sync:full") {
        setSyncFull(true);
        await appendLog({ op: "sync:full", store: "transactions" });
        for (const t of msg.items) {
          const ok = TransactionSchema.safeParse(t);
          if (!ok.success) continue;
          await store.save("transactions" as never, t as never);
        }
      } else if (msg.kind === "op:save") {
        const ok = TransactionSchema.safeParse(msg.item);
        if (!ok.success) return;
        await store.save("transactions" as never, msg.item as never);
        await appendLog({ op: "save", store: "transactions", key: msg.item.id });
      } else if (msg.kind === "op:delete") {
        await store.delete("transactions" as never, msg.key as never);
        await appendLog({ op: "delete", store: "transactions", key: msg.key });
      }

      meshChannel?.postMessage({ type: "sync", store: "transactions", op: "remote" });
      if (typeof window !== "undefined") window.dispatchEvent(new Event("mesh-data-updated"));
    } finally {
      _applyingRemote = false;
      if (msg?.kind === "sync:full") setSyncFull(false);
    }
  };

  const bindTransport = (t: WebRTCDataTransport | null) => {
    setMeshTransport(t);
    if (!t) return () => undefined;
    const offMsg = t.onMessage(applyRemote);
    const offOpen = t.onOpen(async () => {
      setConnFromTransport(t);
      await upsertLocalDevice();
      const items = (await store.getAll("transactions" as never)) as Transaction[];
      try {
        setSyncFull(true);
        t.send(JSON.stringify({ v: 1, kind: "hello", deviceId: getOrCreateDeviceId(), name: _activeProfileName ?? "Device" } satisfies MeshWireMessage));
        t.send(JSON.stringify({ v: 1, kind: "sync:full", store: "transactions", items } satisfies MeshWireMessage));
      } catch {
        /* ignore */
      } finally {
        setSyncFull(false);
      }
    });
    return () => {
      offMsg();
      offOpen();
    };
  };

  // If a transport was set before repo creation, attach it now.
  bindTransport(_transport);

  return {
    get: (s, key) => store.get(s, key),
    getAll: (s) => store.getAll(s),
    save: async (s, value) => {
      if (s === "transactions") {
        const result = TransactionSchema.safeParse(value);
        if (!result.success) {
          console.error("[mesh] Hibás tranzakció formátum:", result.error);
          throw new Error("Érvénytelen tranzakció adat.");
        }
      }
      await store.save(s, value);
      
      // Szinkronizáció jelzése a többi tabnak
      meshChannel?.postMessage({ type: 'sync', store: s, op: 'save' });

      if (!_applyingRemote && _transport?.isOpen() && s === "transactions") {
        const t = value as unknown as Transaction;
        const ok = TransactionSchema.safeParse(t);
        if (ok.success) {
          _transport.send(
            JSON.stringify({ v: 1, kind: "op:save", store: "transactions", item: ok.data } satisfies MeshWireMessage),
          );
        }
      }

      if (!_applyingRemote && s === "transactions") {
        const t = value as unknown as Transaction;
        const ok = TransactionSchema.safeParse(t);
        if (ok.success) await appendLog({ op: "save", store: "transactions", key: ok.data.id });
      }
      
      logMeshEvent({
        op: "save",
        at: new Date().toISOString(),
        store: String(s),
        key: idFromValue(value),
      });
    },
    delete: async (s, key) => {
      await store.delete(s, key);
      
      // Szinkronizáció jelzése a többi tabnak
      meshChannel?.postMessage({ type: 'sync', store: s, op: 'delete' });

      if (!_applyingRemote && _transport?.isOpen() && s === "transactions") {
        _transport.send(
          JSON.stringify({ v: 1, kind: "op:delete", store: "transactions", key: String(key) } satisfies MeshWireMessage),
        );
      }

      if (!_applyingRemote && s === "transactions") {
        await appendLog({ op: "delete", store: "transactions", key: String(key) });
      }
      
      logMeshEvent({
        op: "delete",
        at: new Date().toISOString(),
        store: String(s),
        key: key as StoreKey,
      });
    },
  };
}

let _repo: MeshRepository<MeshSchema> | null = null;

function defaultStore(): DataStore<MeshSchema> {
  // Szerveren soha nincs perzisztencia — a mesh adat a kliens gépén marad.
  if (typeof window === "undefined") return new InMemoryDataStore<MeshSchema>();
  return new LocalStorageDataStore<MeshSchema>({ namespace: "mesh-repo" });
}

export function getMeshRepository(): MeshRepository<MeshSchema> {
  if (_repo) return _repo;
  _repo = createMeshRepository(defaultStore());
  
  // Figyeljük a többi tabtól érkező üzeneteket
  meshChannel?.addEventListener('message', () => {
    // Esemény küldése az UI felé, hogy frissítse magát
    window.dispatchEvent(new Event('mesh-data-updated'));
  });
  
  return _repo;
}

export function useMeshRepository(): MeshRepository<MeshSchema> {
  return useMemo(() => getMeshRepository(), []);
}

export function getMeshActiveProfileId(): string | null {
  return _activeProfileId;
}