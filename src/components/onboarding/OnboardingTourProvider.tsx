"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ONBOARDING_TOUR_STEPS } from "@/components/onboarding/onboardingTourSteps";

const STORAGE_KEY = "szcenario_onboarding_seen";

type OnboardingTourApi = {
  openTour: () => void;
  closeTour: () => void;
};

const Ctx = createContext<OnboardingTourApi | null>(null);

function safeGetSeen(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function safeSetSeen(): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore (private mode / blocked storage)
  }
}

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const openTour = useCallback(() => {
    setStepIndex(0);
    setOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setOpen(false);
  }, []);

  const skip = useCallback(() => {
    safeSetSeen();
    setOpen(false);
  }, []);

  const finish = useCallback(() => {
    safeSetSeen();
    setOpen(false);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_TOUR_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Auto-trigger on first visit (only on dashboard, not on funnels/login).
  useEffect(() => {
    if (safeGetSeen()) return;
    try {
      const p = window.location.pathname || "/";
      if (p !== "/") return;
      openTour();
    } catch {
      // ignore
    }
  }, [openTour]);

  const api = useMemo<OnboardingTourApi>(() => ({ openTour, closeTour }), [openTour, closeTour]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <OnboardingTour
        open={open}
        stepIndex={stepIndex}
        steps={ONBOARDING_TOUR_STEPS}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) safeSetSeen();
        }}
        onPrev={prev}
        onNext={next}
        onSkip={skip}
        onFinish={finish}
      />
    </Ctx.Provider>
  );
}

export function useOnboardingTour() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboardingTour must be used within OnboardingTourProvider");
  return v;
}

