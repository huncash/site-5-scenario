import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppLicenseGate } from "@/components/AppLicenseGate";
import { Button } from "@/components/ui/button";
import { hasWorkspaceAccess } from "@/lib/license";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/app")({
  component: AppWorkspacePage,
});

function enterDashboard() {
  try {
    localStorage.setItem("szcenario_home_mode", "dashboard");
    window.dispatchEvent(new Event("szcenario:home_mode"));
  } catch {
    // ignore
  }
}

function AppWorkspacePage() {
  const { state } = useVault();
  const navigate = useNavigate();
  const [licensed, setLicensed] = useState(() => hasWorkspaceAccess());

  useEffect(() => {
    if (!licensed) return;
    if (state.status !== "unlocked") return;
    enterDashboard();
    void navigate({ to: "/" });
  }, [licensed, navigate, state.status]);

  if (!licensed) {
    return (
      <AppLicenseGate
        onGranted={() => {
          setLicensed(true);
        }}
      />
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Betöltés…
      </div>
    );
  }

  if (state.status !== "unlocked") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-3 rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="text-xl font-semibold">Munkaterület zárolva</h1>
          <p className="text-sm text-muted-foreground">
            A token rendben. Oldd fel a helyi profilt — a számítás a böngészőben marad.
          </p>
          <Button asChild>
            <Link to="/login">Profil feloldása</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
      Munkaterület megnyitása…
    </div>
  );
}
