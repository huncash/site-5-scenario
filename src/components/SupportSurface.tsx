import { lazy, Suspense, useEffect, useState } from "react";

import { SiteKindProbe } from "@/components/SiteKindProbe";

import "../../support/src/styles.css";

const SupportApp = lazy(() =>
  import("../../support/src/App").then((m) => ({ default: m.App })),
);

function SupportPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      Támogatás…
    </div>
  );
}

/** support.szcenario.hu vagy /support */
export function SupportSurface() {
  const [ready, setReady] = useState(() => typeof window !== "undefined");
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="full" style={{ maxWidth: "52rem", margin: "0 auto", padding: "28px 16px" }}>
        <SiteKindProbe kind="support" />
        <SupportPending />
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="full" style={{ maxWidth: "52rem", margin: "0 auto", padding: "28px 16px" }}>
          <SiteKindProbe kind="support" />
          <SupportPending />
        </div>
      }
    >
      <SupportApp />
    </Suspense>
  );
}
