import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";

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
      "Belső válság — például adatlopás — hogyan hatna az ügyfelekre és a működésre.",
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
      className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain bg-background outline-none"
    >
      <div className="mx-auto w-full max-w-2xl space-y-8 px-4 py-12">
        <div className="space-y-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            szcenario.hu
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Szcenárió</h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
            A szcenárió időben fut: honnan jött a helyzet, hol tart, merre
            mehet. Nem terv és nem jóslat. Végigjátszod — feltételek,
            kötöttségek, mozgástér egy összképen —, mielőtt lépnél.
          </p>
        </div>

        {step === "type" ? (
          <div className="space-y-6">
            <dl className="mx-auto grid max-w-xl gap-3 text-left text-sm">
              <DoorFact term="Cél">
                Egy helyzetet a múltjával, a jelenével és a lehetséges
                folytatásával együtt, egy összképen vizsgálni, mielőtt döntesz.
              </DoorFact>
              <DoorFact term="Feladat">
                Belépsz egy meglévő helyzetbe. Végigköveted a feltételeket és a
                kötöttségeket, és megnézed, merre mozdul a működés, ha
                változtatod őket.
              </DoorFact>
              <DoorFact term="Módszer">
                Szcenárió-módszertan. A helyzet eseménysor, nem lezárt terv. Nem
                azt mondja meg, mi lesz, hanem azt, mit bír el a működés, ha a
                feltételek változnak.
              </DoorFact>
            </dl>

            <div className="grid gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Szcenárió fajtái
              </p>
              {SCENARIO_TYPES.map((t) =>
                t.open ? (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => go("industry")}
                    className="rounded-2xl border border-border/70 bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-card/80"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Elérhető
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{t.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
                  </button>
                ) : (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-dashed border-border/50 bg-muted/10 p-5 text-left opacity-70"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Később
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">{t.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>
                  </div>
                ),
              )}
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
            <DoorBack
              onClick={() => go("industry")}
              label="Gazdasági iparágak"
              aside="Élelmiszeripar / vendéglátás"
            />
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
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
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
                  await navigate({
                    to: "/settings",
                    search: { tab: "danger", focus: SETTINGS_FOCUS_DEMO_RESET },
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
