import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { UZLETI_STRATEGIA_FUNNEL } from "@/content/funnels/uzletiStrategia";

export const Route = createFileRoute("/f/uzleti-strategia/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: UzletiStrategiaCheckoutPage,
});

function UzletiStrategiaCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Üzleti és stratégiai tervezés"
      funnelName="Üzleti-stratégia"
      tier={getTierCore(tierId)}
      copy={tierId ? UZLETI_STRATEGIA_FUNNEL.packages[tierId] : null}
    />
  );
}
