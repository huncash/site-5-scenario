import { useEffect, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, EyeOff, X } from "lucide-react";

import { HelpIcon } from "@/components/HelpIcon";
import { useSupportEmbedOptional } from "@/components/support/SupportEmbedProvider";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/finance";
import {
  kahnGuideChain,
  readKahnGuideCollapsed,
  readKahnGuideHidden,
  writeKahnGuideCollapsed,
  writeKahnGuideHidden,
  type KahnGuideWorkspace,
  type KahnImpactScenario,
} from "@/lib/kahnGuide";
import {
  KAHN_FOCUS_IDS,
  KAHN_JARGON,
  KAHN_TOUR_STEPS,
  kahnSphereFromWorkspace,
} from "@/lib/kahnCrossTab";
import { KAHN_FORK } from "@/lib/strategyCases";

/** Összecsukható / tartósan elrejthető 3 lépéses Kahn oktatói panel. */
export function GuidedTourBanner(props: {
  scenario: KahnImpactScenario;
  activeWorkspace: string;
  onGoWorkspace: (ws: KahnGuideWorkspace) => void;
}) {
  const { t, locale } = useI18n();
  const hu = locale !== "en";
  const embed = useSupportEmbedOptional();
  const [collapsed, setCollapsed] = useState(() => readKahnGuideCollapsed());
  const [hidden, setHidden] = useState(() => readKahnGuideHidden());
  const chain = kahnGuideChain();
  const activeSphere = kahnSphereFromWorkspace(props.activeWorkspace);

  useEffect(() => {
    const sync = () => setHidden(readKahnGuideHidden());
    window.addEventListener("szcenario:kahn_guide_hidden", sync);
    return () => window.removeEventListener("szcenario:kahn_guide_hidden", sync);
  }, []);

  if (hidden) return null;

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    writeKahnGuideCollapsed(next);
  };

  const hideForever = () => {
    writeKahnGuideHidden(true);
    setHidden(true);
  };

  return (
    <section
      id={KAHN_FOCUS_IDS.tour}
      className="kahn-guide rounded-xl border border-cyan-400/35 bg-cyan-500/[0.07] p-3"
      aria-label={t("kahnGuide.bannerTitle")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-200/90">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            {t("kahnGuide.bannerTitle")}
            <HelpIcon kbId="lesson-kahn" title={t("panel.kahnHelp")} size="sm" />
          </p>
          <p className="mt-1 max-w-3xl text-[12px] leading-snug text-muted-foreground">{t("kahnGuide.bannerLead")}</p>
          {embed ? (
            <button
              type="button"
              onClick={() => embed.openEmbed("kahn-strategiai-elagazas", t("panel.kahnHelp"))}
              className="mt-1.5 text-[11px] font-medium text-cyan-200 underline-offset-2 hover:underline"
            >
              {t("kahnGuide.openLesson")}
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-1 text-[11px] font-medium text-foreground"
            aria-expanded={!collapsed}
          >
            {collapsed ? t("kahnGuide.expand") : t("kahnGuide.collapse")}
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={hideForever}
            className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            title={t("kahnGuide.hideForever")}
          >
            <EyeOff className="h-3.5 w-3.5" />
            {t("kahnGuide.hideForever")}
          </button>
        </div>
      </div>

      <nav className="mt-3 flex flex-wrap items-center gap-1.5" aria-label={t("kahnGuide.chainAria")}>
        {chain.map((node, i) => (
          <span key={node.id} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => props.onGoWorkspace(node.workspace)}
              className={
                activeSphere === node.id
                  ? "rounded-md border border-cyan-300/70 bg-cyan-500/20 px-2 py-1 text-[11px] font-semibold text-foreground"
                  : "rounded-md border border-border/50 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
              }
            >
              {t(`kahnGuide.tab.${node.id}` as "kahnGuide.tab.core")}
            </button>
          </span>
        ))}
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          {t(`dash.${props.scenario}` as "dash.realistic")}
        </span>
      </nav>

      {collapsed ? null : (
        <>
          <ol className="mt-3 grid gap-2 sm:grid-cols-3">
            {KAHN_TOUR_STEPS.map((step, idx) => (
              <li key={step.id} className="rounded-lg border border-border/50 bg-background/50 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("kahnGuide.stepLabel", { n: String(idx + 1) })}
                </p>
                <h3 className="mt-0.5 text-[13px] font-semibold leading-snug text-foreground">
                  {hu ? step.titleHu : step.titleEn}
                </h3>
                <button
                  type="button"
                  onClick={() => props.onGoWorkspace(chain[idx]?.workspace ?? "business")}
                  className="mt-2 text-[11px] font-medium text-cyan-200 underline-offset-2 hover:underline"
                >
                  {t(`kahnGuide.open.${step.id}` as "kahnGuide.open.core")}
                </button>
              </li>
            ))}
          </ol>

          <dl className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border/40 bg-background/40 p-2">
              <dt className="text-[11px] font-semibold text-foreground">
                {hu ? KAHN_JARGON.runway.termHu : KAHN_JARGON.runway.termEn}
              </dt>
              <dd className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {hu ? KAHN_JARGON.runway.exactHu : KAHN_JARGON.runway.exactEn}
              </dd>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-2">
              <dt className="text-[11px] font-semibold text-foreground">
                {hu ? KAHN_JARGON.stopLoss.termHu : KAHN_JARGON.stopLoss.termEn}
              </dt>
              <dd className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {hu ? KAHN_JARGON.stopLoss.exactHu : KAHN_JARGON.stopLoss.exactEn}
              </dd>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 p-2">
              <dt className="text-[11px] font-semibold text-foreground">
                {hu ? KAHN_JARGON.penalty.termHu : KAHN_JARGON.penalty.termEn}
              </dt>
              <dd className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {hu ? KAHN_JARGON.penalty.exactHu : KAHN_JARGON.penalty.exactEn}{" "}
                <span className="text-foreground/80">
                  ({formatMoney(KAHN_FORK.contractA.exitPenaltyHuf, "HUF")} vs{" "}
                  {formatMoney(KAHN_FORK.optionFeeHuf, "HUF")})
                </span>
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
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
      className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-card px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground"
    >
      <X className="h-3 w-3 rotate-45" aria-hidden />
      {t("kahnGuide.showAgain")}
    </button>
  );
}
