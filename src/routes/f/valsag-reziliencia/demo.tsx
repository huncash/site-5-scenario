import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/lib/vault";
import { writeScenarioDoorStep } from "@/lib/doorStep";

export const Route = createFileRoute("/f/valsag-reziliencia/demo")({
  component: ValsagRezilienciaDemoLoaderPage,
});

function ValsagRezilienciaDemoLoaderPage() {
  const navigate = useNavigate();
  const { state } = useVault();
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (inFlight.current) return;
    if (state.status === "loading") return;
    inFlight.current = true;
    setError(null);
    try {
      writeScenarioDoorStep("resilience");
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("szcenario_home_mode");
        window.dispatchEvent(new Event("szcenario:home_mode"));
      }
      void navigate({ to: "/" });
    } catch (e: unknown) {
      inFlight.current = false;
      setError(e instanceof Error ? e.message : "Nem sikerült megnyitni a reziliencia-eseteket.");
    }
  }, [navigate, state.status]);

  return (
    <FunnelShell
      eyebrow="BCP és működési reziliencia"
      title="Esetek megnyitása…"
      subtitle="BCP, helyi önfenntartás, működési tartalék, stratégiai előrejelzés. Nincs automata belépés egyetlen pályára."
    >
      <Card className="border-border/60 bg-background/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-100">Állapot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          {error ? (
            <>
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">{error}</div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => window.location.reload()}>
                  Újrapróbálom
                </Button>
                <Button asChild variant="outline">
                  <a href="/f/valsag-reziliencia/">Vissza</a>
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-md border border-border/60 bg-background/40 p-3">Átirányítás a választóhoz…</div>
          )}
        </CardContent>
      </Card>
    </FunnelShell>
  );
}
