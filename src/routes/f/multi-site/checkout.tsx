import { createFileRoute, Link } from "@tanstack/react-router";

import { FunnelShell } from "@/components/funnel/FunnelShell";
import { getTier } from "@/content/pricing/tiers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/f/multi-site/checkout")({
  validateSearch: (s: Record<string, unknown>) => {
    const tier = typeof s.tier === "string" ? s.tier : undefined;
    return { tier };
  },
  component: MultiSiteCheckoutSuccessPage,
});

function MultiSiteCheckoutSuccessPage() {
  const search = Route.useSearch();
  const tier = getTier(search.tier);

  return (
    <FunnelShell
      eyebrow="Multi‑Site / Hálózati vállalkozások"
      title="Aktiválás kész — helyben"
      subtitle="Ebben a verzióban nincs fizetés és nincs szerveres aktiválás. A funnel csak wrapper: a kipróbálás a te eszközödön fut."
    >
      <Card className="border-border/60 bg-background/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-100">
            Kiválasztott csomag
            {tier ? <Badge variant="secondary" className="text-[11px]">{tier.label}</Badge> : <Badge variant="outline" className="text-[11px]">nincs kiválasztva</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-300">
          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            {tier ? (
              <>
                <div className="text-slate-100">{tier.tagline}</div>
                <div className="mt-1 text-[12px]">{tier.description}</div>
              </>
            ) : (
              <div>Nem választottál csomagot — ettől még elindíthatod a multi‑site kipróbálást.</div>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild className="h-10">
              <Link to="/f/multi-site/demo">Segédeszköz ingyenes kipróbálása</Link>
            </Button>
            <Button asChild variant="outline" className="h-10">
              <Link to="/f/multi-site/pricing">Vissza a csomagokhoz</Link>
            </Button>
          </div>

          <div className="text-[11px] text-slate-400">
            Tipp: demó után nézd meg a Beállítások → Mentés & Helyreállítás részt (lokális export/import).
          </div>
        </CardContent>
      </Card>
    </FunnelShell>
  );
}

