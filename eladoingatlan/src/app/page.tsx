import type { Metadata } from "next";

import { PropertyLanding } from "@/components/listing/PropertyLanding";

export const metadata: Metadata = {
  title: { absolute: "Erdei faház Börzsönyligeten — 1046 m² privát telek" },
  description:
    "Kismaros-Börzsönyliget, zsákutca vége, az erdő sűrűjében. 1046 m² belterületi Lke-4 telek faházzal. Alapár 31.500.000 Ft; kétütemű novemberi kedvezménnyel 30.700.000 Ft. Közvetlenül a tulajdonostól.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Erdei faház Börzsönyligeten — 1046 m² privát telek",
    description:
      "Kismaros-Börzsönyliget, az erdő sűrűjében. Alapár 31,5 M Ft; kétütemű kedvezménnyel 30,7 M Ft.",
    url: "https://eladoingatlan.szcenario.hu/",
    images: [
      {
        url: "/hirdetes/og-cover.jpg",
        width: 1024,
        height: 1024,
        alt: "Erdei faház a tölgyesben — Kismaros–Börzsönyliget",
      },
    ],
  },
};

export default function ListingPage() {
  return <PropertyLanding />;
}
