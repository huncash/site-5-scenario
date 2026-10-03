import { createFileRoute } from "@tanstack/react-router";

import { CampaignLanding, campaignRouteHead } from "@/components/funnel/CampaignLanding";
import { campaignSearchFromUnknown } from "@/lib/campaignFunnels";

export const Route = createFileRoute("/oktatas")({
  validateSearch: campaignSearchFromUnknown,
  head: () => campaignRouteHead("oktatas"),
  component: () => <CampaignLanding campaignId="oktatas" />,
});
