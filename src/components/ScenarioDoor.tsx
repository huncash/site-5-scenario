import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import {
  CloudOff,
  Cpu,
  GitBranch,
  HardDrive,
  KeyRound,
  Laptop,
  Lock,
  PlayCircle,
  SearchX,
  ShieldCheck,
  TrendingUp,
  Upload,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { HierarchicalCaseChooser } from "@/components/cases/HierarchicalCaseChooser";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/SiteFooter";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { CAMPAIGN_FUNNELS } from "@/content/funnels/campaigns";
import { type CampaignId } from "@/lib/campaignFunnels";
import { captureCampaignFromLocation, readCampaignId } from "@/lib/campaignSession";
import { type DemoSegmentId } from "@/lib/demoCatalog";
import { KAHN_SEGMENT_ID } from "@/lib/coreCases";
import { writeScenarioDoorStep } from "@/lib/doorStep";
import { AddonModuleDialog } from "@/components/cases/AddonModuleDialog";
import {
  isStartableScenarioKind,
  LATER_KIND_BLURB_KEY,
  LATER_KIND_TITLE_KEY,
  LATER_SCENARIO_KINDS,
  SCENARIO_KIND_CARD_TITLE_KEY,
  scenarioKindOf,
} from "@/lib/scenarioCatalog";
import { ProChartCallout, ProChartSketch } from "@/components/home/ProChartExplain";
import { KahnEvolvePanel } from "@/components/strategy/KahnEvolvePanel";
import { useI18n } from "@/i18n";
import { useVault } from "@/lib/vault";
import { isSchoolHost, isSchoolVerified, markSchoolSession } from "@/lib/school";
import { applySchoolCampusLicense } from "@/lib/schoolLicense";
const HomePricing = lazy(() => import("@/components/home/HomePricing").then((m) => ({ default: m.HomePricing })));

export function ScenarioDoor() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { unlockById, createProfile } = useVault();
  const [busyId, setBusyId] = useState<DemoSegmentId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campus, setCampus] = useState(false);
  const [campaignId, setCampaignId] = useState<CampaignId | null>(null);
  const [addonTitle, setAddonTitle] = useState<string | null>(null);
  const inFlight = useRef(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const campaign = campaignId ? CAMPAIGN_FUNNELS[campaignId] : null;
  const school = typeof window !== "undefined" && isSchoolHost();

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
    captureCampaignFromLocation({ doorStep: false });
    // Köztes esetválasztó lépés kivezetve — mindig a hierarchikus főnézet.
    writeScenarioDoorStep("type");
    setCampaignId(readCampaignId());
    try {
      const refCode = new URLSearchParams(window.location.search).get("referral");
      if (refCode && /^REF-/i.test(refCode)) {
        sessionStorage.setItem("szcenario_pending_referral", refCode.trim().toUpperCase());
      }
    } catch {
      // ignore
    }
    try {
      setCampus(new URLSearchParams(window.location.search).get("ref") === "campus");
    } catch {
      setCampus(false);
    }
    if (window.location.hash === "#tipusok") {
      window.requestAnimationFrame(() => {
        document.getElementById("tipusok")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  useEffect(() => {
    scrollerRef.current?.focus({ preventScroll: true });
  }, []);

  const openCase = async (segmentId: DemoSegmentId) => {
    if (!isStartableScenarioKind(scenarioKindOf(segmentId))) {
      setAddonTitle(t(SCENARIO_KIND_CARD_TITLE_KEY[scenarioKindOf(segmentId)]));
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setBusyId(segmentId);
    setError(null);
    try {
      if (isSchoolHost()) {
        markSchoolSession();
        if (isSchoolVerified()) applySchoolCampusLicense();
      }
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
            <div
              className="block truncate text-[10px] font-normal tracking-wide text-slate-300"
              title={t("brand.heroPositioning")}
            >
              {t("brand.heroPositioning")}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ViewSettingsMenu />
            <Button asChild className="btn-cta h-8 px-3">
              <Link to="/login">{t("chrome.login")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 pb-16">
        {/* Hero: márka → funkcionális pozicionálás (above-the-fold) → mikro. Szlogen lentebb. */}
        <div className="mx-auto w-full max-w-3xl space-y-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {school ? t("school.kicker") : "szcenario.hu"}
          </p>
          <h1 className="text-balance text-[2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("brand.name")}
          </h1>
          <p
            className="inline-flex max-w-full text-pretty rounded-md border border-[#2D6A4F]/45 bg-[#1B4332]/55 px-3 py-2 text-[13px] font-medium leading-snug text-[#F1F5F9] sm:text-[15px]"
            role="doc-subtitle"
          >
            {t("brand.heroPositioning")}
          </p>
          <p className="text-pretty text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
            {t("brand.heroMicro")}
          </p>
          <p className="text-pretty text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
            {t("brand.heroSub")}
          </p>
          {school ? (
            <p className="text-pretty rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-[13px] leading-relaxed text-foreground">
              {t("school.capacity")} · {t("school.watermark")}
            </p>
          ) : null}
        </div>

        <div className="space-y-12">
            <section className="mx-auto w-full max-w-3xl space-y-5 text-left" aria-labelledby="door-why-heading">
              <h2
                id="door-why-heading"
                className="text-balance text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl"
              >
                {t("brand.whyTitle")}
              </h2>
              <p className="text-pretty text-[15px] leading-relaxed text-foreground/90 sm:text-base">
                {t("brand.whyLead")}
              </p>
              <p className="text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {t("brand.whyBody")}
              </p>
              <div className="space-y-2 border-l-2 border-slate-700 pl-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {t("brand.dailyOpsTitle")}
                </p>
                <p className="text-pretty text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                  {t("brand.dailyOpsBody")}
                </p>
              </div>
              {school ? null : (
              <div className="pt-2">
                <Button
                  type="button"
                  className="btn-cta h-11 px-5 text-[14px] font-semibold"
                  onClick={() => {
                    const root = scrollerRef.current;
                    const el = document.getElementById("pricing") ?? document.getElementById("csomagok");
                    if (!root || !el) return;
                    const top =
                      el.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 12;
                    root.scrollTo({ top, behavior: "smooth" });
                  }}
                >
                  {t("pricing.viewPlansCta")}
                </Button>
              </div>
              )}
            </section>

            <section id="szcenariok" className="space-y-4 scroll-mt-24" aria-labelledby="door-case-heading">
              <div className="max-w-3xl space-y-1 border-t border-slate-800 pt-8">
                <p className="text-lg font-semibold tracking-tight text-slate-100 sm:text-xl">
                  {t("brand.tagline")}
                </p>
                <p className="text-[13px] leading-relaxed text-slate-400 sm:text-[14px]">
                  {t("rope.tipBody")}
                </p>
              </div>
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
                <p className="max-w-3xl text-pretty text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
                  {t("door.kahnBridge")}
                </p>
              </div>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => void openCase(KAHN_SEGMENT_ID)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition-colors hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {t("door.kahnEyebrow")}
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground sm:text-xl">{t("door.kahnTitle")}</div>
                <p className="mt-2 max-w-3xl text-[13px] leading-snug text-muted-foreground">{t("door.kahnBody")}</p>
                <span className="btn-cta mt-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm">
                  <PlayCircle className="h-4 w-4" />
                  {busyId === KAHN_SEGMENT_ID ? t("door.opening") : t("door.kahnCta")}
                </span>
              </button>
              <div className="space-y-3">
                <div className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  {t("brand.proChartHeading")}
                </div>
                <ProChartCallout />
                <ProChartSketch />
              </div>
              <KahnEvolvePanel />
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
                <DoorFact term={t("brand.infraPoint1Title")} icon={CloudOff}>
                  {t("brand.infraPoint1Body")}
                </DoorFact>
                <DoorFact term={t("brand.infraPoint2Title")} icon={SearchX}>
                  {t("brand.infraPoint2Body")}
                </DoorFact>
                <DoorFact term={t("brand.infraPoint3Title")} icon={HardDrive}>
                  {t("brand.infraPoint3Body")}
                </DoorFact>
              </dl>
            </section>

            <section id="tipusok" className="space-y-4 scroll-mt-24">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("door.typesTitle")}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {t("door.typesLead")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <TypesTrustBadge icon={ShieldCheck} label={t("door.typesBadgeLocal")} />
                <TypesTrustBadge icon={KeyRound} label={t("door.typesBadgeCrypto")} />
                <TypesTrustBadge icon={Zap} label={t("door.typesBadgeCash")} />
              </div>
              {campaign?.chooserIntro ? (
                <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{campaign.chooserIntro}</p>
              ) : null}
              <HierarchicalCaseChooser
                variant="door"
                busyId={busyId}
                defaultOpenKinds={["economic"]}
                allowedKinds={school ? ["economic"] : undefined}
                onSelect={(id) => void openCase(id)}
              />
              {school ? null : (
                <>
              <div className="grid gap-3 sm:grid-cols-2">
                {LATER_SCENARIO_KINDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="rounded-2xl border border-dashed border-white/15 bg-card/80 p-4 text-left"
                    onClick={() => setAddonTitle(t(LATER_KIND_TITLE_KEY[id]))}
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("door.addonBadge")}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-foreground">{t(LATER_KIND_TITLE_KEY[id])}</div>
                    <p className="mt-1.5 text-[13px] leading-snug text-slate-300/80">{t(LATER_KIND_BLURB_KEY[id])}</p>
                  </button>
                ))}
              </div>
              <AddonModuleDialog
                open={addonTitle !== null}
                title={addonTitle ?? ""}
                onOpenChange={(next) => {
                  if (!next) setAddonTitle(null);
                }}
              />
                </>
              )}
            </section>

            <section id="how-it-works" className="scroll-mt-24 space-y-5" aria-labelledby="door-how-heading">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("door.howTitle")}
                </p>
                <h2
                  id="door-how-heading"
                  className="mx-auto mt-2 max-w-2xl text-pretty text-[15px] font-semibold leading-relaxed text-foreground/90 sm:text-base"
                >
                  {t("door.howLead")}
                </h2>
              </div>
              <ol className="grid list-none gap-3 grid-cols-1 md:grid-cols-3 p-0">
                <HowValueCard
                  step="1"
                  icon={Upload}
                  title={t("door.howStep1Title")}
                  body={t("door.howStep1Body")}
                />
                <HowValueCard
                  step="2"
                  icon={GitBranch}
                  title={t("door.howStep2Title")}
                  body={t("door.howStep2Body")}
                />
                <HowValueCard
                  step="3"
                  icon={TrendingUp}
                  title={t("door.howStep3Title")}
                  body={t("door.howStep3Body")}
                />
              </ol>
            </section>

            <section id="under-the-hood" className="scroll-mt-24 space-y-5" aria-labelledby="door-hood-heading">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("door.hoodTitle")}
                </p>
                <h2
                  id="door-hood-heading"
                  className="mx-auto mt-2 max-w-2xl text-pretty text-[15px] font-semibold leading-relaxed text-foreground/90 sm:text-base"
                >
                  {t("door.hoodLead")}
                </h2>
              </div>
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                <HowValueCard icon={ShieldCheck} title={t("door.howLocalTitle")} body={t("door.howLocalBody")} />
                <HowValueCard icon={Zap} title={t("door.howLeanTitle")} body={t("door.howLeanBody")} />
                <HowValueCard icon={KeyRound} title={t("door.howSovTitle")} body={t("door.howSovBody")} />
              </div>
              <HowArchitecture
                device={t("door.howArchDevice")}
                engine={t("door.howArchEngine")}
                flow={t("door.howArchFlow")}
                blocked={t("door.howArchBlocked")}
              />
            </section>

            {school ? null : (
              <>
            <HomeProductShots />
            <Suspense fallback={null}>
              <HomePricing campus={campus} />
            </Suspense>
              </>
            )}
          </div>

        {error ? <p className="text-center text-xs font-medium text-destructive">{error}</p> : null}
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
            <div className="h-12 w-5 rounded-sm bg-emerald-700/55 a11y-pat-diagonal" />
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
              className={`h-full rounded-sm bg-emerald-700/45 ${["a11y-pat-diagonal", "a11y-pat-checker", "a11y-pat-dots"][i]}`}
              style={{ width: r.w }}
            />
          </div>
          <ShotLabel>{r.v}</ShotLabel>
        </div>
      ))}
    </div>
  );
}

function DoorFact({
  term,
  children,
  icon: Icon,
}: {
  term: string;
  children: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3">
      {Icon ? (
        <div className="mb-2.5 flex justify-center">
          <Icon className="h-7 w-7 stroke-[1.5] text-emerald-600" aria-hidden />
        </div>
      ) : null}
      <dt className="text-xs font-semibold uppercase tracking-wider text-foreground">{term}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</dd>
    </div>
  );
}

function TypesTrustBadge({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-4 py-2 text-sm text-slate-300">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-800" aria-hidden />
      <Icon className="h-4 w-4 stroke-[1.5] text-slate-400" aria-hidden />
      {label}
    </span>
  );
}

function HowValueCard({
  icon: Icon,
  title,
  body,
  step,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  step?: string;
}) {
  const Tag = step ? "li" : "article";
  return (
    <Tag className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-4 text-left">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex w-fit items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50 p-3">
          <Icon className="h-6 w-6 stroke-[1.5] text-emerald-600" aria-hidden />
        </div>
        {step ? (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {step}
          </span>
        ) : null}
      </div>
      <h3 className="text-sm font-semibold leading-snug text-foreground">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </Tag>
  );
}

function HowArchitecture({
  device,
  engine,
  flow,
  blocked,
}: {
  device: string;
  engine: string;
  flow: string;
  blocked: string;
}) {
  return (
    <div className="my-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-6 sm:px-6">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center sm:gap-3">
        <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-center">
          <Laptop className="h-7 w-7 stroke-[1.5] text-emerald-600" aria-hidden />
          <span className="text-[12px] font-semibold leading-snug text-foreground">{device}</span>
        </div>
        <div className="flex flex-col items-center gap-1 px-1 sm:min-w-[7rem]">
          <div className="hidden h-px w-full bg-slate-700 sm:block" aria-hidden />
          <div className="h-8 w-px bg-slate-700 sm:hidden" aria-hidden />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{flow}</span>
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-center">
          <Cpu className="h-7 w-7 stroke-[1.5] text-emerald-600" aria-hidden />
          <span className="text-[12px] font-semibold leading-snug text-foreground">{engine}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-center">
        <Lock className="h-4 w-4 shrink-0 stroke-[1.5] text-slate-400" aria-hidden />
        <p className="text-[12px] font-medium leading-snug text-slate-300">{blocked}</p>
      </div>
    </div>
  );
}

