import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HardDrive } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { backupCueDue, BACKUP_CUE_EVENT, readBackupCue, snoozeBackupCue } from "@/lib/backupCue";
import { keepLang } from "@/lib/langSearch";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { useVault } from "@/lib/vault";

export function BackupCueBanner() {
  const { t } = useI18n();
  const repo = useMeshRepository();
  const { state } = useVault();
  const unlocked = state.status === "unlocked";
  const [due, setDue] = useState(false);

  const refresh = useCallback(async () => {
    if (!unlocked) {
      setDue(false);
      return;
    }
    const row = await readBackupCue(repo);
    setDue(backupCueDue(row));
  }, [repo, unlocked]);

  useEffect(() => {
    void refresh();
    const on = () => void refresh();
    window.addEventListener(BACKUP_CUE_EVENT, on);
    const id = window.setInterval(on, 60_000);
    return () => {
      window.removeEventListener(BACKUP_CUE_EVENT, on);
      window.clearInterval(id);
    };
  }, [refresh]);

  if (!unlocked || !due) return null;

  const profileId = state.status === "unlocked" ? state.profile.id : "";

  return (
    <aside
      role="status"
      className="border-b border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-foreground"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2">
        <HardDrive className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <p className="min-w-0 flex-1">
          <span className="font-semibold">{t("chrome.backupCueTitle")}</span>
          {" — "}
          {t("chrome.backupCueBody")}
        </p>
        <Button type="button" size="sm" variant="outline" onClick={() => void snoozeBackupCue(repo)}>
          {t("chrome.backupCueSnooze")}
        </Button>
        <Button type="button" size="sm" className="btn-cta" asChild>
          <Link
            to="/settings"
            search={(prev) => keepLang({ ...prev, profile: profileId })}
            hash="backup-restore"
          >
            {t("chrome.backupCueNow")}
          </Link>
        </Button>
      </div>
    </aside>
  );
}
