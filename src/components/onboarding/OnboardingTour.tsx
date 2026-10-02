"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Columns2,
  Keyboard,
  LayoutDashboard,
  Menu,
  RotateCw,
  Folders,
  PanelsTopLeft,
  Rows3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingStep, TourAnchorId, TourVisual } from "@/components/onboarding/onboardingTourSteps";
import { useSupportEmbedOptional } from "@/components/support/SupportEmbedProvider";
import { ONBOARDING_EMBED_SLUG } from "@/lib/support";

const ICON: Record<TourVisual["icon"], typeof Menu> = {
  layout: LayoutDashboard,
  panels: PanelsTopLeft,
  tabs: Rows3,
  dial: RotateCw,
  split: Columns2,
  keys: Keyboard,
  menu: Menu,
  workspace: Folders,
};

function measureAnchors(ids: TourAnchorId[]) {
  return ids
    .map((id) => {
      const el = document.querySelector(`[data-tour-anchor="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      // Skip viewport-filling boxes — they hide the layout instead of pointing to it.
      if (r.width > window.innerWidth * 0.92 || r.height > window.innerHeight * 0.45) return null;
      return { id, r };
    })
    .filter((x): x is { id: TourAnchorId; r: DOMRect } => Boolean(x));
}

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
  const embed = useSupportEmbedOptional();
  const lessonSlug = step?.id ? ONBOARDING_EMBED_SLUG[step.id] : undefined;
  const last = stepIndex === steps.length - 1;
  const [spots, setSpots] = useState<{ id: TourAnchorId; r: DOMRect }[]>([]);

  const anchorKey = (step?.anchors ?? []).join("|");
  useEffect(() => {
    if (!open) {
      setSpots([]);
      return;
    }
    const ids = (step?.anchors ?? []) as TourAnchorId[];
    const tick = () => setSpots(measureAnchors(ids));
    tick();
    const t = window.setInterval(tick, 250);
    window.addEventListener("resize", tick);
    return () => {
      window.clearInterval(t);
      window.removeEventListener("resize", tick);
    };
  }, [open, stepIndex, anchorKey, step?.anchors]);

  const cardAtTop = useMemo(() => {
    const ids = step?.anchors ?? [];
    return ids.includes("bottom-tabs") && !ids.includes("header");
  }, [step?.anchors]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      {spots.map((s) => {
        const label = step?.anchorLabels?.[s.id];
        return (
          <div
            key={s.id}
            className="pointer-events-none absolute rounded-xl ring-2 ring-cyan-300/80 shadow-[0_0_0_6px_rgba(34,211,238,0.18)]"
            style={{
              top: s.r.top - 4,
              left: s.r.left - 4,
              width: s.r.width + 8,
              height: s.r.height + 8,
            }}
          >
            {label ? (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-cyan-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-950">
                {label}
              </div>
            ) : null}
            <div
              className="absolute -right-1 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-cyan-300/90"
              aria-hidden="true"
            />
          </div>
        );
      })}

      <div
        className={cn(
          "pointer-events-auto absolute left-1/2 w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 text-slate-100 shadow-2xl backdrop-blur",
          cardAtTop ? "top-4" : "bottom-14",
        )}
      >
        <div className="flex items-start justify-between gap-2 pr-1">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {stepIndex + 1}/{steps.length}
            </div>
            <h2 id="onboarding-title" className="text-sm font-semibold text-slate-100">
              {step?.title ?? "—"}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-md px-1.5 text-slate-400 hover:text-slate-100"
            aria-label="Bezárás"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>

        <p className="mt-1 text-[13px] leading-snug text-slate-300">{step?.body ?? ""}</p>

        {step?.visuals?.length ? (
          <div className="mt-2 grid gap-1.5">
            {step.visuals.map((v) => {
              const Ico = ICON[v.icon];
              return (
                <div key={v.caption} className="flex items-start gap-2 text-[12px] text-slate-200">
                  <Ico className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                  <span>{v.caption}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-3 flex items-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full bg-slate-800",
                i <= stepIndex ? "bg-cyan-300/50" : "",
              )}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button type="button" variant="ghost" className="h-8 px-2 text-slate-300" onClick={onSkip}>
              Kihagyás
            </Button>
            {embed && lessonSlug ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-cyan-300"
                onClick={() => embed.openEmbed(lessonSlug, step?.title ?? "Lecke")}
              >
                Lecke
              </Button>
            ) : null}
          </div>
          <div className="flex gap-1.5">
            <Button type="button" variant="outline" className="h-8 border-slate-700 bg-slate-950/30" onClick={onPrev} disabled={stepIndex === 0}>
              Előző
            </Button>
            {last ? (
              <Button type="button" className="h-8 bg-cyan-500/90 text-slate-950 hover:bg-cyan-400" onClick={onFinish}>
                Bezárás
              </Button>
            ) : (
              <Button type="button" className="h-8 bg-cyan-500/90 text-slate-950 hover:bg-cyan-400" onClick={onNext}>
                Tovább
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
