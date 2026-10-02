import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { MINOSEG_KOLTSEG_FUNNEL } from "@/content/funnels/minosegKoltseg";

export const Route = createFileRoute("/f/minoseg-koltseg/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: MinosegKoltsegCheckoutPage,
});

function MinosegKoltsegCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Lean Minőség & Költség"
      funnelName="Lean Minőség & Költség"
      tier={getTierCore(tierId)}
      copy={tierId ? MINOSEG_KOLTSEG_FUNNEL.packages[tierId] : null}
    />
  );
}
