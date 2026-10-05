import { lazy, Suspense, useEffect, useState } from "react";

import "../../bill/src/styles.css";

const BillingView = lazy(() =>
  import("../../bill/src/App").then((m) => ({ default: m.BillingView })),
);

function BillPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
      Számlázás…
    </div>
  );
}

/** bill.szcenario.hu vagy /bill — a query-t a BillingView olvassa. */
export function BillingSurface() {
  const [ready, setReady] = useState(() => typeof window !== "undefined");
  useEffect(() => setReady(true), []);
  if (!ready) return <BillPending />;
  return (
    <Suspense fallback={<BillPending />}>
      <BillingView />
    </Suspense>
  );
}
