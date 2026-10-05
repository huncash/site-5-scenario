import { useEffect, useState } from "react";

import { ScenarioDoor } from "@/components/ScenarioDoor";
import { StudentProofForm } from "@/components/school/StudentProofForm";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { useI18n } from "@/i18n";
import {
  SCHOOL_CASES,
  SCHOOL_PROOF_EVENT,
  SCHOOL_SLOTS_PER_CASE,
  SCHOOL_WATERMARK,
  isSchoolVerified,
} from "@/lib/school";

export function SchoolSurface() {
  const { t } = useI18n();
  const [verified, setVerified] = useState(() => isSchoolVerified());

  useEffect(() => {
    const sync = () => setVerified(isSchoolVerified());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(SCHOOL_PROOF_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(SCHOOL_PROOF_EVENT, sync);
    };
  }, []);

  if (verified) return <ScenarioDoor />;

  return (
    <div className="door-page h-dvh overflow-x-hidden overflow-y-auto overscroll-contain bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{t("brand.name")}</div>
            <div className="truncate text-[10px] tracking-wide text-muted-foreground">{t("school.kicker")}</div>
          </div>
          <ViewSettingsMenu />
        </div>
      </header>
      <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-10">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t("school.kicker")}</p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground">{t("school.title")}</h1>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground">{t("school.lead")}</p>
          <ul className="space-y-1.5 text-sm text-foreground/90">
            <li>
              {SCHOOL_CASES} {t("school.casesLabel")} · {SCHOOL_SLOTS_PER_CASE} {t("school.slotsLabel")}
            </li>
            <li>{t("school.capacity")}</li>
            <li>{t("school.engineOnly")}</li>
            <li>{SCHOOL_WATERMARK}</li>
          </ul>
        </div>
        <StudentProofForm onVerified={() => setVerified(true)} />
      </div>
      <SiteFooter inline />
    </div>
  );
}
