import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { CAMPAIGN_FUNNELS } from "@/content/funnels/campaigns";
import { filterByCampaign, type CampaignId } from "@/lib/campaignFunnels";
import { captureCampaignFromLocation, readCampaignId } from "@/lib/campaignSession";
import { demoSerialFromId, publicSegmentById, type DemoSegmentId } from "@/lib/demoCatalog";
import { coreCasesOnStep, KAHN_SEGMENT_ID } from "@/lib/coreCases";
import { readScenarioDoorStep, writeScenarioDoorStep, type ScenarioDoorStep } from "@/lib/doorStep";
import { SETTINGS_FOCUS_DEMO_RESET } from "@/lib/versionPolicy";
import { ProChartCallout, ProChartSketch } from "@/components/home/ProChartExplain";
import { caseBlurb, caseTitle, useI18n, type MessageKey } from "@/i18n";
import { useVault } from "@/lib/vault";
import { localdb } from "@/lib/localdb";

const HomePricing = lazy(() => import("@/components/home/HomePricing").then((m) => ({ default: m.HomePricing })));

const LATER_TYPES = ["climate", "political"] as const;

const ECONOMIC_INDUSTRIES = ["hospitality", "healthcare", "manufacturing", "strategy"] as const;

export function ScenarioDoor() {
  const { t, locale } = useI18n();
  const face = (s: { id: string; title: string; blurb: string }) => {
    const title = caseTitle(s.id, locale) ?? s.title;
    const serial = demoSerialFromId(s.id);
    return {
      title: serial != null ? `DEMO ${serial} — ${title}` : title,
      blurb: caseBlurb(s.id, locale) ?? s.blurb,
    };
  };
  const navigate = useNavigate();
  const { unlockById, createProfile } = useVault();
  const [step, setStep] = useState<ScenarioDoorStep>("type");
  const [busyId, setBusyId] = useState<DemoSegmentId | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campus, setCampus] = useState(false);
  const [campaignId, setCampaignId] = useState<CampaignId | null>(null);
  const inFlight = useRef(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const campaign = campaignId ? CAMPAIGN_FUNNELS[campaignId] : null;
  const casesOn = (stepName: ScenarioDoorStep) =>
    coreCasesOnStep(stepName)
      .map((id) => publicSegmentById(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const educationCases = useMemo(() => filterByCampaign(casesOn("education"), campaignId), [campaignId]);
  const resilienceCases = useMemo(() => filterByCampaign(casesOn("resilience"), campaignId), [campaignId]);
  const strategyCases = useMemo(() => filterByCampaign(casesOn("strategy"), campaignId), [campaignId]);

  const preferDashboardHome = () => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem("szcenario_home_mode", "dashboard");
      window.localStorage.setItem("szcenario_onboarding_pending", "1");
      window.dispatchEvent(new Event("szcenario:home_mode"));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    captureCampaignFromLocation({ doorStep: true });
    setCampaignId(readCampaignId());
    try {
      const refCode = new URLSearchParams(window.location.search).get("referral");
      if (refCode && /^REF-/i.test(refCode)) {
        sessionStorage.setItem("szcenario_pending_referral", refCode.trim().toUpperCase());
      }
    } catch {
      // ignore
    }
    const stored = readScenarioDoorStep();
    setStep(
      stored === "hospitality" ||
      stored === "industry" ||
      stored === "strategy" ||
      stored === "resilience" ||
      stored === "education" ||
      stored === "healthcare" ||
      stored === "manufacturing" ||
      stored === "logistics" ||
      stored === "services" ||
      stored === "inner"
        ? stored
        : "type",
    );
    try {
      setCampus(new URLSearchParams(window.location.search).get("ref") === "campus");
    } catch {
      setCampus(false);
    }
  }, []);

  useEffect(() => {
    scrollerRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (next: ScenarioDoorStep) => {
    writeScenarioDoorStep(next);
    setStep(next);
  };

  const openCase = async (segmentId: DemoSegmentId) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusyId(segmentId);
    setError(null);
    try {
      const { enterDemoSegment } = await import("@/lib/demoSession");
      await enterDemoSegment(segmentId, { unlockById, createProfile });
      preferDashboardHome();
      await navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("door.openFail"));
    } finally {
      setBusyId(null);
      inFlight.current = false;
    }
  };

  return (
    <div
      ref={scrollerRef}
      tabIndex={-1}
      data-exact-ignore
      className="door-page h-dvh overflow-x-hidden overflow-y-auto overscroll-contain bg-background outline-none"
    >
      <header className="sticky top-0 z-30 overflow-visible border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-foreground">{t("brand.name")}</div>
            <div className="truncate text-[11px] leading-tight text-muted-foreground" title={t("brand.tagline")}>
              {t("brand.tagline")}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ViewSettingsMenu />
            <Button
              asChild
              className="h-8 bg-[var(--accent)] px-3 font-semibold text-[var(--btn-text)] shadow-md hover:opacity-90"
            >
              <Link to="/login">{t("chrome.login")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 pb-16">
        <div className="space-y-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            szcenario.hu
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-[1.7rem] font-semibold leading-[1.18] tracking-tight text-foreground sm:text-3xl md:text-4xl">
            {t("brand.heroHeadline")}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {t("brand.heroSub")}
          </p>
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-left text-[13px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-emerald)]" />
            <p>
              <span className="font-semibold text-foreground">{t("brand.localFirstLabel")}</span>{" "}
              {t("brand.localFirstBody")}
            </p>
          </div>
        </div>

        {step === "type" ? (
          <div className="space-y-12">
            <section className="space-y-5" aria-labelledby="door-why-heading">
              <h2
                id="door-why-heading"
                className="max-w-3xl text-balance text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
              >
                {t("brand.whyTitle")}
              </h2>
              <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-foreground/90 sm:text-base">
                {t("brand.whyLead")}
              </p>
              <p className="max-w-3xl text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {t("brand.whyBody")}
              </p>
              <div className="max-w-3xl space-y-2 border-l-2 border-cyan-400/40 pl-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-cyan-200/90">
                  {t("brand.dailyOpsTitle")}
                </p>
                <p className="text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                  {t("brand.dailyOpsBody")}
                </p>
              </div>
              <Link
                to="/about"
                className="inline-block text-[12px] text-[var(--accent)] underline-offset-4 hover:underline"
              >
                {t("door.aboutLink")}
              </Link>
            </section>

            <section id="szcenariok" className="space-y-4 scroll-mt-24" aria-labelledby="door-case-heading">
              <div className="space-y-2">
                <h2
                  id="door-case-heading"
                  className="max-w-3xl text-balance text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
                >
                  {t("brand.caseStudyTitle")}
                </h2>
                <p className="max-w-3xl text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                  {t("brand.caseStudyLead")}
                </p>
                <p className="max-w-3xl text-pretty text-[14px] leading-relaxed text-cyan-100/90 sm:text-[15px]">
                  {t("door.kahnBridge")}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId !== null || resetBusy}
                onClick={() => void openCase(KAHN_SEGMENT_ID)}
                className="w-full rounded-2xl border-2 border-cyan-300/80 bg-cyan-500/15 p-5 text-left shadow-[0_0_0_4px_rgba(34,211,238,0.12)] transition-colors hover:border-cyan-200 hover:bg-cyan-500/20"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  {t("door.kahnEyebrow")}
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground sm:text-xl">{t("door.kahnTitle")}</div>
                <p className="mt-2 max-w-3xl text-[13px] leading-snug text-muted-foreground">{t("door.kahnBody")}</p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950">
                  <PlayCircle className="h-4 w-4" />
                  {busyId === KAHN_SEGMENT_ID ? t("door.opening") : t("door.kahnCta")}
                </span>
              </button>
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("brand.proChartHeading")}
                </div>
                <ProChartSketch />
                <ProChartCallout />
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="door-infra-heading">
              <h2
                id="door-infra-heading"
                className="max-w-3xl text-balance text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
              >
                {t("brand.infraTitle")}
              </h2>
              <p className="max-w-3xl text-pretty text-[15px] leading-relaxed text-foreground/90 sm:text-base">
                {t("brand.infraLead")}
              </p>
              <p className="max-w-3xl text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {t("brand.infraBody")}
              </p>
              <dl className="grid gap-3 sm:grid-cols-3">
                <DoorFact term={t("brand.infraPoint1Title")}>{t("brand.infraPoint1Body")}</DoorFact>
                <DoorFact term={t("brand.infraPoint2Title")}>{t("brand.infraPoint2Body")}</DoorFact>
                <DoorFact term={t("brand.infraPoint3Title")}>{t("brand.infraPoint3Body")}</DoorFact>
              </dl>
            </section>

            <section id="tipusok" className="space-y-3 scroll-mt-24">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("door.typesTitle")}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {t("door.typesLead")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { id: "industry", title: t("door.pillarIndustry"), blurb: t("door.pillarIndustryBlurb"), step: "industry" as const },
                    { id: "logistics", title: t("door.pillarLogistics"), blurb: t("door.pillarLogisticsBlurb"), step: "logistics" as const },
                    { id: "inner", title: t("door.pillarInner"), blurb: t("door.pillarInnerBlurb"), step: "inner" as const },
                  ] as const
                ).map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => go(row.step)}
                    className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4 text-left transition-colors hover:border-cyan-300/50"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200">{t("door.available")}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{row.title}</div>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{row.blurb}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {LATER_TYPES.map((id) => (
                  <div
                    key={id}
                    className="rounded-2xl border border-dashed border-white/15 bg-card p-4"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("door.later")}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{t(`door.type.${id}.title` as MessageKey)}</div>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{t(`door.type.${id}.blurb` as MessageKey)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("door.howTitle")}
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DoorFact term={t("door.factLocal")}>
                  {t("door.factLocalBody")}
                </DoorFact>
                <DoorFact term={t("door.factFocus")}>
                  {t("door.factFocusBody")}
                </DoorFact>
                <DoorFact term={t("door.factDemo")}>{t("brand.demoPreviewBody")}</DoorFact>
                <DoorFact term={t("door.factSave")}>
                  {t("door.factSaveBody")}
                </DoorFact>
              </dl>
            </section>

            <HomeProductShots />
            <Suspense fallback={null}>
              <HomePricing campus={campus} />
            </Suspense>
          </div>
        ) : null}

        {step === "industry" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label={t("door.backTypes")} aside={t("door.economicAside")} />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("door.industryLead")}
            </p>
            <div className="grid gap-3">
              {ECONOMIC_INDUSTRIES.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(id)}
                    className="rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {t("door.available")}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{t(`door.industry.${id}.title` as MessageKey)}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t(`door.industry.${id}.blurb` as MessageKey)}</p>
                  </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "hospitality" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("industry")} label={t("door.back")} aside={t("door.moreDemos")} />
            <p className="text-[12px] leading-relaxed text-muted-foreground">{t("brand.demoPreviewBody")}</p>
            <div className="grid gap-2">
              {casesOn("hospitality").map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "education" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label={t("door.back")} aside={campaign?.hero.eyebrow ?? t("door.industry.education.title")} />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {campaign?.id === "oktatas"
                ? campaign.chooserIntro
                : t("door.educationLead")}
            </p>
            <div className="grid gap-2">
              {educationCases.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "resilience" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label={t("door.back")} aside={campaign?.hero.eyebrow ?? t("door.type.disaster.title")} />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {campaign && (campaign.id === "bcp" || campaign.id === "kozosseg" || campaign.id === "makro")
                ? campaign.chooserIntro
                : t("door.resilienceLead")}
            </p>
            <div className="grid gap-2">
              {resilienceCases.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "strategy" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label={t("door.back")} aside={campaign?.hero.eyebrow ?? t("door.industry.strategy.title")} />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {campaign?.id === "strategia"
                ? campaign.chooserIntro
                : t("door.strategyLead")}
            </p>
            <div className="grid gap-2">
              {strategyCases.map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "inner" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label={t("door.back")} aside={t("door.pillarInner")} />
            <p className="text-[12px] leading-relaxed text-muted-foreground">{t("door.pillarInnerBlurb")}</p>
            <div className="grid gap-2">
              {casesOn("inner").map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {step === "healthcare" || step === "manufacturing" || step === "logistics" ? (
          <div className="space-y-4">
            <DoorBack
              onClick={() => go(step === "logistics" ? "type" : "industry")}
              label={t("door.back")}
              aside={t(`door.industry.${step}.title` as MessageKey)}
            />
            <p className="text-[12px] leading-relaxed text-muted-foreground">
              {t(`door.stepLead.${step}` as MessageKey)}
            </p>
            <div className="grid gap-2">
              {casesOn(step).map((s) => (
                <Button
                  key={s.id}
                  type="button"
                  variant="secondary"
                  className="h-auto w-full justify-start gap-3 whitespace-normal px-4 py-3 text-left"
                  disabled={busyId !== null}
                  onClick={() => void openCase(s.id)}
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{face(s).title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {face(s).blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">{t("door.opening")}</span>
                    ) : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="text-center text-xs font-medium text-destructive">{error}</p> : null}

        <div className="border-t border-border/40 pt-6 text-center">
          <Link to="/about" className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {t("chrome.about")}
          </Link>
          <span className="mx-2 text-muted-foreground/50">·</span>
          <button
            type="button"
            className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            disabled={busyId !== null || resetBusy}
            onClick={() => {
              if (inFlight.current) return;
              inFlight.current = true;
              setResetBusy(true);
              setError(null);
              void (async () => {
                try {
                  const { enterRememberedOrFirstDemo } = await import("@/lib/demoSession");
                  await enterRememberedOrFirstDemo({ unlockById, createProfile });
                  const profileId = localdb.getActiveProfile();
                  if (!profileId) throw new Error(t("door.noProfile"));
                  await navigate({
                    to: "/settings",
                    search: { profile: profileId, tab: "danger", focus: SETTINGS_FOCUS_DEMO_RESET },
                  });
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : t("door.settingsFail"));
                } finally {
                  setResetBusy(false);
                  inFlight.current = false;
                }
              })();
            }}
          >
            {resetBusy ? t("chrome.unlocking") : t("door.resetCase")}
          </button>
        </div>
      </div>
      <SiteFooter inline />
    </div>
  );
}

function HomeProductShots() {
  const { t } = useI18n();
  return (
    <section className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("brand.programTitle")}</div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("brand.programBody")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <ProductFrame className="lg:col-span-3" caption={t("brand.shotPlanDo")}>
          <PdcaShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-2" caption={t("brand.shotCashflow")}>
          <CashflowShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-2" caption={t("brand.shotSpaces")}>
          <WorkspaceShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-3" caption={t("brand.shotItems")}>
          <ItemsShot />
        </ProductFrame>
      </div>
    </section>
  );
}

function ProductFrame({
  caption,
  className,
  children,
}: {
  caption: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-border/60 bg-slate-950/80 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)] ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/12" />
        <span className="h-2 w-2 rounded-full bg-white/12" />
        <span className="ml-2 truncate text-[10px] text-muted-foreground">szcenario.hu</span>
      </div>
      <div className="aspect-[16/10] p-3" aria-hidden>
        {children}
      </div>
      <figcaption className="border-t border-white/10 px-3 py-2 text-[12px] text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function ShotLabel({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-slate-950/90 px-1.5 py-0.5 text-[9px] font-medium text-slate-200 shadow-sm">
      {children}
    </span>
  );
}

function PdcaShot() {
  const { t } = useI18n();
  return (
    <div className="grid h-full grid-cols-2 gap-2 rounded-lg bg-[var(--app-bg)] p-2">
      <div className="flex flex-col rounded-md border border-amber-300/30 bg-amber-500/[0.06] p-2">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-amber-200/80">PLAN</div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="space-y-1">
            <ShotLabel>1,2 M</ShotLabel>
            <ShotLabel>0,8 M</ShotLabel>
          </div>
            <div className="flex items-end gap-1">
            <div className="h-12 w-5 rounded-sm bg-emerald-400/70 a11y-pat-diagonal" />
            <div className="h-8 w-5 rounded-sm bg-sky-400/60 a11y-pat-dots" />
          </div>
        </div>
        <div className="mt-auto space-y-1.5 pt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 bg-amber-300/80 a11y-pat-h-stripe" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="h-8 rounded bg-slate-900/70" />
            <div className="h-8 rounded bg-slate-900/50" />
            <div className="h-8 rounded bg-slate-900/70" />
          </div>
        </div>
      </div>
      <div className="flex flex-col rounded-md border border-cyan-300/30 bg-cyan-500/[0.06] p-2">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-cyan-200/80">DO</div>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">{t("brand.shotCashNet")}</span>
            <ShotLabel>−120 e</ShotLabel>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">{t("brand.shotDebt")}</span>
            <ShotLabel>2,4 M</ShotLabel>
          </div>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-1 pt-3">
          <div className="h-10 rounded border border-white/5 bg-slate-900/70" />
          <div className="h-10 rounded border border-white/5 bg-slate-900/50" />
          <div className="col-span-2 h-8 rounded border border-white/5 bg-slate-900/40" />
        </div>
      </div>
    </div>
  );
}

function CashflowShot() {
  const { t } = useI18n();
  const bars = [28, 46, 38, 62, 54, 71];
  return (
    <div className="flex h-full flex-col rounded-lg bg-[var(--app-bg)] p-2">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{t("brand.shotCumulative")}</div>
      <div className="relative mt-2 min-h-0 flex-1">
        <div className="absolute inset-0 flex items-end gap-1.5">
          {bars.map((h, i) => (
            <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="relative w-full" style={{ height: `${h}%` }}>
                <span className="absolute inset-x-0 -top-5 flex justify-center">
                  <ShotLabel>{h}%</ShotLabel>
                </span>
                <div className={`h-full w-full rounded-sm bg-cyan-400/70 ${["a11y-pat-diagonal", "a11y-pat-checker", "a11y-pat-dots", "a11y-pat-h-stripe", "a11y-pat-v-stripe", "a11y-pat-diagonal"][i]}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkspaceShot() {
  const { t } = useI18n();
  const tabs = [t("chrome.personal"), t("chrome.business"), t("chrome.project")];
  return (
    <div className="flex h-full flex-col rounded-lg bg-[var(--app-bg)] p-2">
      <div className="flex gap-1">
        {tabs.map((x, i) => (
          <div
            key={x}
            className={`rounded-md px-2 py-1 text-[10px] ${i === 1 ? "bg-white/10 text-slate-100" : "text-slate-500"}`}
          >
            {x}
          </div>
        ))}
      </div>
      <div className="mt-2 grid flex-1 grid-cols-2 gap-2">
        <div className="rounded-md border border-white/5 bg-slate-900/60" />
        <div className="rounded-md border border-white/5 bg-slate-900/40" />
      </div>
      <div className="mt-2 flex justify-around rounded-md border border-white/5 bg-slate-900/50 py-1 text-[9px] text-slate-400">
        <span>{t("dash.cashflow")}</span>
        <span className="text-cyan-200">{t("dash.items")}</span>
        <span>{t("dash.deals")}</span>
        <span>{t("dash.inventory")}</span>
      </div>
    </div>
  );
}

function ItemsShot() {
  const { t } = useI18n();
  const rows = [
    { n: t("brand.shotInput"), v: "420 e", w: "70%" },
    { n: t("brand.shotWage"), v: "310 e", w: "52%" },
    { n: t("brand.shotUtility"), v: "180 e", w: "34%" },
  ];
  return (
    <div className="flex h-full flex-col gap-2 rounded-lg bg-[var(--app-bg)] p-2">
      {rows.map((r, i) => (
        <div key={r.n} className="flex items-center gap-2">
          <div className="w-16 shrink-0 text-[10px] text-slate-400">{r.n}</div>
          <div className="relative h-5 flex-1 rounded-sm bg-slate-800">
            <div
              className={`h-full rounded-sm bg-emerald-400/55 ${["a11y-pat-diagonal", "a11y-pat-checker", "a11y-pat-dots"][i]}`}
              style={{ width: r.w }}
            />
          </div>
          <ShotLabel>{r.v}</ShotLabel>
        </div>
      ))}
    </div>
  );
}

function DoorFact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/12 bg-card px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wider text-foreground">{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</dd>
    </div>
  );
}

function DoorBack({
  onClick,
  label,
  aside,
}: {
  onClick: () => void;
  label: string;
  aside: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {label}
      </button>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{aside}</p>
    </div>
  );
}
