import { createFileRoute } from "@tanstack/react-router";

import { FunnelCheckout } from "@/components/funnel/FunnelCheckout";
import { getTierCore, isTierId, type TierId } from "@/content/pricing/tiers";
import { MULTISITE_FUNNEL } from "@/content/funnels/multiSite";

export const Route = createFileRoute("/f/multi-site/checkout")({
  validateSearch: (s: Record<string, unknown>) => ({ tier: isTierId(s.tier) ? s.tier : undefined }),
  component: MultiSiteCheckoutPage,
});

function MultiSiteCheckoutPage() {
  const search = Route.useSearch();
  const tierId = search.tier as TierId | undefined;
  return (
    <FunnelCheckout
      eyebrow="Multi‑Site / Hálózati vállalkozások"
      funnelName="Multi-Site"
      tier={getTierCore(tierId)}
      copy={tierId ? MULTISITE_FUNNEL.packages[tierId] : null}
    />
  );
}
