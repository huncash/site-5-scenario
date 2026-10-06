import type { GlossaryTermId } from "@/lib/glossary";
import { OPL_FRAME, OPL_LESSONS, oplByPath, type OplLesson } from "@/lib/opl";
import { SUPPORT_LESSON_INDEX } from "@/lib/supportRoutes";

/** Pehelysúlyú OPL katalógus + on-demand 320×180 keretcache. A telepítőbe nem kerül kép. */
export const OPL_STORAGE = {
  version: 1 as const,
  dbName: "szcenario_opl_media_v1",
  storeName: "frames",
  cacheName: "szcenario-opl-frames-v1",
  maxCacheBytes: 8 * 1024 * 1024,
  maxFrameBytes: 120 * 1024,
  frame: OPL_FRAME,
} as const;

export type OplLessonMeta = {
  id: string;
  path: string;
  titleHu: string;
  titleEn: string;
  summaryHu: string;
  summaryEn: string;
  keywords: string[];
  jargon: GlossaryTermId[];
  hasBody: boolean;
  stepCount: number;
  mediaRefs: string[];
};

export type OplCatalog = {
  version: 1;
  frame: { widthPx: number; heightPx: number };
  lessons: OplLesson[];
  meta: OplLessonMeta[];
};

export type OplFrameKind = "cached" | "fetched" | "fallback";

export type OplFrameResolve = {
  kind: OplFrameKind;
  objectUrl?: string;
};

export type OplMediaRow = {
  key: string;
  src: string;
  type: string;
  blob: Blob;
  storedAt: number;
  bytes: number;
};

export type OplMediaBackend = {
  get(key: string): Promise<OplMediaRow | undefined>;
  save(row: OplMediaRow): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(): Promise<OplMediaRow[]>;
};

export type OplFrameOptions = {
  backend?: OplMediaBackend;
  fetch?: typeof fetch;
  online?: boolean;
  now?: () => number;
};

let catalogMemo: OplCatalog | null = null;
let defaultBackend: OplMediaBackend | null = null;

export function oplCatalog(): OplCatalog {
  if (catalogMemo) return catalogMemo;
  const byPath = new Map(OPL_LESSONS.map((l) => [l.path, l]));
  catalogMemo = {
    version: 1,
    frame: { widthPx: OPL_FRAME.widthPx, heightPx: OPL_FRAME.heightPx },
    lessons: OPL_LESSONS,
    meta: SUPPORT_LESSON_INDEX.map((row) => {
      const body = byPath.get(row.path) ?? (row.id !== row.path ? byPath.get(row.id) : undefined);
      return {
        id: row.id,
        path: row.path,
        titleHu: row.titleHu,
        titleEn: row.titleEn,
        summaryHu: row.summaryHu,
        summaryEn: row.summaryEn,
        keywords: row.keywords,
        jargon: body?.jargon ?? [],
        hasBody: Boolean(body),
        stepCount: body?.steps.length ?? 0,
        mediaRefs: mediaRefsOf(body),
      };
    }),
  };
  return catalogMemo;
}

export function oplCatalogJson(): string {
  return JSON.stringify(oplCatalog());
}

export function oplCatalogBytes(): number {
  return new TextEncoder().encode(oplCatalogJson()).length;
}

export function oplLessonText(path: string): OplLesson | null {
  return oplByPath(path);
}

export function isCacheableOplSrc(src: string): boolean {
  return src.startsWith("/") || src.startsWith("https://") || src.startsWith("http://");
}

export function oplMediaCacheKey(src: string): string {
  let h = 2166136261;
  for (let i = 0; i < src.length; i++) {
    h ^= src.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `opl-frame-${(h >>> 0).toString(16)}`;
}

export function createMemoryOplMedia(): OplMediaBackend {
  const table = new Map<string, OplMediaRow>();
  return {
    async get(key) {
      return table.get(key);
    },
    async save(row) {
      table.set(row.key, row);
    },
    async delete(key) {
      table.delete(key);
    },
    async getAll() {
      return [...table.values()];
    },
  };
}

export function setOplMediaBackend(backend: OplMediaBackend | null): void {
  defaultBackend = backend;
}

export async function resolveOplFrame(
  src: string | undefined,
  opts: OplFrameOptions = {},
): Promise<OplFrameResolve> {
  if (!src || !isCacheableOplSrc(src)) return { kind: "fallback" };
  const backend = opts.backend ?? (defaultBackend ??= createDefaultBackend());
  const key = oplMediaCacheKey(src);

  const hit = await backend.get(key).catch(() => undefined);
  if (hit?.blob) {
    return { kind: "cached", objectUrl: toObjectUrl(hit.blob) };
  }

  const fromCacheApi = await readCacheApi(src);
  if (fromCacheApi) {
    await persistFrame(backend, src, key, fromCacheApi, opts.now).catch(() => undefined);
    return { kind: "cached", objectUrl: toObjectUrl(fromCacheApi) };
  }

  const online = opts.online ?? (typeof navigator === "undefined" ? false : navigator.onLine !== false);
  if (!online) return { kind: "fallback" };

  const blob = await fetchOplFrameBlob(src, opts.fetch ?? fetch).catch(() => null);
  if (!blob) return { kind: "fallback" };
  await persistFrame(backend, src, key, blob, opts.now).catch(() => undefined);
  await writeCacheApi(src, blob).catch(() => undefined);
  return { kind: "fetched", objectUrl: toObjectUrl(blob) };
}

function toObjectUrl(blob: Blob): string | undefined {
  try {
    return typeof URL !== "undefined" && typeof URL.createObjectURL === "function"
      ? URL.createObjectURL(blob)
      : undefined;
  } catch {
    return undefined;
  }
}

export async function evictOplMediaCache(opts: OplFrameOptions = {}): Promise<void> {
  const backend = opts.backend ?? (defaultBackend ??= createDefaultBackend());
  const rows = await backend.getAll();
  await Promise.all(rows.map((row) => backend.delete(row.key)));
  if (typeof caches !== "undefined") {
    await caches.delete(OPL_STORAGE.cacheName).catch(() => false);
  }
}

function mediaRefsOf(body?: OplLesson): string[] {
  if (!body) return [];
  return body.steps
    .map((step) => step.image?.src)
    .filter((src): src is string => Boolean(src) && isCacheableOplSrc(src));
}

function createDefaultBackend(): OplMediaBackend {
  if (typeof indexedDB === "undefined") return createMemoryOplMedia();
  return createIndexedOplMedia();
}

function createIndexedOplMedia(): OplMediaBackend {
  const open = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(OPL_STORAGE.dbName, OPL_STORAGE.version);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(OPL_STORAGE.storeName)) {
          db.createObjectStore(OPL_STORAGE.storeName, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const withStore = async <T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>) => {
    const db = await open();
    try {
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(OPL_STORAGE.storeName, mode);
        const req = fn(tx.objectStore(OPL_STORAGE.storeName));
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result as T);
      });
    } finally {
      db.close();
    }
  };

  return {
    get: (key) => withStore<OplMediaRow | undefined>("readonly", (s) => s.get(key)),
    save: (row) => withStore("readwrite", (s) => s.put(row)).then(() => undefined),
    delete: (key) => withStore("readwrite", (s) => s.delete(key)).then(() => undefined),
    getAll: () => withStore<OplMediaRow[]>("readonly", (s) => s.getAll()),
  };
}

async function persistFrame(
  backend: OplMediaBackend,
  src: string,
  key: string,
  blob: Blob,
  now?: () => number,
): Promise<void> {
  await backend.save({
    key,
    src,
    type: blob.type || "image/webp",
    blob,
    storedAt: (now ?? Date.now)(),
    bytes: blob.size,
  });
  await trimCache(backend);
}

async function trimCache(backend: OplMediaBackend): Promise<void> {
  const rows = (await backend.getAll()).sort((a, b) => a.storedAt - b.storedAt);
  let total = rows.reduce((sum, row) => sum + row.bytes, 0);
  for (const row of rows) {
    if (total <= OPL_STORAGE.maxCacheBytes) break;
    await backend.delete(row.key);
    total -= row.bytes;
  }
}

async function fetchOplFrameBlob(src: string, fetchFn: typeof fetch): Promise<Blob | null> {
  const res = await fetchFn(src, { cache: "force-cache" });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (type && !type.startsWith("image/")) return null;
  const blob = await res.blob();
  if (blob.size <= 0 || blob.size > OPL_STORAGE.maxFrameBytes) return null;
  return blob;
}

async function readCacheApi(src: string): Promise<Blob | null> {
  if (typeof caches === "undefined") return null;
  try {
    const cache = await caches.open(OPL_STORAGE.cacheName);
    const hit = await cache.match(src);
    if (!hit?.ok) return null;
    const blob = await hit.blob();
    if (blob.size <= 0 || blob.size > OPL_STORAGE.maxFrameBytes) return null;
    return blob;
  } catch {
    return null;
  }
}

async function writeCacheApi(src: string, blob: Blob): Promise<void> {
  if (typeof caches === "undefined") return;
  const cache = await caches.open(OPL_STORAGE.cacheName);
  await cache.put(src, new Response(blob, { headers: { "content-type": blob.type || "image/webp" } }));
}
