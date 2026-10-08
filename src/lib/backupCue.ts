import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { BackupCueRow, MeshSchema } from "@/lib/mesh/schema";

export const BACKUP_CUE_EVENT = "szcenario:backup-cue";
export const BACKUP_CUE_ID = "cue";
/** Első emlékeztető: 24 óra a helyi tárhelyen. */
export const BACKUP_CUE_FIRST_MS = 24 * 60 * 60 * 1000;
/** Ismétlés, ha nincs új export. */
export const BACKUP_CUE_REPEAT_MS = 7 * 24 * 60 * 60 * 1000;
export const BACKUP_CUE_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export function backupCueQueryKey() {
  return ["backupCue"] as const;
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BACKUP_CUE_EVENT));
}

function emptyCue(now = Date.now()): BackupCueRow {
  return { id: BACKUP_CUE_ID, firstSeenAt: now, lastExportAt: 0, snoozeUntil: 0 };
}

export async function readBackupCue(repo: MeshRepository<MeshSchema>): Promise<BackupCueRow> {
  const row = await repo.get("backupCue", BACKUP_CUE_ID);
  if (row?.id === BACKUP_CUE_ID) return row;
  const created = emptyCue();
  await repo.save("backupCue", created);
  return created;
}

export function backupCueDue(row: BackupCueRow, now = Date.now()): boolean {
  if (row.snoozeUntil > now) return false;
  if (row.lastExportAt > 0) return now - row.lastExportAt >= BACKUP_CUE_REPEAT_MS;
  return now - row.firstSeenAt >= BACKUP_CUE_FIRST_MS;
}

export async function stampBackupExport(repo: MeshRepository<MeshSchema>): Promise<BackupCueRow> {
  const prev = await readBackupCue(repo);
  const next: BackupCueRow = {
    ...prev,
    lastExportAt: Date.now(),
    snoozeUntil: 0,
  };
  await repo.save("backupCue", next);
  emit();
  return next;
}

export async function snoozeBackupCue(repo: MeshRepository<MeshSchema>): Promise<BackupCueRow> {
  const prev = await readBackupCue(repo);
  const next: BackupCueRow = { ...prev, snoozeUntil: Date.now() + BACKUP_CUE_SNOOZE_MS };
  await repo.save("backupCue", next);
  emit();
  return next;
}
