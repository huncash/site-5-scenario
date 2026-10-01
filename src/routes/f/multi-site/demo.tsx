import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/lib/vault";
import { enterDemoSegment } from "@/lib/demoSession";

export const Route = createFileRoute("/f/multi-site/demo")({
  component: MultiSiteDemoLoaderPage,
});

function MultiSiteDemoLoaderPage() {
  const navigate = useNavigate();
  const { state, unlockById, createProfile } = useVault();
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (inFlight.current) return;
    // Wait until vault state is resolved (provider bootstraps profiles)
    if (state.status === "loading") return;

    inFlight.current = true;
    setError(null);
    void (async () => {
      try {
        await enterDemoSegment("demo1_multisite_operator", { unlockById, createProfile });
        await navigate({ to: "/" });
      } catch (e: unknown) {
        inFlight.current = false;
        setError(e instanceof Error ? e.message : "Nem sikerült betölteni a demót.");
      }
    })();
  }, [createProfile, navigate, state.status, unlockById]);

  return (
    <FunnelShell
      eyebrow="Multi‑Site / Hálózati vállalkozások"
      title="Multi‑site demó betöltése…"
      subtitle="A demó a meglévő preloadolt állapotot aktiválja, majd megnyitja a fő dashboardot."
    >
      <Card className="border-border/60 bg-background/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-100">Állapot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          {error ? (
            <>
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">
                {error}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => window.location.reload()}>
                  Újrapróbálom
                </Button>
                <Button asChild variant="outline">
                  <a href="/f/multi-site">Vissza a landingre</a>
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              Betöltés folyamatban… (ha kész, automatikusan átdob a demóra)
            </div>
          )}
          <div className="text-[11px] text-slate-400">
            Megjegyzés: a demó egy külön profilt aktiválhat (meglévő funkció). A funnel nem módosítja a core motort.
          </div>
        </CardContent>
      </Card>
    </FunnelShell>
  );
}

