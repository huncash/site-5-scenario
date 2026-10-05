import { SiteKindTestPage } from "@/components/SiteKindTestPage";

/** support.szcenario.hu vagy /support — dedikált aldomain teszt nyitóoldal. */
export function SupportSurface() {
  return <SiteKindTestPage kind="support" />;
}
