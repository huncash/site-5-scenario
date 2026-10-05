import { createFileRoute } from "@tanstack/react-router";

import { SchoolSurface } from "@/components/school/SchoolSurface";

export const Route = createFileRoute("/school")({
  component: SchoolSurface,
});
