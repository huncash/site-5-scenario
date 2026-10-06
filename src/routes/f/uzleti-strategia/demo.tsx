import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVault } from "@/lib/vault";
import { enterCampaignChooser } from "@/lib/campaignSession";

export const Route = createFileRoute("/f/uzleti-strategia/demo")({
  component: UzletiStrategiaDemoLoaderPage,
});

function UzletiStrategiaDemoLoaderPage() {
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
      enterCampaignChooser("strategia");
      void navigate({ to: "/", hash: "tipusok" });
    } catch (e: unknown) {
      inFlight.current = false;
      setError(e instanceof Error ? e.message : "Nem sikerült megnyitni a stratégiai eseteket.");
    }
  }, [navigate, state.status]);

  return (
    <FunnelShell
      eyebrow="Üzleti és stratégiai tervezés"
      title="Esetek megnyitása…"
      subtitle="Elképzelt stratégiai minták. Nincs automata belépés egyetlen pályára — a számok a gépeden maradnak."
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
                  <a href="/f/uzleti-strategia/">Vissza</a>
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
