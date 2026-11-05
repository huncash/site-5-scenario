import type { Metadata } from "next";

import { PropertyLanding } from "@/components/listing/PropertyLanding";

export const metadata: Metadata = {
  title: { absolute: "Erdei faház Börzsönyligeten — 1046 m² privát telek" },
  description:
    "Kismaros-Börzsönyliget, zsákutca vége. 1046 m² belterületi Lke-4 telek faházzal. Alapár 33 M Ft; novemberi szerződéskötéssel 32,2 M Ft. Közvetlenül a tulajdonostól, jutalék nélkül.",
  robots: { index: true, follow: true },
};

export default function ListingPage() {
  return <PropertyLanding />;
}
