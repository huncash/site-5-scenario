import { useRouterState } from "@tanstack/react-router";

import "../../bill/src/styles.css";
import { BillingCheckout } from "../../bill/src/App";

/** bill.szcenario.hu / /bill — valós checkout a plans.ts csomagokkal. */
export function BillTestSurface() {
  const search = useRouterState({ select: (s) => s.location.searchStr ?? "" });
  return <BillingCheckout search={search} />;
}
