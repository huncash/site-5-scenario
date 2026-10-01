"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/components/onboarding/onboardingTourSteps";

export function OnboardingTour(props: {
  open: boolean;
  stepIndex: number;
  steps: OnboardingStep[];
  onOpenChange: (open: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
}) {
  const { open, stepIndex, steps, onOpenChange, onPrev, onNext, onSkip, onFinish } = props;
  const step = steps[stepIndex];
  const last = stepIndex === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-slate-700 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Kezdő lépések • {stepIndex + 1}/{steps.length}
              </div>
              <DialogTitle className="mt-1 text-balance text-lg font-semibold text-slate-100">
                {step?.title ?? "—"}
              </DialogTitle>
            </div>
            <Badge variant="secondary" className="shrink-0 bg-cyan-400/10 text-cyan-200">
              local‑first
            </Badge>
          </div>

          <DialogDescription className="text-sm text-slate-300">{step?.body ?? ""}</DialogDescription>

          {step?.bullets?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-[13px] text-slate-200">
              {step.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-center gap-1.5 pt-1">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-6 rounded-full border border-slate-700/60 bg-slate-900/50",
                  i <= stepIndex ? "bg-cyan-300/30 border-cyan-300/30" : "",
                )}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" className="h-9 border-slate-700 bg-slate-950/30" onClick={onSkip}>
                Kihagyás
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 border-slate-700 bg-slate-950/30"
                onClick={onPrev}
                disabled={stepIndex === 0}
              >
                Előző
              </Button>
              {last ? (
                <Button type="button" className="h-9 bg-cyan-500/90 text-slate-950 hover:bg-cyan-400" onClick={onFinish}>
                  Kezdjük a használatot!
                </Button>
              ) : (
                <Button type="button" className="h-9 bg-cyan-500/90 text-slate-950 hover:bg-cyan-400" onClick={onNext}>
                  Következő
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

