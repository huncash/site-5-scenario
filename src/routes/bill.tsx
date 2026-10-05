import { createFileRoute } from "@tanstack/react-router";

import { BillingSurface } from "@/components/BillingSurface";

export const Route = createFileRoute("/bill")({
  component: BillingSurface,
});
