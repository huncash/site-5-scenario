import { LeanTerm } from "@/components/HelpIcon";
import { CollapsibleCard, DetailFold } from "@/components/lean-viz/CollapsibleCard";
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

const ink = "text-[var(--text-main)]";
const inkMuted = "text-[var(--text-muted)]";
const linkCls = "font-medium text-[var(--text-main)] underline-offset-2 hover:underline";

/** Magán fül: keretszámok; pesszimista stop-loss nyitva marad. */
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
        className="rounded-xl border border-rose-400/50 bg-background p-3"
        role="alert"
      >
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${ink}`}>
          {t("kahnGuide.impact.pessTitle")}
        </p>
        <p className={`mt-1.5 text-[13px] font-medium leading-snug ${ink}`}>
          {hu ? KAHN_STOP_LOSS_ALERT_HU : KAHN_STOP_LOSS_ALERT_EN}
        </p>
        <dl className="mt-2 grid grid-cols-1 gap-2 text-[11px] min-w-0 lg:grid-cols-2">
          <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
            <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.savingsFrame")}</dt>
            <dd className={`min-w-[4.5rem] font-mono ${ink}`}>{formatMoney(flow.savingsFrameHuf, "HUF")}</dd>
          </div>
          <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
            <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.dividendFrame")}</dt>
            <dd className={`min-w-[4.5rem] font-mono ${ink}`}>{formatMoney(flow.dividendFrameHuf, "HUF")}</dd>
          </div>
        </dl>
        <DetailFold
          id="kahn-impact-pess"
          text={t("kahnGuide.impact.pessBody", {
            pct: String(flow.payCutPct),
            months: String(flow.minRunwayMonths),
            savings: formatMoney(flow.savingsFrameHuf, "HUF"),
            dividend: formatMoney(flow.dividendFrameHuf, "HUF"),
          })}
        />
        <button type="button" onClick={props.onGoProject} className={`mt-2 text-[11px] ${linkCls}`}>
          {t("kahnGuide.impact.backProject")}
        </button>
      </aside>
    );
  }

  if (props.scenario === "optimistic") {
    return (
      <CollapsibleCard
        id="kahn-impact-opt"
        className="rounded-xl border border-border/60 bg-card/80 p-3"
        title={
          <span id={KAHN_FOCUS_IDS.personal} className={`text-[11px] font-semibold uppercase tracking-wider ${ink}`}>
            {t("kahnGuide.impact.optTitle")}
          </span>
        }
      >
        <dl className="grid grid-cols-1 gap-2 text-[11px] min-w-0 lg:grid-cols-2">
          <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
            <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.savingsFrame")}</dt>
            <dd className={`min-w-[4.5rem] font-mono ${ink}`}>
              {formatMoney(flow.savingsFrameHuf, "HUF")} (+{formatMoney(flow.savingsDeltaHuf, "HUF")})
            </dd>
          </div>
          <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
            <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.dividendFrame")}</dt>
            <dd className={`min-w-[4.5rem] font-mono ${ink}`}>
              {formatMoney(flow.dividendFrameHuf, "HUF")} (+{formatMoney(flow.dividendDeltaHuf, "HUF")})
            </dd>
          </div>
        </dl>
        <DetailFold
          id="kahn-impact-opt-body"
          text={t("kahnGuide.impact.optBody", {
            amount: formatMoney(flow.dividendDeltaHuf, "HUF"),
            savings: formatMoney(flow.savingsDeltaHuf, "HUF"),
          })}
        />
        <button type="button" onClick={props.onGoProject} className={`mt-2 text-[11px] ${linkCls}`}>
          {t("kahnGuide.impact.backProject")}
        </button>
      </CollapsibleCard>
    );
  }

  return (
    <CollapsibleCard
      id="kahn-impact-real"
      className="rounded-xl border border-border/60 bg-card/80 p-3"
      title={
        <span id={KAHN_FOCUS_IDS.personal} className={`text-[11px] font-semibold uppercase tracking-wider ${ink}`}>
          {t("kahnGuide.impact.realTitle")}
        </span>
      }
    >
      <dl className="grid grid-cols-1 gap-2 text-[11px] min-w-0 lg:grid-cols-2">
        <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
          <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.savingsFrame")}</dt>
          <dd className={`min-w-[4.5rem] font-mono ${ink}`}>{formatMoney(flow.savingsFrameHuf, "HUF")}</dd>
        </div>
        <div className="min-w-0 rounded-md border border-border/40 bg-background p-2">
          <dt className={`${inkMuted} break-words`}>{t("kahnGuide.impact.dividendFrame")}</dt>
          <dd className={`min-w-[4.5rem] font-mono ${ink}`}>{formatMoney(flow.dividendFrameHuf, "HUF")}</dd>
        </div>
      </dl>
      <DetailFold id="kahn-impact-real-body" text={t("kahnGuide.impact.realBody")} />
      <button type="button" onClick={props.onGoProject} className={`mt-2 text-[11px] ${linkCls}`}>
        {t("kahnGuide.impact.backProject")}
      </button>
    </CollapsibleCard>
  );
}

export function KahnWorkspaceHint(props: {
  kind: "business" | "project";
  onGoPersonal: () => void;
  onGoOther: () => void;
}) {
  const { t } = useI18n();
  return (
    <p className={`rounded-lg border border-border/40 bg-background px-2.5 py-2 text-[11px] leading-snug ${ink}`}>
      {props.kind === "business" ? t("kahnGuide.hint.business") : t("kahnGuide.hint.project")}{" "}
      <button type="button" className={linkCls} onClick={props.onGoOther}>
        {props.kind === "business" ? t("kahnGuide.tab.project") : t("kahnGuide.tab.core")}
      </button>
      {" · "}
      <button type="button" className={linkCls} onClick={props.onGoPersonal}>
        {t("kahnGuide.tab.personal")}
      </button>
    </p>
  );
}

export function KahnProjectStopLossBanner(props: {
  scenario: KahnImpactScenario;
  onGoPersonal: () => void;
}) {
  const { t, locale } = useI18n();
  const hu = locale !== "en";
  if (props.scenario !== "pessimistic") return null;
  return (
    <aside className="rounded-xl border border-rose-400/45 bg-background p-3" role="alert">
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${ink}`}>
        <LeanTerm
          title={hu ? KAHN_JARGON.stopLoss.termHu : KAHN_JARGON.stopLoss.termEn}
          exact={hu ? KAHN_JARGON.stopLoss.exactHu : KAHN_JARGON.stopLoss.exactEn}
        >
          Stop-loss
        </LeanTerm>
      </p>
      <p className={`mt-1.5 text-[13px] font-medium leading-snug ${ink}`}>
        {hu ? KAHN_STOP_LOSS_ALERT_HU : KAHN_STOP_LOSS_ALERT_EN}
      </p>
      <button type="button" onClick={props.onGoPersonal} className={`mt-2 text-[11px] ${linkCls}`}>
        {t("kahnGuide.tab.personal")}
      </button>
    </aside>
  );
}

export function KahnCoreLinkStrip(props: {
  scenario: KahnImpactScenario;
  onGoProject: () => void;
  onGoPersonal: () => void;
}) {
  const { t } = useI18n();
  const flow = kahnPersonalFlow(props.scenario);
  return (
    <CollapsibleCard
      id="kahn-core-strip"
      className="rounded-xl border border-border/50 bg-card/70 p-3"
      title={
        <span id={KAHN_FOCUS_IDS.core} className={`text-[11px] font-semibold uppercase tracking-wider ${ink}`}>
          {t("kahnGuide.coreStripTitle")}
        </span>
      }
    >
      <p className={`text-[12px] leading-snug ${ink}`}>
        {t("kahnGuide.coreStripLink", {
          scenario: t(`dash.${props.scenario}` as "dash.realistic"),
          dividend: formatMoney(flow.dividendFrameHuf, "HUF"),
        })}
      </p>
      <DetailFold id="kahn-core-strip-body" text={t("kahnGuide.coreStripBody")} />
      <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
        <button type="button" className={linkCls} onClick={props.onGoProject}>
          {t("kahnGuide.open.project")}
        </button>
        <button type="button" className={linkCls} onClick={props.onGoPersonal}>
          {t("kahnGuide.open.personal")}
        </button>
      </div>
    </CollapsibleCard>
  );
}
