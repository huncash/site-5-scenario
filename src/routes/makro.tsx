import { createFileRoute } from "@tanstack/react-router";

import { CampaignLanding, campaignRouteHead } from "@/components/funnel/CampaignLanding";
import { campaignSearchFromUnknown } from "@/lib/campaignFunnels";

export const Route = createFileRoute("/makro")({
  validateSearch: campaignSearchFromUnknown,
  head: () => campaignRouteHead("makro"),
  component: () => <CampaignLanding campaignId="makro" />,
});
