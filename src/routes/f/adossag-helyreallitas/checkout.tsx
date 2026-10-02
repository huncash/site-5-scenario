import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { ADOSSAG_HELYREALLITAS_FUNNEL } from "@/content/funnels/adossagHelyreallitas";

export const Route = createFileRoute("/f/adossag-helyreallitas/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: AdossagCheckoutPage,
});

function AdossagCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Adósság‑helyreállítás"
      funnelName="Adósság-helyreállítás"
      tier={getTierCore(tierId)}
      copy={tierId ? ADOSSAG_HELYREALLITAS_FUNNEL.packages[tierId] : null}
    />
  );
}
