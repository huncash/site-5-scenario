import { SiteKindTestPage } from "@/components/SiteKindTestPage";

/** bill.szcenario.hu vagy /bill — dedikált aldomain teszt nyitóoldal. */
export function BillingSurface() {
  return <SiteKindTestPage kind="bill" />;
}
