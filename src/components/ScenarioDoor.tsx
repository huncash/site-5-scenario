import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, PlayCircle, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEMO_SEGMENTS, type DemoSegmentId } from "@/lib/demoSeed";
import {
  enterDemoSegment,
  enterRememberedOrFirstDemo,
  readScenarioDoorStep,
  writeScenarioDoorStep,
  type ScenarioDoorStep,
} from "@/lib/demoSession";
import { SETTINGS_FOCUS_DEMO_RESET } from "@/lib/versionPolicy";
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
  const inFlight = useRef(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const preferDashboardHome = () => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem("szcenario_home_mode", "dashboard");
    } catch {
      // ignore
    }
  };

  const branches = useMemo(
    () => [
      {
        title: "Projektalapú & interim kontrolling",
        body: "Zseb‑kontrolling + valóság‑sokk: terv → tény → eltérés, döntési fókusz.",
        href: "/f/projekt-kontrolling/",
      },
      {
        title: "Adósság‑helyreállítás",
        body: "Runway + teher: Avalanche/Snowball fókusz és következő 30–60 nap tisztázása.",
        href: "/f/adossag-helyreallitas/",
      },
      {
        title: "Lean Minőség & Költség",
        body: "Fedezeti pont, sávok, veszteséghőtérkép — mikro‑szivárgások gyors jelzése.",
        href: "/f/minoseg-koltseg/",
      },
      {
        title: "Multi‑Site / Hálózati vállalkozások",
        body: "Egységek konszolidációja, drift jelzés, Lean/MUDA fókusz — egy kézben.",
        href: "/f/multi-site/",
      },
    ],
    [],
  );

  useEffect(() => {
    setStep(readScenarioDoorStep());
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

  const quickTry = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusyId("demo7_personal_pocket_seasonal_pilot");
    setError(null);
    try {
      await enterDemoSegment("demo7_personal_pocket_seasonal_pilot", { unlockById, createProfile });
      preferDashboardHome();
      await navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Nem sikerült elindítani az ingyenes kipróbálást.");
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
      className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-background outline-none"
    >
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="space-y-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            szcenario.hu
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Szcenárió</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Zseb‑kontrolling és valóság‑sokk: veszteségjelzések, döntési fókusz és “mi lenne, ha” tesztek — helyben futva.
          </p>
          {/* Above-the-fold CTA (no scroll): primary action always visible */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              className="h-10 bg-cyan-500/90 px-4 text-slate-950 hover:bg-cyan-400"
              disabled={busyId !== null || resetBusy}
              onClick={() => void quickTry()}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Segédeszköz ingyenes kipróbálása
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 border-border/60 bg-card/30 px-4"
              disabled={busyId !== null || resetBusy}
              onClick={() => go("hospitality")}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              További demó helyzetek
            </Button>
          </div>
        </div>

        {step === "type" ? (
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Summary card (single, concrete) */}
            <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary">Lényeg</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    Zseb‑kontrolling: döntési jelzés, nem riport.
                  </div>
                </div>
                <div className="shrink-0 rounded-xl border border-border/60 bg-card/30 px-3 py-2 text-[11px] text-muted-foreground">
                  Lean + poka‑yoke
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                A cél: gyorsan lásd a <span className="text-foreground/90">valóság‑sokk</span> pontokat (drift, teher, fedezet‑csúszás),
                és azonnal kipróbáld a beavatkozást “mi lenne, ha” módban — <span className="text-foreground/90">hálózat nélkül is</span>.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Valóság‑sokk</div>
                  <div className="mt-1 text-sm font-medium text-foreground">Runway / teher / eltérés</div>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/30 px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Poka‑yoke</div>
                  <div className="mt-1 text-sm font-medium text-foreground">hibabiztos adatútvonal</div>
                </div>
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                Kattintáskor preloadolt, biztonságos demó állapot indul. Nem kér banki importot.
              </div>
            </div>

            {/* Data security / transparency (visible immediately) */}
            <div className="rounded-2xl border border-border/70 bg-card/40 p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                <div className="text-sm font-semibold text-foreground">Adatbiztonság & transzparencia</div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Poka‑yoke elv: legyen egyértelmű, mi történik az adataiddal — és mi nem.
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                  <span>
                    <span className="text-foreground/90 font-medium">Nincs szerver‑oldali adatbázis</span> (a működés helyben fut).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                  <span>
                    <span className="text-foreground/90 font-medium">Nincs regisztráció, nincs telemetria</span>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/70" />
                  <span>
                    Mentés / átvitel: <span className="text-foreground/90 font-medium">export/import</span> vagy közeli eszköz↔eszköz (QR/P2P), ahol elérhető.
                  </span>
                </li>
              </ul>
              <div className="mt-4 rounded-xl border border-border/60 bg-card/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-slate-300" />
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Transzparens lépések
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  1) demó indul → 2) dashboardra visz → 3) módosítasz → 4) azonnali grafikon visszajelzés.
                </div>
              </div>
            </div>

            {/* Branches (immediate choices) */}
            <div className="lg:col-span-2">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Elágazás — válassz célpontot
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {branches.map((b) => (
                  <Button
                    key={b.href}
                    asChild
                    variant="secondary"
                    className="h-auto justify-start whitespace-normal rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-left hover:bg-card/60"
                  >
                    <a href={b.href}>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground">{b.title}</div>
                        <div className="mt-0.5 text-[11px] font-normal text-muted-foreground">{b.body}</div>
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            </div>
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
                    className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-5 text-left opacity-70"
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
          <button
            type="button"
            className="text-[11px] text-muted-foreground/80 underline-offset-4 hover:text-muted-foreground hover:underline"
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

function DoorFact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 px-4 py-3">
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
