/** Nyilvános SEO — helyi-első / böngészős / 2027 Desktop EA. Márka: Szcenárió. */

export const SEO_HOME_TITLE =
  "Szcenárió — Helyi irányító-szimuláció a böngészőben · a számok nálad maradnak";
export const SEO_HOME_DESCRIPTION =
  "Lokális irodai és vállalati irányító-szimuláció a böngészőben. A szimulációs adatok helyben futnak; a fizetés, a számlázás és a support adatai a jogszabályok szerint kezeltek. Mesh Data Manager a gépeden. Basic vagy Pro: asztali early access 2027-ben, ingyen.";
export const SEO_OG_TITLE = "Szcenárió — A számok a gépeden maradnak · a böngésződben";
export const SEO_OG_DESCRIPTION =
  "Szimuláció a böngészőben / helyi tárhelyen. Fizetés, számlázás és support a jogszabályok szerint. Mentés fájllal vagy meghívott vendéggel. Asztali early access 2027 tavaszán, ingyen.";

export type SeoPageId = "home" | "school" | "support" | "pricing" | "gdpr" | "about" | "aszf";

export type SeoPage = {
  path: string;
  origin?: "main" | "school" | "support";
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
};

export const SEO_PAGES: Record<SeoPageId, SeoPage> = {
  home: {
    path: "/",
    origin: "main",
    title: SEO_HOME_TITLE,
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
  school: {
    path: "/",
    origin: "school",
    title: "Szcenárió — Diák / oktatás a böngészőben",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: "Szcenárió — Oktatási csatorna a böngésződben",
    ogDescription: SEO_OG_DESCRIPTION,
  },
  support: {
    path: "/",
    origin: "support",
    title: "Szcenárió — Support · helyi-első, a böngészőben",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
  pricing: {
    path: "/pricing",
    origin: "support",
    title: "Szcenárió — Árazás · Basic és Pro a böngészőben",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
  gdpr: {
    path: "/gdpr",
    origin: "main",
    title: "Szcenárió — GDPR · helyi adat, nincs felhős adatbázis",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
  about: {
    path: "/about",
    origin: "main",
    title: "Szcenárió — Rólunk · helyi-első kontrolling a böngészőben",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
  aszf: {
    path: "/aszf",
    origin: "main",
    title: "Szcenárió — ÁSZF · helyi-első, a böngészőben",
    description: SEO_HOME_DESCRIPTION,
    ogTitle: SEO_OG_TITLE,
    ogDescription: SEO_OG_DESCRIPTION,
  },
};
