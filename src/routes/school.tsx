import { createFileRoute } from "@tanstack/react-router";

import { SchoolSurface } from "@/components/school/SchoolSurface";
import { publicSeoHead } from "@/lib/seo";

export const Route = createFileRoute("/school")({
  head: () => publicSeoHead("school"),
  component: SchoolSurface,
});
