export type DirectoryLike = {
  queryPermission?: (opts: { mode: "read" | "readwrite" }) => PermissionState | Promise<PermissionState>;
  requestPermission?: (opts: { mode: "read" | "readwrite" }) => PermissionState | Promise<PermissionState>;
  entries?: () => AsyncIterable<[string, { kind?: string; getFile?: () => Promise<File> }]>;
};

async function perm(
  fn: ((opts: { mode: "read" | "readwrite" }) => PermissionState | Promise<PermissionState>) | undefined,
): Promise<PermissionState | null> {
  if (typeof fn !== "function") return null;
  try {
    return await fn({ mode: "read" });
  } catch {
    return null;
  }
}

/** Stored File System Access handle: grant read, or request if the browser still asks. */
export async function ensureDirectoryReadPermission(handle: DirectoryLike | null | undefined): Promise<boolean> {
  if (!handle) return false;
  const queried = await perm(handle.queryPermission?.bind(handle));
  if (queried === "granted") return true;
  if (queried === "denied") return false;
  const requested = await perm(handle.requestPermission?.bind(handle));
  if (requested === "granted") return true;
  if (requested === "denied") return false;
  // No permission API (tests / non-Chrome): treat as readable.
  return queried == null && requested == null;
}

export async function pickLatestStatementFile(
  dir: DirectoryLike,
): Promise<{ name: string; file: File } | null> {
  if (typeof dir.entries !== "function") return null;
  let best: { name: string; file: File } | null = null;
  for await (const [name, handle] of dir.entries()) {
    if (!handle || handle.kind !== "file" || typeof handle.getFile !== "function") continue;
    const lower = String(name).toLowerCase();
    if (!(lower.endsWith(".xml") || lower.endsWith(".csv"))) continue;
    const file = await handle.getFile();
    if (!best || file.lastModified > best.file.lastModified) best = { name, file };
  }
  return best;
}
