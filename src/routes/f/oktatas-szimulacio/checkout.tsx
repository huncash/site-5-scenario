import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { OKTATAS_SZIMULACIO_FUNNEL } from "@/content/funnels/oktatasSzimulacio";
import { parseLangSearch } from "@/lib/langSearch";

export const Route = createFileRoute("/f/oktatas-szimulacio/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLangSearch(s),
    tier: isTierId(s.tier) ? s.tier : undefined,
  }),
  component: OktatasSzimulacioCheckoutPage,
});

function OktatasSzimulacioCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Oktatási és szimulációs tréningek"
      funnelName="Oktatas-szimulacio"
      tier={getTierCore(tierId)}
      copy={tierId ? OKTATAS_SZIMULACIO_FUNNEL.packages[tierId] : null}
    />
  );
}
