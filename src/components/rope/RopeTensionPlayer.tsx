import { useEffect, useRef, useState } from "react";

import { TangledRopeSvg } from "@/components/rope/TangledRopeSvg";
import {
  phasesFromProgress,
  progressFromStep,
  ROPE_STRAIGHTEN_STEPS,
  ROPE_TOTAL_STEPS,
  stepFromProgress,
} from "@/lib/ropePath";
import { cn } from "@/lib/utils";

const TOTAL_MS = ROPE_TOTAL_STEPS * 750;

const STEP_LABELS = [
  "0 · gubanc",
  "1 · bal hullám simul",
  "2 · bal hurok fogy",
  "3 · bal csomó oldódik",
  "4 · közép lazul",
  "5 · jobb csomó oldódik",
  "6 · jobb hurok fogy",
  "7 · majdnem egyenes",
  "8 · egyenes, csomómentes",
  "9 · vagon a szélen",
  "10 · behúzás indul",
  "11 · vagon belép",
  "12 · középtáv",
  "13 · közeledik",
  "14 · görgő közelébe",
  "15–16 · vagon, o-kacsa",
] as const;

type RopeTensionPlayerProps = {
  className?: string;
  autoPlay?: boolean;
};

export function RopeTensionPlayer({ className, autoPlay = true }: RopeTensionPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const next = Math.min(1, progressRef.current + dt / TOTAL_MS);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing]);

  const step = stepFromProgress(progress);
  const { straighten, haul } = phasesFromProgress(progress);

  const goToStep = (s: number) => {
    const clamped = Math.max(0, Math.min(ROPE_TOTAL_STEPS, s));
    setPlaying(false);
    const p = progressFromStep(clamped);
    progressRef.current = p;
    setProgress(p);
  };

  const play = () => {
    if (progressRef.current >= 0.999) {
      progressRef.current = 0;
      setProgress(0);
    }
    setPlaying(true);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-sm border border-border/40 bg-background/30 px-2 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[2px] sm:px-6">
        <TangledRopeSvg progress={progress} />
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="rounded-md border border-border/60 bg-card px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/40"
            onClick={() => goToStep(0)}
          >
            Eleje
          </button>
          {playing ? (
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
              onClick={() => setPlaying(false)}
            >
              Szünet
            </button>
          ) : (
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground"
              onClick={play}
            >
              {progress >= 0.999 ? "Újra" : "Lejátszás"}
            </button>
          )}
          <button
            type="button"
            className="rounded-md border border-border/60 bg-card px-3 py-1.5 text-[13px] text-foreground hover:bg-muted/40 disabled:opacity-40"
            disabled={step >= ROPE_TOTAL_STEPS}
            onClick={() => goToStep(Math.min(ROPE_TOTAL_STEPS, step + 1))}
          >
            Következő lépés
          </button>
        </div>

        <div className="text-center text-[12px] text-muted-foreground sm:text-right">
          Lépés {step} / {ROPE_TOTAL_STEPS}
          <span className="mx-2 opacity-40">·</span>
          {haul < 0.01 ? `feszítés ${(straighten * 100).toFixed(0)}%` : `behúzás ${(haul * 100).toFixed(0)}%`}
        </div>
      </div>

      <ol className="mx-auto grid max-w-4xl grid-cols-2 gap-1.5 text-[11px] text-muted-foreground sm:grid-cols-4">
        {STEP_LABELS.map((label, i) => {
          const target = i === 15 ? ROPE_TOTAL_STEPS : i;
          const active =
            i === 15 ? step >= 15 : step === i || (i === ROPE_STRAIGHTEN_STEPS && step === ROPE_STRAIGHTEN_STEPS);
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => goToStep(target)}
                className={cn(
                  "w-full rounded border px-2 py-1.5 text-left transition-colors",
                  active
                    ? "border-amber-700/50 bg-amber-900/20 text-foreground"
                    : "border-border/40 hover:border-border/70",
                  i === ROPE_STRAIGHTEN_STEPS && "sm:col-span-1",
                )}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
