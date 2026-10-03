import { LeanTerm } from "@/components/HelpIcon";
import { GuidedTourBanner, GuidedTourRestoreChip } from "@/components/strategy/GuidedTourBanner";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/finance";
import type { KahnGuideWorkspace, KahnImpactScenario } from "@/lib/kahnGuide";
import {
  KAHN_FOCUS_IDS,
  KAHN_JARGON,
  KAHN_STOP_LOSS_ALERT_EN,
  KAHN_STOP_LOSS_ALERT_HU,
  kahnPersonalFlow,
} from "@/lib/kahnCrossTab";

export { GuidedTourBanner, GuidedTourRestoreChip };

/** @deprecated név — GuidedTourBanner */
export function KahnCaseGuide(props: {
  scenario: KahnImpactScenario;
  activeWorkspace: string;
  onGoWorkspace: (ws: KahnGuideWorkspace) => void;
}) {
  return <GuidedTourBanner {...props} />;
}

/** Magán fül: optimista megtakarítás/osztalék újraszámolás; pesszimista stop-loss. */
export function KahnPersonalImpact(props: {
  scenario: KahnImpactScenario;
  onGoProject: () => void;
}) {
  const { t, locale } = useI18n();
  const hu = locale !== "en";
  const flow = kahnPersonalFlow(props.scenario);

  if (flow.stopLossActive) {
    return (
      <aside
        id={KAHN_FOCUS_IDS.personal}
        className="rounded-xl border border-rose-400/50 bg-rose-500/12 p-3"
        role="alert"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-200">
          {t("kahnGuide.impact.pessTitle")}
        </p>
        <p className="mt-1.5 text-[13px] font-medium leading-snug text-foreground">
          {hu ? KAHN_STOP_LOSS_ALERT_HU : KAHN_STOP_LOSS_ALERT_EN}
        </p>
        <p className="mt-2 text-[12px] leading-snug text-muted-foreground">
          {t("kahnGuide.impact.pessBody", {
            pct: String(flow.payCutPct),
            months: String(flow.minRunwayMonths),
            savings: formatMoney(flow.savingsFrameHuf, "HUF"),
            dividend: formatMoney(flow.dividendFrameHuf, "HUF"),
          })}
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-md border border-border/40 bg-background/40 p-2">
            <dt className="text-muted-foreground">{t("kahnGuide.impact.savingsFrame")}</dt>
            <dd className="font-mono text-foreground">{formatMoney(flow.savingsFrameHuf, "HUF")}</dd>
          </div>
          <div className="rounded-md border border-border/40 bg-background/40 p-2">
            <dt className="text-muted-foreground">{t("kahnGuide.impact.dividendFrame")}</dt>
            <dd className="font-mono text-foreground">{formatMoney(flow.dividendFrameHuf, "HUF")}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={props.onGoProject}
          className="mt-2 text-[11px] font-medium text-rose-200 underline-offset-2 hover:underline"
        >
          {t("kahnGuide.impact.backProject")}
        </button>
      </aside>
    );
  }

  if (props.scenario === "optimistic") {
    return (
      <aside
        id={KAHN_FOCUS_IDS.personal}
        className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-3"
        role="status"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200">
          {t("kahnGuide.impact.optTitle")}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-foreground">
          {t("kahnGuide.impact.optBody", {
            amount: formatMoney(flow.dividendDeltaHuf, "HUF"),
            savings: formatMoney(flow.savingsDeltaHuf, "HUF"),
          })}
        </p>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-md border border-emerald-400/30 bg-background/40 p-2">
            <dt className="text-muted-foreground">{t("kahnGuide.impact.savingsFrame")}</dt>
            <dd className="font-mono text-emerald-100">
              {formatMoney(flow.savingsFrameHuf, "HUF")}{" "}
              <span className="text-emerald-200/80">(+{formatMoney(flow.savingsDeltaHuf, "HUF")})</span>
            </dd>
          </div>
          <div className="rounded-md border border-emerald-400/30 bg-background/40 p-2">
            <dt className="text-muted-foreground">{t("kahnGuide.impact.dividendFrame")}</dt>
            <dd className="font-mono text-emerald-100">
              {formatMoney(flow.dividendFrameHuf, "HUF")}{" "}
              <span className="text-emerald-200/80">(+{formatMoney(flow.dividendDeltaHuf, "HUF")})</span>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={props.onGoProject}
          className="mt-2 text-[11px] font-medium text-emerald-200 underline-offset-2 hover:underline"
        >
          {t("kahnGuide.impact.backProject")}
        </button>
      </aside>
    );
  }

  return (
    <aside
      id={KAHN_FOCUS_IDS.personal}
      className="rounded-xl border border-border/50 bg-card/60 p-3"
      role="status"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("kahnGuide.impact.realTitle")}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{t("kahnGuide.impact.realBody")}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-md border border-border/40 bg-background/40 p-2">
          <dt className="text-muted-foreground">{t("kahnGuide.impact.savingsFrame")}</dt>
          <dd className="font-mono text-foreground">{formatMoney(flow.savingsFrameHuf, "HUF")}</dd>
        </div>
        <div className="rounded-md border border-border/40 bg-background/40 p-2">
          <dt className="text-muted-foreground">{t("kahnGuide.impact.dividendFrame")}</dt>
          <dd className="font-mono text-foreground">{formatMoney(flow.dividendFrameHuf, "HUF")}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={props.onGoProject}
        className="mt-2 text-[11px] font-medium text-foreground underline-offset-2 hover:underline"
      >
        {t("kahnGuide.impact.backProject")}
      </button>
    </aside>
  );
}

export function KahnWorkspaceHint(props: {
  kind: "business" | "project";
  onGoPersonal: () => void;
  onGoOther: () => void;
}) {
  const { t } = useI18n();
  return (
    <p className="rounded-lg border border-border/40 bg-background/40 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
      {props.kind === "business" ? t("kahnGuide.hint.business") : t("kahnGuide.hint.project")}{" "}
      <button type="button" className="font-medium text-cyan-200 underline-offset-2 hover:underline" onClick={props.onGoOther}>
        {props.kind === "business" ? t("kahnGuide.tab.project") : t("kahnGuide.tab.core")}
      </button>
      {" · "}
      <button type="button" className="font-medium text-cyan-200 underline-offset-2 hover:underline" onClick={props.onGoPersonal}>
        {t("kahnGuide.tab.personal")}
      </button>
    </p>
  );
}

/** Projekt fülön: stop-loss korlátozó jelzés a pesszimista ágon. */
export function KahnProjectStopLossBanner(props: {
  scenario: KahnImpactScenario;
  onGoPersonal: () => void;
}) {
  const { t, locale } = useI18n();
  const hu = locale !== "en";
  if (props.scenario !== "pessimistic") return null;
  return (
    <aside className="rounded-xl border border-rose-400/45 bg-rose-500/10 p-3" role="alert">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-200">
        <LeanTerm
          title={hu ? KAHN_JARGON.stopLoss.termHu : KAHN_JARGON.stopLoss.termEn}
          exact={hu ? KAHN_JARGON.stopLoss.exactHu : KAHN_JARGON.stopLoss.exactEn}
        >
          Stop-loss
        </LeanTerm>
      </p>
      <p className="mt-1.5 text-[13px] font-medium leading-snug text-foreground">
        {hu ? KAHN_STOP_LOSS_ALERT_HU : KAHN_STOP_LOSS_ALERT_EN}
      </p>
      <button
        type="button"
        onClick={props.onGoPersonal}
        className="mt-2 text-[11px] font-medium text-rose-200 underline-offset-2 hover:underline"
      >
        {t("kahnGuide.tab.personal")}
      </button>
    </aside>
  );
}

/** Core fül: törzs állapot + a projekt ág visszacsatolása. */
export function KahnCoreLinkStrip(props: {
  scenario: KahnImpactScenario;
  onGoProject: () => void;
  onGoPersonal: () => void;
}) {
  const { t } = useI18n();
  const flow = kahnPersonalFlow(props.scenario);
  return (
    <aside
      id={KAHN_FOCUS_IDS.core}
      className="rounded-xl border border-border/50 bg-card/70 p-3"
      role="status"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t("kahnGuide.coreStripTitle")}
      </p>
      <p className="mt-1 text-[12px] leading-snug text-foreground">{t("kahnGuide.coreStripBody")}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {t("kahnGuide.coreStripLink", {
          scenario: t(`dash.${props.scenario}` as "dash.realistic"),
          dividend: formatMoney(flow.dividendFrameHuf, "HUF"),
        })}
      </p>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
        <button type="button" className="font-medium text-cyan-200 underline-offset-2 hover:underline" onClick={props.onGoProject}>
          {t("kahnGuide.open.project")}
        </button>
        <button type="button" className="font-medium text-cyan-200 underline-offset-2 hover:underline" onClick={props.onGoPersonal}>
          {t("kahnGuide.open.personal")}
        </button>
      </div>
    </aside>
  );
}
