import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n, type MessageKey } from "@/i18n";
import {
  buildAnonCasePack,
  copyAnonCaseToClipboard,
  downloadAnonCaseFile,
} from "@/lib/anonCasePack";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import {
  applyAnonOverrides,
  buildAnonLexicon,
  maskAnonRaw,
  type AnonKind,
  type AnonSourceRow,
} from "@/lib/educationAnonymize";
import { canExportEducationPack } from "@/lib/engineFrames";
import { readAccessRole } from "@/lib/accessRole";

const KIND_KEY: Record<AnonKind, MessageKey> = {
  org: "frame.anonKindOrg",
  material: "frame.anonKindMaterial",
  product: "frame.anonKindProduct",
  partner: "frame.anonKindPartner",
  item: "frame.anonKindItem",
  account: "frame.anonKindAccount",
  place: "frame.anonKindPlace",
};

export function AnonReviewWizard({
  open,
  onOpenChange,
  snapshot,
  rows,
  anonOn,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snapshot: EconomicReadSnapshot;
  rows?: AnonSourceRow[];
  anonOn: boolean;
}) {
  const { t, locale } = useI18n();
  const base = useMemo(
    () => buildAnonLexicon({ orgLabel: snapshot.orgLabel, rows, locale }),
    [snapshot.orgLabel, rows, locale],
  );
  const [draft, setDraft] = useState<Record<string, string>>({});

  const lexicon = useMemo(() => applyAnonOverrides(base, draft), [base, draft]);
  const exportOk = canExportEducationPack({ anonOn, role: readAccessRole() }).ok;

  const exportStudy = async (asFile: boolean) => {
    if (!exportOk) {
      toast.message(t("frame.anonOffBlock"));
      return;
    }
    const needles = [snapshot.orgLabel, ...lexicon.covers.map((c) => c.raw)];
    const res = await buildAnonCasePack(snapshot, {
      anonOn: true,
      leakNeedles: needles,
      rows,
      overrides: draft,
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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(80vh,36rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("frame.anonWizardTitle")}</DialogTitle>
          <DialogDescription>{t("frame.anonWizardLead")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-[5.5rem_1fr_7.5rem] gap-x-2 gap-y-1.5 text-[11px]">
          <span className="font-semibold text-muted-foreground">{t("frame.anonCoverKind")}</span>
          <span className="font-semibold text-muted-foreground">{t("frame.anonCoverRaw")}</span>
          <span className="font-semibold text-muted-foreground">{t("frame.anonCoverLabel")}</span>
          {lexicon.covers.map((c) => (
            <div key={c.key} className="contents">
              <span className="self-center text-muted-foreground">{t(KIND_KEY[c.kind])}</span>
              <span className="self-center truncate text-foreground" title={maskAnonRaw(c.raw, c.kind)}>
                {maskAnonRaw(c.raw, c.kind)}
              </span>
              <Input
                value={draft[c.key] ?? c.label}
                onChange={(e) => setDraft((cur) => ({ ...cur, [c.key]: e.target.value }))}
                className="h-7 text-[11px]"
                aria-label={t("frame.anonCoverLabel")}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => void exportStudy(false)}>
            {t("frame.anonShare")}
          </Button>
          <Button type="button" size="sm" disabled={!exportOk} onClick={() => void exportStudy(true)}>
            {t("frame.anonShareFile")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
