import { createFileRoute, Link } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROJEKT_KONTROLLING_FUNNEL } from "@/content/funnels/projektKontrolling";

export const Route = createFileRoute("/f/projekt-kontrolling/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: ProjektKontrollingCheckoutPage,
});

function ProjektKontrollingCheckoutPage() {
  const search = Route.useSearch();
  const tierCore = getTierCore(search.tier);
  const tierId = (search.tier as TierId | undefined) ?? undefined;
  const copy = tierId ? PROJEKT_KONTROLLING_FUNNEL.packages[tierId] : null;

  return (
    <FunnelShell eyebrow="Projekt‑kontrolling" title="Aktiválás kész — helyben" subtitle="Nincs fizetés, nincs szerveres aktiválás. A kipróbálás a te eszközödön fut.">
      <Card className="border-border/60 bg-background/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-100">
            Kiválasztott csomag
            {tierCore ? (
              <Badge variant="secondary" className="text-[11px]">{tierCore.label}</Badge>
            ) : (
              <Badge variant="outline" className="text-[11px]">nincs kiválasztva</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            {tierCore && copy ? (
              <>
                <div className="text-slate-100">{copy.tagline}</div>
                <div className="mt-1 text-[12px]">{copy.description}</div>
              </>
            ) : (
              <div>Nem választottál csomagot — ettől még elindíthatod a projekt demót.</div>
            )}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild className="h-10">
              <Link to="/f/projekt-kontrolling/demo">Segédeszköz ingyenes kipróbálása</Link>
            </Button>
            <Button asChild variant="outline" className="h-10">
              <Link to="/f/projekt-kontrolling/pricing">Vissza a csomagokhoz</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </FunnelShell>
  );
}

