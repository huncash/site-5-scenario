import { createFileRoute } from "@tanstack/react-router";

import { SupportHost } from "@/components/SupportSurface";
import { publicSeoHead, supportSeoPageFromPath } from "@/lib/seo";

export const Route = createFileRoute("/support/$")({
  head: ({ params }) => publicSeoHead(supportSeoPageFromPath(`/support/${params._splat ?? ""}`)),
  component: SupportHost,
});
