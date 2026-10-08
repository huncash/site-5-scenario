import { useState } from "react";
import { toast } from "sonner";

import { AnonReviewWizard } from "@/components/education/AnonReviewWizard";
import { LabSection } from "@/components/labs/LabSection";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEduAnonymize } from "@/hooks/useEngineFramePrefs";
import { useI18n } from "@/i18n";
import {
  buildAnonCasePack,
  copyAnonCaseToClipboard,
  downloadAnonCaseFile,
} from "@/lib/anonCasePack";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import { anonymizeEconomicSnapshot, type AnonSourceRow } from "@/lib/educationAnonymize";
import { canExportEducationPack, guestMayDisableAnonymizer } from "@/lib/engineFrames";
import { readAccessRole } from "@/lib/accessRole";

export function AnonLabPanel({
  snapshot,
  rows,
}: {
  snapshot: EconomicReadSnapshot;
  rows?: AnonSourceRow[];
}) {
  const { t, locale } = useI18n();
  const anon = useEduAnonymize();
  const [wizard, setWizard] = useState(false);
  const canOffAnon = guestMayDisableAnonymizer(readAccessRole());
  const exportOk = canExportEducationPack({ anonOn: anon.on, role: readAccessRole() }).ok;
  const study = anon.on ? anonymizeEconomicSnapshot(snapshot, undefined, { rows, locale }) : null;

  const exportStudy = async (asFile: boolean) => {
    if (!exportOk) {
      toast.message(t("frame.anonOffBlock"));
      return;
    }
    const res = await buildAnonCasePack(snapshot, {
      anonOn: true,
      leakNeedles: [snapshot.orgLabel, ...(rows ?? []).map((r) => r.raw)],
      rows,
      locale,
    });
    if (!res.ok) {
      toast.message(t("frame.leakBlocked"));
      return;
    }
    if (asFile) {
      downloadAnonCaseFile(res.pack.filename, res.text);
      toast.message(t("frame.packDownloaded"));
    }
    const copied = await copyAnonCaseToClipboard(res.text);
    if (copied) toast.message(t("frame.nostrCopied"));
    else if (!asFile) toast.message(t("frame.nostrCopyFail"));
  };

  return (
    <LabSection id="labs-anon" className="rounded-lg border border-emerald-500/25 bg-card/70 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Switch
          checked={anon.on}
          disabled={anon.on && !canOffAnon}
          onCheckedChange={(v) => anon.setOn(v)}
        />
        <div className="min-w-0 flex-1 text-[12px]">
          <div className="font-medium text-foreground">{t("frame.anonTitle")}</div>
          <p className="text-[11px] leading-snug text-muted-foreground">{t("frame.anonLead")}</p>
          {study ? (
            <p className="mt-1 text-[11px] text-foreground">
              {t("frame.studyAlias")}: {study.orgAlias}
              {study.covers.filter((c) => c.kind !== "org").length
                ? ` · ${study.covers
                    .filter((c) => c.kind !== "org")
                    .slice(0, 3)
                    .map((c) => c.label)
                    .join(", ")}`
                : ""}
            </p>
          ) : null}
        </div>
        <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => setWizard(true)}>
          {t("frame.anonWizard")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => void exportStudy(false)}>
          {t("frame.anonShare")}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => void exportStudy(true)}>
          {t("frame.anonShareFile")}
        </Button>
      </div>
      <AnonReviewWizard
        open={wizard}
        onOpenChange={setWizard}
        snapshot={snapshot}
        rows={rows}
        anonOn={anon.on}
      />
    </LabSection>
  );
}
