"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ONBOARDING_TOUR_STEP_IDS, onboardingTourSteps } from "@/components/onboarding/onboardingTourSteps";
import { useI18n } from "@/i18n";

const STORAGE_KEY = "szcenario_onboarding_seen";
const PENDING_KEY = "szcenario_onboarding_pending";
const HOME_MODE_KEY = "szcenario_home_mode";

type OnboardingTourApi = {
  openTour: () => void;
  closeTour: () => void;
  isOpen: boolean;
  stepIndex: number;
  stepId: string | null;
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

function safeConsumePending(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    const v = localStorage.getItem(PENDING_KEY) === "1";
    if (v) localStorage.removeItem(PENDING_KEY);
    return v;
  } catch {
    return false;
  }
}

function safeReadHomeMode(): "door" | "dashboard" {
  try {
    if (typeof localStorage === "undefined") return "door";
    return localStorage.getItem(HOME_MODE_KEY) === "dashboard" ? "dashboard" : "door";
  } catch {
    return "door";
  }
}

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const steps = useMemo(() => onboardingTourSteps(t), [t]);
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
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_TOUR_STEP_IDS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Auto-trigger only after "kipróbálás" starts a demo (pending flag), not on the landing/door.
  useEffect(() => {
    if (safeGetSeen()) return;
    try {
      const p = window.location.pathname || "/";
      if (p !== "/") return;
      if (safeReadHomeMode() !== "dashboard") return;
      if (!safeConsumePending()) return;
      openTour();
    } catch {
      // ignore
    }
  }, [openTour]);

  const api = useMemo<OnboardingTourApi>(
    () => ({
      openTour,
      closeTour,
      isOpen: open,
      stepIndex,
      stepId: ONBOARDING_TOUR_STEP_IDS[stepIndex] ?? null,
    }),
    [openTour, closeTour, open, stepIndex],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <OnboardingTour
        open={open}
        stepIndex={stepIndex}
        steps={steps}
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

