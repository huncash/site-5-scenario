import { createFileRoute } from "@tanstack/react-router";

import { SupportHost } from "@/components/SupportSurface";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => publicSeoHead("pricing"),
  component: SupportHost,
});
