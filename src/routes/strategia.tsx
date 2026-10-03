import { createFileRoute } from "@tanstack/react-router";

import { CampaignLanding, campaignRouteHead } from "@/components/funnel/CampaignLanding";
import { campaignSearchFromUnknown } from "@/lib/campaignFunnels";

export const Route = createFileRoute("/strategia")({
  validateSearch: campaignSearchFromUnknown,
  head: () => campaignRouteHead("strategia"),
  component: () => <CampaignLanding campaignId="strategia" />,
});
