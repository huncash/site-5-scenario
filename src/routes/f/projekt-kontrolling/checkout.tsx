import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { PROJEKT_KONTROLLING_FUNNEL } from "@/content/funnels/projektKontrolling";

export const Route = createFileRoute("/f/projekt-kontrolling/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: ProjektKontrollingCheckoutPage,
});

function ProjektKontrollingCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Projekt‑kontrolling"
      funnelName="Projekt-kontrolling"
      tier={getTierCore(tierId)}
      copy={tierId ? PROJEKT_KONTROLLING_FUNNEL.packages[tierId] : null}
    />
  );
}
