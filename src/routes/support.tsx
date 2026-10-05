import { createFileRoute } from "@tanstack/react-router";

import { SupportSurface } from "@/components/SupportSurface";

export const Route = createFileRoute("/support")({
  component: SupportSurface,
});
