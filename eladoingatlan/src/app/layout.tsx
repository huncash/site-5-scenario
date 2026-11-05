import type { Metadata } from "next";

import "./globals.css";
import "./listing-fonts.css";

export const metadata: Metadata = {
  title: {
    default: "Erdei faház Börzsönyligeten — 1046 m² privát telek",
    template: "%s · eladoingatlan.szcenario.hu",
  },
  description:
    "Kismaros-Börzsönyliget, zsákutca vége. 1046 m² belterületi Lke-4 telek faházzal. Közvetlenül a tulajdonostól.",
  icons: {
    icon: [
      { url: "/hirdetes/favicon.ico", sizes: "any" },
      { url: "/hirdetes/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/hirdetes/favicon-48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/hirdetes/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <meta name="theme-color" content="#14221b" />
      </head>
      <body className="listing-root antialiased">
        {children}
      </body>
    </html>
  );
}
