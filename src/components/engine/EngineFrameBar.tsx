import { toast } from "sonner";

import { BcpEngineRoom } from "@/components/engine/BcpEngineRoom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useBcpView, useEduAnonymize } from "@/hooks/useEngineFramePrefs";
import { useLabsEngines } from "@/hooks/useLabsEngines";
import { formatCurrency, useI18n } from "@/i18n";
import { isEducationSegment } from "@/lib/educationCases";
import {
  buildAnonCasePack,
  copyAnonCaseToClipboard,
  downloadAnonCaseFile,
} from "@/lib/anonCasePack";
import { canExportEducationPack, guestMayDisableAnonymizer } from "@/lib/engineFrames";
import { isEngineLicensed } from "@/lib/engineView";
import { readAccessRole } from "@/lib/accessRole";
import { isResilienceSegment } from "@/lib/resilienceCases";
import type { BcpViewMode, EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";

export function EngineFrameBar({
  segmentId,
  snapshot,
}: {
  segmentId: string | null | undefined;
  snapshot: EconomicReadSnapshot;
}) {
  const { t } = useI18n();
  const { on: engines } = useLabsEngines();
  const anon = useEduAnonymize();
  const bcp = useBcpView();
  const eduSurface =
    (isEngineLicensed("education") && engines.education) || isEducationSegment(segmentId);
  const bcpSurface =
    (isEngineLicensed("resilience") && engines.resilience) || isResilienceSegment(segmentId);
  const canOffAnon = guestMayDisableAnonymizer(readAccessRole());
  const exportOk = canExportEducationPack({ anonOn: anon.on, role: readAccessRole() }).ok;

  const exportStudy = async (asFile: boolean) => {
    if (!exportOk) {
      toast.message(t("frame.anonOffBlock"));
      return;
    }
    const res = await buildAnonCasePack(snapshot, {
      anonOn: true,
      leakNeedles: [snapshot.orgLabel],
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

  if (!eduSurface && !bcpSurface) {
    return (
      <p className="mx-auto mb-1 max-w-[98%] px-2 text-[11px] leading-snug text-pretty text-muted-foreground sm:px-3 md:px-4">
        {t("frame.licenseHint")}
      </p>
    );
  }

  const modes: Array<{ id: BcpViewMode; label: string }> = [
    { id: "isolated", label: t("frame.viewIsolated") },
    { id: "overlay", label: t("frame.viewOverlay") },
    ...(bcp.canRoom ? [{ id: "engine-room" as const, label: t("frame.viewEngineRoom") }] : []),
  ];

  return (
    <div className="mx-auto mb-2 mt-1 w-full max-w-[98%] space-y-2 px-2 sm:px-3 md:px-4">
      <p className="max-w-3xl text-[11px] leading-snug text-pretty text-muted-foreground">{t("frame.licenseHint")}</p>
      {eduSurface ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-950/15 px-3 py-2">
          <Switch
            checked={anon.on}
            disabled={anon.on && !canOffAnon}
            onCheckedChange={(v) => anon.setOn(v)}
          />
          <div className="min-w-0 flex-1 text-[12px]">
            <div className="font-medium text-foreground">{t("frame.anonTitle")}</div>
            <p className="text-[11px] leading-snug text-muted-foreground">{t("frame.anonLead")}</p>
          </div>
          <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => void exportStudy(false)}>
            {t("frame.anonShare")}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={!exportOk} onClick={() => void exportStudy(true)}>
            {t("frame.anonShareFile")}
          </Button>
        </div>
      ) : null}
      {bcpSurface ? (
        <div className="space-y-2 rounded-lg border border-rose-500/20 bg-card/60 px-3 py-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("frame.viewEngineRoom")}>
            {modes.map((m) => (
              <Button
                key={m.id}
                type="button"
                size="sm"
                variant={bcp.mode === m.id ? "secondary" : "ghost"}
                disabled={m.id === "engine-room" && !bcp.canRoom}
                onClick={() => bcp.setMode(m.id)}
              >
                {m.label}
              </Button>
            ))}
          </div>
          {bcp.mode === "overlay" ? (
            <p className="text-[11px] text-muted-foreground">
              {t("frame.overlayHint", { cash: formatCurrency(snapshot.reserveDepthHuf) })}
            </p>
          ) : null}
          {bcp.mode === "engine-room" && bcp.canRoom ? <BcpEngineRoom snapshot={snapshot} compact /> : null}
        </div>
      ) : null}
    </div>
  );
}
