import { BcpPracticeDelta } from "@/components/engine/BcpPracticeDelta";
import { AnonLabPanel } from "@/components/education/AnonLabPanel";
import { useEngineView } from "@/hooks/useEngineView";
import { useLabsEngines } from "@/hooks/useLabsEngines";
import { useI18n, type MessageKey } from "@/i18n";
import { isEducationSegment } from "@/lib/educationCases";
import {
  ENGINE_SECTION_ID,
  isEngineLicensed,
  scrollEngineSection,
  type EngineViewFocus,
} from "@/lib/engineView";
import { isResilienceSegment } from "@/lib/resilienceCases";
import type { EconomicReadSnapshot } from "@/lib/bcpEconomicOverlay";
import type { AnonSourceRow } from "@/lib/educationAnonymize";
import type { LabsEngineId } from "@/lib/labsTechTree";
import { cn } from "@/lib/utils";

const TAB_KEY: Record<LabsEngineId, MessageKey> = {
  economic: "labs.tabEconomic",
  education: "labs.tabEducation",
  resilience: "labs.tabResilience",
};

/** Sticky chrome — Magán / alhalmaz mellett, nem a BCP tartalom fölött. */
export function EngineViewTabs() {
  const { t } = useI18n();
  const { on: engines } = useLabsEngines();
  const { focus, setFocus } = useEngineView();
  const extraOn =
    (isEngineLicensed("education") && engines.education) ||
    (isEngineLicensed("resilience") && engines.resilience);
  if (!extraOn) return null;

  const pick = (id: EngineViewFocus) => {
    setFocus(id);
    requestAnimationFrame(() => scrollEngineSection(id));
  };

  return (
    <nav
      id={ENGINE_SECTION_ID.economic}
      aria-label={t("labs.tabEconomic")}
      className="flex min-w-0 flex-wrap items-center gap-1.5 pb-1"
    >
      {(["economic", "education", "resilience"] as const)
        .filter((id) => id === "economic" || (isEngineLicensed(id) && engines[id]))
        .map((id) => (
          <button
            key={id}
            type="button"
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold leading-snug",
              focus === id
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                : "border-border/70 bg-card/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
            onClick={() => pick(id)}
          >
            {t(TAB_KEY[id])}
          </button>
        ))}
    </nav>
  );
}

export function EngineFocusSurface({
  segmentId,
  snapshot,
  showAnonOnDashboard = false,
  anonRows,
}: {
  segmentId: string | null | undefined;
  snapshot: EconomicReadSnapshot;
  showAnonOnDashboard?: boolean;
  anonRows?: AnonSourceRow[];
}) {
  const { on: engines } = useLabsEngines();
  const { focus } = useEngineView();

  const showEdu =
    isEngineLicensed("education") &&
    !isEducationSegment(segmentId) &&
    (showAnonOnDashboard || (engines.education && focus === "education"));
  const showBcp =
    isEngineLicensed("resilience") &&
    focus === "resilience" &&
    engines.resilience &&
    !isResilienceSegment(segmentId);

  if (!showEdu && !showBcp) return null;

  return (
    <div className="space-y-2">
      {showEdu ? (
        <section id={ENGINE_SECTION_ID.education}>
          <AnonLabPanel snapshot={snapshot} rows={anonRows} />
        </section>
      ) : null}

      {showBcp ? (
        <section id={ENGINE_SECTION_ID.resilience} className="scroll-mt-[14rem]">
          <BcpPracticeDelta snapshot={snapshot} />
        </section>
      ) : null}
    </div>
  );
}
