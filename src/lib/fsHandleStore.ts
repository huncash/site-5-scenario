type AnyDirectoryHandle = any;

const DB_NAME = "mdm-fs-handles";
const DB_VERSION = 1;
const STORE_DIR = "dir_handles";

type DirHandleRow = { id: string; handle: AnyDirectoryHandle };

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_DIR)) {
        db.createObjectStore(STORE_DIR, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_DIR, mode);
      const store = tx.objectStore(STORE_DIR);
      const req = fn(store);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result as T);
    });
  } finally {
    db.close();
  }
}

export function fsHandleKey(input: { profileId: string; workspaceId: string; kind: "bank-personal" | "bank-corporate" }) {
  return `${input.kind}:${input.profileId}:${input.workspaceId}`;
}

export async function getDirectoryHandle(id: string): Promise<AnyDirectoryHandle | null> {
  try {
    const row = await withStore<DirHandleRow | undefined>("readonly", (s) => s.get(id));
    return row?.handle ?? null;
  } catch {
    return null;
  }
}

export async function setDirectoryHandle(id: string, handle: AnyDirectoryHandle): Promise<void> {
  await withStore("readwrite", (s) => s.put({ id, handle } satisfies DirHandleRow));
}

export async function clearDirectoryHandle(id: string): Promise<void> {
  await withStore("readwrite", (s) => s.delete(id));
}

