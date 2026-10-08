import { describe, expect, it } from "vitest";

import {
  BACKUP_CUE_FIRST_MS,
  BACKUP_CUE_REPEAT_MS,
  backupCueDue,
  readBackupCue,
  snoozeBackupCue,
  stampBackupExport,
} from "@/lib/backupCue";
import { InMemoryDataStore } from "@/lib/mesh/dataStore";
import { createMeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";

function repo() {
  return createMeshRepository(new InMemoryDataStore<MeshSchema>());
}

describe("backupCue", () => {
  it("is due after the first 24h with no export", async () => {
    const r = repo();
    const row = await readBackupCue(r);
    expect(backupCueDue(row, row.firstSeenAt + BACKUP_CUE_FIRST_MS - 1)).toBe(false);
    expect(backupCueDue(row, row.firstSeenAt + BACKUP_CUE_FIRST_MS)).toBe(true);
  });

  it("clears after an export until the repeat window", async () => {
    const r = repo();
    const stamped = await stampBackupExport(r);
    expect(backupCueDue(stamped, stamped.lastExportAt + 1)).toBe(false);
    expect(backupCueDue(stamped, stamped.lastExportAt + BACKUP_CUE_REPEAT_MS)).toBe(true);
  });

  it("honours snooze", async () => {
    const r = repo();
    const snoozed = await snoozeBackupCue(r);
    expect(backupCueDue(snoozed, snoozed.snoozeUntil - 1)).toBe(false);
    expect(backupCueDue(snoozed, snoozed.snoozeUntil + BACKUP_CUE_FIRST_MS)).toBe(true);
  });
});
