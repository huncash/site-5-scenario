import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { PairingGateway } from "@/components/PairingGateway";

export const Route = createFileRoute("/connect")({
  validateSearch: z.object({
    session: z.string().optional(),
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const { session } = Route.useSearch();
  return <PairingGateway sessionId={session} />;
}

