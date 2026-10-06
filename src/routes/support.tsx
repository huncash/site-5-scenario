import { createFileRoute } from "@tanstack/react-router";

import { SupportHost } from "@/components/SupportSurface";

export const Route = createFileRoute("/support")({
  component: SupportHost,
});
