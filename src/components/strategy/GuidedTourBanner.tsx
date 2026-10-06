import { useEffect, useState } from "react";
import { EyeOff, X } from "lucide-react";

import { CollapsibleCard } from "@/components/lean-viz/CollapsibleCard";
import { HelpIcon } from "@/components/HelpIcon";
import { useSupportEmbedOptional } from "@/components/support/SupportEmbedProvider";
import { useI18n } from "@/i18n";
import {
  kahnGuideChain,
  readKahnGuideHidden,
  writeKahnGuideHidden,
  type KahnGuideWorkspace,
  type KahnImpactScenario,
} from "@/lib/kahnGuide";
import { KAHN_FOCUS_IDS, kahnSphereFromWorkspace } from "@/lib/kahnCrossTab";

export function GuidedTourBanner(props: {
  scenario: KahnImpactScenario;
  activeWorkspace: string;
  onGoWorkspace: (ws: KahnGuideWorkspace) => void;
}) {
  const { t } = useI18n();
  const embed = useSupportEmbedOptional();
  const [hidden, setHidden] = useState(() => readKahnGuideHidden());
  const chain = kahnGuideChain();
  const activeSphere = kahnSphereFromWorkspace(props.activeWorkspace);

  useEffect(() => {
    const sync = () => setHidden(readKahnGuideHidden());
    window.addEventListener("szcenario:kahn_guide_hidden", sync);
    return () => window.removeEventListener("szcenario:kahn_guide_hidden", sync);
  }, []);

  if (hidden) return null;

  return (
    <CollapsibleCard
      id="kahn-guide"
      className="kahn-guide rounded-xl border border-border/60 bg-card/80 p-3"
      title={
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-main)]">
          {t("kahnGuide.bannerTitle")}
          <HelpIcon kbId="lesson-kahn" title={t("panel.kahnHelp")} size="sm" />
        </span>
      }
      headerRight={
        <button
          type="button"
          onClick={() => {
            writeKahnGuideHidden(true);
            setHidden(true);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background px-2 py-1 text-[11px] text-[var(--text-main)]"
          title={t("kahnGuide.hideForever")}
        >
          <EyeOff className="h-3.5 w-3.5" />
          {t("kahnGuide.hideForever")}
        </button>
      }
    >
      <nav className="flex flex-wrap items-center gap-1.5" aria-label={t("kahnGuide.chainAria")} id={KAHN_FOCUS_IDS.tour}>
        {chain.map((node, i) => (
          <span key={node.id} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <span className="text-[var(--text-muted)]" aria-hidden>
                →
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => props.onGoWorkspace(node.workspace)}
              className={
                activeSphere === node.id
                  ? "rounded-md border border-border bg-[var(--dropdown-hover)] px-2 py-1 text-[11px] font-semibold text-[var(--text-main)]"
                  : "rounded-md border border-border/50 bg-background px-2 py-1 text-[11px] text-[var(--text-main)]"
              }
            >
              {t(`kahnGuide.tab.${node.id}` as "kahnGuide.tab.core")}
            </button>
          </span>
        ))}
        <span className="ml-auto text-[10px] uppercase tracking-wider text-[var(--text-main)]">
          {t(`dash.${props.scenario}` as "dash.realistic")}
        </span>
      </nav>
      {embed ? (
        <button
          type="button"
          onClick={() => embed.openEmbed("kahn-strategiai-elagazas", t("panel.kahnHelp"))}
          className="mt-2 text-[11px] font-medium text-[var(--text-main)] underline-offset-2 hover:underline"
        >
          {t("kahnGuide.openLesson")}
        </button>
      ) : null}
    </CollapsibleCard>
  );
}

export function GuidedTourRestoreChip() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(() => readKahnGuideHidden());
  useEffect(() => {
    const sync = () => setHidden(readKahnGuideHidden());
    window.addEventListener("szcenario:kahn_guide_hidden", sync);
    return () => window.removeEventListener("szcenario:kahn_guide_hidden", sync);
  }, []);
  if (!hidden) return null;
  return (
    <button
      type="button"
      onClick={() => {
        writeKahnGuideHidden(false);
        setHidden(false);
      }}
      className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-card px-2 py-1 text-[11px] text-[var(--text-main)]"
    >
      <X className="h-3 w-3 rotate-45" aria-hidden />
      {t("kahnGuide.showAgain")}
    </button>
  );
}
