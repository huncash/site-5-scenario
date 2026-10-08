import { createFileRoute } from "@tanstack/react-router";

import { LabsMeshDesk } from "@/components/labs/LabsMeshDesk";

export const Route = createFileRoute("/labs/desk")({
  component: LabsDeskPage,
});

function LabsDeskPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <LabsMeshDesk />
    </div>
  );
}
