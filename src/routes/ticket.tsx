import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { supportPublicOrigin } from "@/lib/support";

export const Route = createFileRoute("/ticket")({
  component: TicketRedirectPage,
});

/** Apex /ticket → support.szcenario.hu/ticket (a jegyűrlap a support site-on él). */
function TicketRedirectPage() {
  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    window.location.replace(`${supportPublicOrigin()}/ticket${search}`);
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      Átirányítás a support jegyűrlapra…
    </div>
  );
}
