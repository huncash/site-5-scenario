import { createFileRoute } from "@tanstack/react-router";

import { CampaignLanding, campaignRouteHead } from "@/components/funnel/CampaignLanding";
import { campaignSearchFromUnknown } from "@/lib/campaignFunnels";

export const Route = createFileRoute("/bcp")({
  validateSearch: campaignSearchFromUnknown,
  head: () => campaignRouteHead("bcp"),
  component: () => <CampaignLanding campaignId="bcp" />,
});
