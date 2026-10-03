import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { PairingGateway } from "@/components/PairingGateway";
import { ACCESS_ROLE, writeAccessRole, writeViewerToken } from "@/lib/accessRole";
import { isViewerInviteRevokedLocally, roleFromConnectSearch } from "@/lib/viewerInvite";

export const Route = createFileRoute("/connect")({
  validateSearch: z.object({
    session: z.string().optional(),
    role: z.string().optional(),
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const { session, role } = Route.useSearch();
  const accessRole = roleFromConnectSearch(role);

  useEffect(() => {
    if (accessRole !== ACCESS_ROLE.VIEWER_READONLY || !session) return;
    if (isViewerInviteRevokedLocally(session)) return;
    writeAccessRole(ACCESS_ROLE.VIEWER_READONLY);
    writeViewerToken(session);
  }, [accessRole, session]);

  return <PairingGateway sessionId={session} accessRole={accessRole} />;
}

