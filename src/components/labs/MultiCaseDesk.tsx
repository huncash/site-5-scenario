import { useQuery } from "@tanstack/react-query";
import { Lock, Sigma } from "lucide-react";

import { LabActiveMark } from "@/components/labs/LabActiveDot";
import { LabSection } from "@/components/labs/LabSection";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import type { WorkspaceMeta } from "@/lib/finance";
import { weighActiveCaseFromLocalDb } from "@/lib/casePayload";
import { FUSION_ERROR_HU, licenseFingerprint, maskLicenseToken, readInstanceBind } from "@/lib/licenseFusion";
import { readLicense } from "@/lib/license";
import { localdb } from "@/lib/localdb";
import { useVault } from "@/lib/vault";

export function MultiCaseDesk({
  profileId,
  profileName,
  workspaces,
  onOpenSlot,
  onLeave,
}: {
  profileId: string;
  profileName: string;
  workspaces: WorkspaceMeta[];
  onOpenSlot: (workspaceId: string) => void;
  onLeave: () => void;
}) {
  const { t } = useI18n();
  const { backToPicker } = useVault();
  const profilesQ = useQuery({
    queryKey: ["profiles"],
    queryFn: () => localdb.listProfiles(),
  });
  const payloadQ = useQuery({
    queryKey: ["case-payload", profileId],
    queryFn: () => weighActiveCaseFromLocalDb(),
  });
  const lic = readLicense();
  const bind = readInstanceBind();
  const token = lic?.token ?? bind?.token ?? "";
  const fp = token ? licenseFingerprint(token) : "—";
  const mask = token ? maskLicenseToken(token) : t("labs.noToken");
  const others = (profilesQ.data ?? []).filter((p) => p.id !== profileId);

  return (
    <LabSection id="labs-szumma" className="szumma-desk-enter flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-5">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sigma className="h-4 w-4 text-emerald-400" />
              <h2 className="text-base font-semibold tracking-tight">{t("labs.multiTitle")}</h2>
              <LabActiveMark label={t("labs.active")} />
            </div>
            <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted-foreground">
              {t("labs.multiLead")}
            </p>
            <p className="mt-1 max-w-xl text-[11px] leading-snug text-muted-foreground">
              {payloadQ.data?.heavy ? t("labs.payloadHeavy") : t("labs.payloadHint")}
            </p>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={onLeave}>
            {t("labs.backToCase")}
          </Button>
        </header>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-[12px] leading-snug text-amber-950 dark:text-amber-100">
          <div className="flex items-start gap-2">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{FUSION_ERROR_HU}</span>
          </div>
          <div className="mt-2 font-mono text-[11px] text-muted-foreground">
            {t("labs.bindLine", { mask, fp })}
          </div>
        </div>

        <section className="rounded-xl border border-border/60 bg-card/70 p-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("labs.activeCase", { name: profileName })}
          </h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {t("labs.snapshotBefore")}
          </p>
          <ul className="mt-3 grid gap-2">
            {(workspaces.length
              ? workspaces
              : [{ id: "personal", type: "personal" as const, alias: t("stats.personal") }]
            ).map((w) => (
              <li key={w.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-background/40 px-3 py-2 text-left text-sm hover:border-emerald-400/50 hover:bg-emerald-500/8"
                  onClick={() => onOpenSlot(w.id)}
                >
                  <span className="truncate font-medium">{w.alias?.trim() || w.id}</span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{w.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/60 bg-card/50 p-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("labs.otherCase")}
          </h3>
          {others.length === 0 ? (
            <p className="mt-2 text-[12px] text-muted-foreground">{t("labs.noOther")}</p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {others.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-border/70 bg-background/30 px-3 py-2 text-left text-sm hover:bg-muted/40"
                    onClick={() => void backToPicker()}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t("labs.isolatedLock")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </LabSection>
  );
}
