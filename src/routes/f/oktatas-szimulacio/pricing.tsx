import { createFileRoute, Link } from "@tanstack/react-router";

import { OKTATAS_SZIMULACIO_FUNNEL } from "@/content/funnels/oktatasSzimulacio";
import { FunnelShell } from "@/components/funnel/FunnelShell";
import { TierCards } from "@/components/funnel/TierCards";
import { FaqSection } from "@/components/funnel/FaqSection";
import { Button } from "@/components/ui/button";
import { PRICING_HERO } from "@/content/pricing/tiers";

export const Route = createFileRoute("/f/oktatas-szimulacio/pricing")({
  component: OktatasSzimulacioPricingPage,
});

function OktatasSzimulacioPricingPage() {
  const c = OKTATAS_SZIMULACIO_FUNNEL;
  return (
    <FunnelShell eyebrow={c.hero.eyebrow} title="Csomagok — Oktatási és szimulációs tréningek" subtitle={PRICING_HERO}>
      <TierCards offers={c.tierOffers} selected={c.tiers.defaultSelected} ctaLabel="Kiválasztom" checkoutHref="/f/oktatas-szimulacio/checkout" />
      <div className="mt-2 text-[11px] text-slate-400">{c.tiers.note}</div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/f/oktatas-szimulacio">Vissza a landingre</Link>
        </Button>
      </div>
      <div className="mt-6">
        <FaqSection items={c.faq} defaultOpenFirst={false} />
      </div>
    </FunnelShell>
  );
}
