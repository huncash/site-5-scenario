import type { Metadata } from "next";

import { PropertyLanding } from "@/components/listing/PropertyLanding";

export const metadata: Metadata = {
  title: { absolute: "Erdei faház Börzsönyligeten — 1046 m² privát telek" },
  description:
    "Kismaros-Börzsönyliget, zsákutca vége. 1046 m² belterületi Lke-4 telek faházzal. Alapár 31.500.000 Ft; kétütemű novemberi kedvezménnyel 30.700.000 Ft. Közvetlenül a tulajdonostól, jutalék nélkül.",
  robots: { index: true, follow: true },
};

export default function ListingPage() {
  return <PropertyLanding />;
}
