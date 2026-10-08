import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { VALSAG_REZILIENCIA_FUNNEL } from "@/content/funnels/valsagReziliencia";
import { parseLangSearch } from "@/lib/langSearch";

export const Route = createFileRoute("/f/valsag-reziliencia/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({
    ...parseLangSearch(s),
    tier: isTierId(s.tier) ? s.tier : undefined,
  }),
  component: ValsagRezilienciaCheckoutPage,
});

function ValsagRezilienciaCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="BCP és működési reziliencia"
      funnelName="Valsag-reziliencia"
      tier={getTierCore(tierId)}
      copy={tierId ? VALSAG_REZILIENCIA_FUNNEL.packages[tierId] : null}
    />
  );
}
