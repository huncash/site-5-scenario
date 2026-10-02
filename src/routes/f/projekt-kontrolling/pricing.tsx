import { createFileRoute, Link } from "@tanstack/react-router";

import { PROJEKT_KONTROLLING_FUNNEL } from "@/content/funnels/projektKontrolling";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { PRICING_HERO } from "@/content/pricing/tiers";

export const Route = createFileRoute("/f/projekt-kontrolling/pricing")({
  component: ProjektKontrollingPricingPage,
});

function ProjektKontrollingPricingPage() {
  const c = PROJEKT_KONTROLLING_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title="Csomagok — Projekt‑kontrolling" subtitle={PRICING_HERO}>
      <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} ctaLabel="Kiválasztom" checkoutHref="/f/projekt-kontrolling/checkout" />
      <div className="mt-2 text-[11px] text-slate-400">{c.tiers.note}</div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/f/projekt-kontrolling">Vissza a landingre</Link>
        </Button>
      </div>
      <div className="mt-6">
        <FaqSection items={c.faq} defaultOpenFirst={false} />
      </div>
    </FunnelShell>
  );
}
