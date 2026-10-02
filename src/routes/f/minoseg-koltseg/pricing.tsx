import { createFileRoute, Link } from "@tanstack/react-router";

import { MINOSEG_KOLTSEG_FUNNEL } from "@/content/funnels/minosegKoltseg";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { PRICING_HERO } from "@/content/pricing/tiers";

export const Route = createFileRoute("/f/minoseg-koltseg/pricing")({
  component: MinosegKoltsegPricingPage,
});

function MinosegKoltsegPricingPage() {
  const c = MINOSEG_KOLTSEG_FUNNEL;
  return (
    <FunnelShell
      eyebrow={c.hero.eyebrow}
      title="Csomagok — Lean Minőség & Költség"
      subtitle={PRICING_HERO}
    >
      <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} ctaLabel="Kiválasztom" checkoutHref="/f/minoseg-koltseg/checkout" />
      <div className="mt-2 text-[11px] text-slate-400">{c.tiers.note}</div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/f/minoseg-koltseg" search={{ v: undefined }}>
            Vissza a landingre
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <FaqSection items={c.faq} defaultOpenFirst={false} />
      </div>
    </FunnelShell>
  );
}
