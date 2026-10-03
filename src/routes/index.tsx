import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";

import { AppLicenseGate } from "@/components/AppLicenseGate";
import { ScenarioDoor } from "@/components/ScenarioDoor";
import { useI18n } from "@/i18n";
import { hasWorkspaceAccess, isAppWorkspaceHost, isLocalDevHost } from "@/lib/license";
import { useVault } from "@/lib/vault";

const FinanceDashboard = lazy(() =>
  import("@/components/finance/FinanceDashboard").then((m) => ({ default: m.FinanceDashboard })),
);

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  return <VaultGate />;
}

const HOME_MODE_KEY = "szcenario_home_mode";
type HomeMode = "door" | "dashboard";

function readHomeMode(): HomeMode {
  try {
    const v = typeof window !== "undefined" ? window.localStorage.getItem(HOME_MODE_KEY) : null;
    return v === "dashboard" ? "dashboard" : "door";
  } catch {
    return "door";
  }
}

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      Betöltés…
    </div>
  );
}

function VaultGate() {
  const { state } = useVault();
  const { locale, fxRate } = useI18n();
  const [homeMode, setHomeMode] = useState<HomeMode>("door");
  const [licenseTick, setLicenseTick] = useState(0);
  const appHost = typeof window !== "undefined" && isAppWorkspaceHost();
  const licensed = hasWorkspaceAccess() || isLocalDevHost();

  useEffect(() => {
    setHomeMode(readHomeMode());

    const onPing = () => setHomeMode(readHomeMode());
    window.addEventListener("storage", onPing);
    window.addEventListener("szcenario:home_mode", onPing as EventListener);
    return () => {
      window.removeEventListener("storage", onPing);
      window.removeEventListener("szcenario:home_mode", onPing as EventListener);
    };
  }, []);

  if (state.status === "loading") return <Loading />;

  const dashboard =
    state.status === "unlocked" ? (
      <Suspense fallback={<Loading />}>
        <FinanceDashboard
          key={`${locale}:${fxRate}`}
          vaultKey={state.key}
          profileId={state.profile.id}
          profileName={state.profile.name}
        />
      </Suspense>
    ) : null;

  if (appHost) {
    if (!licensed) {
      return <AppLicenseGate onGranted={() => setLicenseTick((n) => n + 1)} />;
    }
    if (state.status !== "unlocked") return <ScenarioDoor />;
    void licenseTick;
    return dashboard;
  }

  if (homeMode !== "dashboard") return <ScenarioDoor />;
  if (state.status !== "unlocked") return <ScenarioDoor />;
  return dashboard;
}
