import { createFileRoute, Link } from "@tanstack/react-router";

import { MINOSEG_KOLTSEG_FUNNEL } from "@/content/funnels/minosegKoltseg";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/f/minoseg-koltseg/pricing")({
  component: MinosegKoltsegPricingPage,
});

function MinosegKoltsegPricingPage() {
  const c = MINOSEG_KOLTSEG_FUNNEL;
  return (
    <FunnelShell
      eyebrow={c.hero.eyebrow}
      title="Csomagok — Lean Minőség & Költség"
      subtitle="Operatív döntésekhez: fedezeti pont, sávok, veszteséghőtérkép — helyben számolva."
    >
      <Card className="border-border/60 bg-background/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-100">3 fix tier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} ctaLabel="Ingyenes kipróbálás" checkoutHref="/f/minoseg-koltseg/checkout" />
          <div className="text-[11px] text-slate-400">{c.tiers.note}</div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link to="/f/minoseg-koltseg/demo">Segédeszköz ingyenes kipróbálása</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/f/minoseg-koltseg">Vissza a landingre</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        <FaqSection items={c.faq} defaultOpenFirst={false} />
      </div>
    </FunnelShell>
  );
}

