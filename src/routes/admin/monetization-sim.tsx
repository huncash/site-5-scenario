import { createFileRoute, Navigate } from "@tanstack/react-router";

import { PrivateMonetizationSim } from "@/components/admin/PrivateMonetizationSim";
import { langSearch } from "@/lib/langSearch";
import { isLocalDevHost } from "@/lib/license";

export const Route = createFileRoute("/admin/monetization-sim")({
  component: MonetizationSimGate,
});

function MonetizationSimGate() {
  if (typeof window !== "undefined" && !isLocalDevHost()) {
    return <Navigate to="/" search={langSearch} replace />;
  }

  return (
    <div className="h-dvh overflow-x-hidden overflow-y-auto overscroll-contain bg-background">
      <PrivateMonetizationSim />
    </div>
  );
}
