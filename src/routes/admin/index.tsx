import { createFileRoute, Navigate } from "@tanstack/react-router";

import { ConstructionPage } from "@/components/ConstructionGate";
import { isConstructionUnlocked, maintenanceModeOn } from "@/lib/constructionGate";
import { langSearch } from "@/lib/langSearch";

export const Route = createFileRoute("/admin/")({
  component: AdminEntry,
});

function AdminEntry() {
  if (!maintenanceModeOn() || isConstructionUnlocked()) {
    return <Navigate to="/" search={langSearch} replace />;
  }
  return <ConstructionPage showAdmin />;
}
