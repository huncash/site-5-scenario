import { createFileRoute } from "@tanstack/react-router";

import { CampaignLanding, campaignRouteHead } from "@/components/funnel/CampaignLanding";
import { campaignSearchFromUnknown } from "@/lib/campaignFunnels";

export const Route = createFileRoute("/kozosseg")({
  validateSearch: campaignSearchFromUnknown,
  head: () => campaignRouteHead("kozosseg"),
  component: () => <CampaignLanding campaignId="kozosseg" />,
});
