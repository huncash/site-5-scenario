import { createFileRoute, Link } from "@tanstack/react-router";

import { MULTISITE_FUNNEL } from "@/content/funnels/multiSite";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { PRICING_HERO } from "@/content/pricing/tiers";

export const Route = createFileRoute("/f/multi-site/pricing")({
  component: MultiSitePricingPage,
});

function MultiSitePricingPage() {
  const c = MULTISITE_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title="Válassz csomagot" subtitle={PRICING_HERO}>
      <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} ctaLabel="Kiválasztom" checkoutHref="/f/multi-site/checkout" />
      <div className="mt-2 text-[11px] text-slate-400">{c.tiers.note}</div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/f/multi-site">Vissza a landingre</Link>
        </Button>
      </div>
      <div className="mt-6">
        <FaqSection items={c.faq} defaultOpenFirst={false} />
      </div>
    </FunnelShell>
  );
}
