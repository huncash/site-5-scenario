import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { DEMO_SEGMENTS, type DemoSegmentId } from "@/lib/demoSeed";
import {
  enterDemoSegment,
  enterRememberedOrFirstDemo,
  readScenarioDoorStep,
  writeScenarioDoorStep,
  type ScenarioDoorStep,
} from "@/lib/demoSession";
import { SETTINGS_FOCUS_DEMO_RESET } from "@/lib/versionPolicy";
import { HomePricing } from "@/components/home/HomePricing";
import { ProChartCallout, ProChartSketch } from "@/components/home/ProChartExplain";
import {
  DAILY_OPS_BODY,
  DAILY_OPS_TITLE,
  HERO_DEMO_PREVIEW_BODY,
  HERO_DEMO_PREVIEW_TITLE,
  HERO_HEADLINE,
  HERO_LOCAL_FIRST_BODY,
  HERO_LOCAL_FIRST_LABEL,
  HERO_SUBHEADLINE,
  WHY_BODY,
  WHY_LEAD,
  WHY_TITLE,
} from "@/content/branding";
import { DEMO_STARTER_BLURB } from "@/content/pricing/tiers";
import { useVault } from "@/lib/vault";
import { localdb } from "@/lib/localdb";

const SCENARIO_TYPES: Array<{
  id: string;
  open?: boolean;
  title: string;
  blurb: string;
}> = [
  {
    id: "economic",
    open: true,
    title: "Gazdasági szcenárió",
    blurb:
      "A működés pénzben mért feltételeit és kötöttségeit vizsgálja: mi történik, ha ezek megváltoznak.",
  },
  {
    id: "climate",
    title: "Klímaváltozási szcenárió",
    blurb:
      "Különböző kibocsátási szintek mellett modellezhető, milyen időjárás és milyen hatás következhet.",
  },
  {
    id: "political",
    title: "Politikai szcenárió",
    blurb:
      "Döntések hatásait szimulálják, hogy lássák, mivé válhatnak, ha megvalósulnak.",
  },
  {
    id: "disaster",
    title: "Katasztrófaelhárítási szcenárió",
    blurb:
      "Város földrengésre vagy árvízre rak össze szcenáriót, hogy legyen mire készülni.",
  },
  {
    id: "crisis",
    title: "Válságkezelési szcenárió",
    blurb:
      "Belső válság — például kereslet-visszaesés — hogyan hatna az ügyfelekre és a működésre.",
  },
];

const ECONOMIC_INDUSTRIES: Array<{
  id: string;
  open?: boolean;
  title: string;
  blurb: string;
}> = [
  {
    id: "hospitality",
    open: true,
    title: "Élelmiszeripar / vendéglátás",
    blurb:
      "Lánc, étterem, kávézó, cukrászda, rendezvényes vendéglátás — beléphetsz egy-egy már futó helyzetbe, és továbbviszed.",
  },
  {
    id: "manufacturing",
    title: "Feldolgozóipar",
    blurb: "Később. Ugyanaz a gazdasági kérdés, más költség- és kapacitáskép.",
  },
  {
    id: "trade",
    title: "Kereskedelem",
    blurb: "Később. Készlet, árrés, csatorna — más szerkezet, ugyanaz a módszer.",
  },
  {
    id: "services",
    title: "Szolgáltatás",
    blurb: "Később. Kapacitás és megbízás hullámzása, nem áru.",
  },
];

export function ScenarioDoor() {
  const navigate = useNavigate();
  const { unlockById, createProfile } = useVault();
  const [step, setStep] = useState<ScenarioDoorStep>("type");
  const [busyId, setBusyId] = useState<DemoSegmentId | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campus, setCampus] = useState(false);
  const inFlight = useRef(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  const branches = useMemo(
    () => [
      {
        title: "Projektalapú & interim kontrolling",
        body: "Terv → Tény → Eltérés. Gyors zseb-kontrolling és korai figyelmeztetés projektekhez.",
        segmentId: "demo7_personal_pocket_seasonal_pilot" as const,
        infoHref: "/f/projekt-kontrolling/",
      },
      {
        title: "Adósság-helyreállítás",
        body: "Runway és likviditási teher. Avalanche / Snowball fókusz a következő 30–60 nap pénzügyi tisztázására.",
        segmentId: "demo7_personal_pocket_seasonal_pilot" as const,
        infoHref: "/f/adossag-helyreallitas/",
      },
      {
        title: "Lean Minőség & Költség",
        body: "Fedezeti pont, költségsávok és veszteség-hőtérkép. Mikro-szivárgások azonnali szűrése.",
        segmentId: "demo4_fine_dining_bistro" as const,
        infoHref: "/f/minoseg-koltseg/",
      },
      {
        title: "Multi-Site / Hálózati vállalkozások",
        body: "Telephelyek konszolidációja, drift jelzés és egységes Lean/MUDA fókusz több egységre.",
        segmentId: "demo1_multisite_operator" as const,
        infoHref: "/f/multi-site/",
      },
    ],
    [],
  );

  useEffect(() => {
    const stored = readScenarioDoorStep();
    setStep(stored === "hospitality" || stored === "industry" ? stored : "type");
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
      await enterDemoSegment(segmentId, { unlockById, createProfile });
      preferDashboardHome();
      await navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Nem sikerült megnyitni az esetet.");
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
            <div className="truncate text-sm font-semibold text-foreground">Szcenárió</div>
            <div className="truncate text-[11px] leading-tight text-muted-foreground" title="Jövőképek és döntési pályák • 100% lokális biztonság">
              Jövőképek és döntési pályák • 100% lokális biztonság
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ViewSettingsMenu />
            <Button
              asChild
              className="h-8 bg-[var(--accent)] px-3 font-semibold text-[var(--btn-text)] shadow-md hover:opacity-90"
            >
              <Link to="/login">Belépés</Link>
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
            {HERO_HEADLINE}
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {HERO_SUBHEADLINE}
          </p>
          <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3 text-left text-[13px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-emerald)]" />
            <p>
              <span className="font-semibold text-foreground">{HERO_LOCAL_FIRST_LABEL}</span>{" "}
              {HERO_LOCAL_FIRST_BODY}
            </p>
          </div>
        </div>

        {step === "type" ? (
          <div className="space-y-12">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">
                {HERO_DEMO_PREVIEW_TITLE}
              </h2>
              <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
                {HERO_DEMO_PREVIEW_BODY}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {branches.map((b) => (
                  <div key={b.infoHref} className="rounded-2xl border border-white/12 bg-card p-4">
                    <div className="text-sm font-semibold text-foreground">{b.title}</div>
                    <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{b.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="btn-demo h-9 bg-cyan-500 px-3 text-slate-950 hover:bg-cyan-400"
                        disabled={busyId !== null || resetBusy}
                        onClick={() => void openCase(b.segmentId)}
                      >
                        Demó indítása
                      </Button>
                      <Button asChild variant="outline" className="h-9 border-white/35 bg-transparent px-3 text-foreground">
                        <a href={b.infoHref}>Részletek & árak</a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  disabled={busyId !== null || resetBusy}
                  onClick={() => go("hospitality")}
                >
                  További vendéglátós mintahelyzetek
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                PRO-grafikon
              </div>
              <ProChartSketch />
              <ProChartCallout />
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {DAILY_OPS_TITLE}
              </div>
              <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{DAILY_OPS_BODY}</p>
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {WHY_TITLE}
              </div>
              <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{WHY_LEAD}</p>
              <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{WHY_BODY}</p>
              <Link
                to="/about"
                className="inline-block text-[12px] text-[var(--accent)] underline-offset-4 hover:underline"
              >
                Rólunk — a teljes háttérnarratíva
              </Link>
            </section>

            <section className="space-y-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Szcenárió fajták
                </div>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Most a gazdasági ág nyitott. A többi ugyanerre a módszerre jön később — más kérdés, ugyanaz a helyi számítás.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {SCENARIO_TYPES.map((t) =>
                  t.open ? (
                    <div key={t.id} className="rounded-2xl border border-cyan-400/30 bg-cyan-500/5 p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200">Most</div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{t.title}</div>
                      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{t.blurb}</p>
                    </div>
                  ) : (
                    <div
                      key={t.id}
                      className="rounded-2xl border border-dashed border-white/15 bg-card p-4"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Később
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">{t.title}</div>
                      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{t.blurb}</p>
                    </div>
                  ),
                )}
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hogyan működik
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <DoorFact term="Helyben számol">
                  Terv, tény, eltérés a böngészőben készül. Nincs felhő‑adatbázis, nincs telemetria.
                </DoorFact>
                <DoorFact term="Egy ágazat, több fókusz">
                  Vendéglátás és gazdasági helyzetek: projekt, adósság, lean, több telephely. A többi ágazat később.
                </DoorFact>
                <DoorFact term="Demó = minta, nem ügyfél">{DEMO_STARTER_BLURB}</DoorFact>
                <DoorFact term="Mentés nálad">
                  Export/import, vagy közeli eszköz↔eszköz QR‑rel. A belépés mesterjelszóval az eszközön történik.
                </DoorFact>
              </dl>
            </section>

            <HomeProductShots />
            <HomePricing campus={campus} />
          </div>
        ) : null}

        {step === "industry" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label="Szcenárió fajtái" aside="Gazdasági szcenárió" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Először az iparágat választod. Az élelmiszeriparban és a vendéglátásban
              már be lehet lépni egy működő helyzetbe; a többi ugyanerre a
              módszerre jön, más ritmussal.
            </p>
            <div className="grid gap-3">
              {ECONOMIC_INDUSTRIES.map((ind) =>
                ind.open ? (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => go("hospitality")}
                    className="rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Elérhető
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{ind.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{ind.blurb}</p>
                  </button>
                ) : (
                    <div
                      key={ind.id}
                      className="rounded-2xl border border-dashed border-white/15 bg-card p-5 text-left"
                    >
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Később
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{ind.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{ind.blurb}</p>
                  </div>
                ),
              )}
            </div>
          </div>
        ) : null}

        {step === "hospitality" ? (
          <div className="space-y-4">
            <DoorBack onClick={() => go("type")} label="Vissza" aside="További demó helyzetek" />
            <p className="text-[12px] leading-relaxed text-muted-foreground">{DEMO_STARTER_BLURB}</p>
            <div className="grid gap-2">
              {DEMO_SEGMENTS.map((s) => (
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
                    <span className="block text-sm font-medium">{s.title}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      {s.blurb}
                    </span>
                    {busyId === s.id ? (
                      <span className="mt-1 block text-[11px] text-primary">Helyzet megnyitása…</span>
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
            Rólunk
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
                  await enterRememberedOrFirstDemo({ unlockById, createProfile });
                  const profileId = localdb.getActiveProfile();
                  if (!profileId) throw new Error("Nincs aktív profil.");
                  await navigate({
                    to: "/settings",
                    search: { profile: profileId, tab: "danger", focus: SETTINGS_FOCUS_DEMO_RESET },
                  });
                } catch (err: unknown) {
                  setError(err instanceof Error ? err.message : "Nem sikerült megnyitni a beállításokat.");
                } finally {
                  setResetBusy(false);
                  inFlight.current = false;
                }
              })();
            }}
          >
            {resetBusy ? "Beállítások megnyitása…" : "Eset újraindítása az eszközön"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HomeProductShots() {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">A program</div>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          PDCA‑mosaik: fent a helyzet, középen a munka, alul a modulok. A számok a saját eszközödön készülnek.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <ProductFrame className="lg:col-span-3" caption="PLAN + DO — terv és élő működés egymás mellett">
          <PdcaShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-2" caption="Cashflow és eltérés, nem Excel‑vadászat">
          <CashflowShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-2" caption="Magán, vállalkozás, projekt — külön terek">
          <WorkspaceShot />
        </ProductFrame>
        <ProductFrame className="lg:col-span-3" caption="Tételek és sávok: a szám olvasható a oszlopon kívül">
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
            <span className="text-[10px] text-slate-400">Cash nettő</span>
            <ShotLabel>−120 e</ShotLabel>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Tartozás</span>
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
  const bars = [28, 46, 38, 62, 54, 71];
  return (
    <div className="flex h-full flex-col rounded-lg bg-[var(--app-bg)] p-2">
      <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Halmozott eredmény</div>
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
  return (
    <div className="flex h-full flex-col rounded-lg bg-[var(--app-bg)] p-2">
      <div className="flex gap-1">
        {["Magán", "Vállalkozás", "Projekt"].map((x, i) => (
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
        <span>Cashflow</span>
        <span className="text-cyan-200">Tételek</span>
        <span>Üzletek</span>
        <span>Leltár</span>
      </div>
    </div>
  );
}

function ItemsShot() {
  const rows = [
    { n: "Alapanyag", v: "420 e", w: "70%" },
    { n: "Bér", v: "310 e", w: "52%" },
    { n: "Rezsi", v: "180 e", w: "34%" },
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
