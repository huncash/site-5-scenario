"use client";

export type TourAnchorId =
  | "header"
  | "pdca-dial"
  | "view-toggle"
  | "shortcuts"
  | "app-menu"
  | "workspaces"
  | "work-panels"
  | "bottom-tabs";

export type TourVisual = {
  icon: "layout" | "panels" | "tabs" | "dial" | "split" | "keys" | "menu" | "workspace";
  caption: string;
};

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  visuals?: TourVisual[];
  anchors?: TourAnchorId[];
  anchorLabels?: Partial<Record<TourAnchorId, string>>;
};

export const ONBOARDING_TOUR_STEPS: OnboardingStep[] = [
  {
    id: "demo",
    title: "Mintahelyzet",
    body: "Előre betöltött példa. Nem banki kivonat, nem élő ügyféladat.",
    visuals: [
      { icon: "panels", caption: "A számok a böngészőben készülnek." },
      { icon: "menu", caption: "Kilépés: Főmenü → Másik eset." },
    ],
  },
  {
    id: "anatomy",
    title: "Három sáv",
    body: "Felső vezérlés, középen a munka, alul a modulok.",
    visuals: [
      { icon: "layout", caption: "Fent: helyzet és PDCA-tárcsa." },
      { icon: "workspace", caption: "A fülek a munkateret cserélik." },
      { icon: "tabs", caption: "Lent: Cashflow, Tételek, Üzletek, Leltár." },
    ],
    anchors: ["header", "workspaces", "bottom-tabs"],
    anchorLabels: {
      header: "Fent",
      workspaces: "Terek",
      "bottom-tabs": "Modulok",
    },
  },
  {
    id: "pdca",
    title: "PDCA",
    body: "PLAN → DO → CHECK → ACT. Egyszerre legfeljebb két fázis látszik.",
    visuals: [
      { icon: "dial", caption: "A tárcsa a következő fázispárra fordít." },
      { icon: "split", caption: "Osztott / teljes nézet a fejléc kapcsolóján." },
    ],
    anchors: ["pdca-dial", "view-toggle"],
    anchorLabels: {
      "pdca-dial": "Tárcsa",
      "view-toggle": "Nézet",
    },
  },
  {
    id: "welcome-shortcuts",
    title: "Gyorsbillentyűk",
    body: "A billentyűzet-ikon a lista. Mentés: Ctrl/Cmd+S.",
    visuals: [{ icon: "keys", caption: "Alsó fülek: Alt+Shift+←/→ · munkaterek: PageUp/PageDown." }],
    anchors: ["shortcuts"],
  },
  {
    id: "workspaces",
    title: "Munkaterek",
    body: "Magán, vállalkozás és projekt külön könyvelési tér. A felső fülek ezeket cserélik.",
    visuals: [{ icon: "workspace", caption: "A középső panelt a kiválasztott tér tölti." }],
    anchors: ["workspaces"],
    anchorLabels: { workspaces: "Terek" },
  },
  {
    id: "security-close",
    title: "Főmenü",
    body: "A három vonal a főmenü. Mentés, GYIK és kilépés itt van.",
    visuals: [
      { icon: "menu", caption: "Gyors mentés (.json) · GYIK · Másik eset." },
    ],
    anchors: ["app-menu"],
    anchorLabels: { "app-menu": "Menü" },
  },
];
