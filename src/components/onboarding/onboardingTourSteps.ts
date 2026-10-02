"use client";

export type TourAnchorId =
  | "header"
  | "situation"
  | "pdca-dial"
  | "view-toggle"
  | "shortcuts"
  | "app-menu"
  | "workspaces"
  | "work-panels"
  | "bottom-tabs";

export type TourVisual = {
  icon?: "layout" | "panels" | "tabs" | "dial" | "split" | "keys" | "menu" | "workspace";
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
    anchors: ["situation", "work-panels", "app-menu"],
    anchorLabels: {
      situation: "Helyzet",
      "work-panels": "Számok",
      "app-menu": "Menü",
    },
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
    anchors: ["situation", "pdca-dial", "workspaces", "bottom-tabs"],
    anchorLabels: {
      situation: "Fent",
      "pdca-dial": "Tárcsa",
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
    body: "",
    visuals: [
      { caption: "Mentés: Ctrl/Cmd+S" },
      { caption: "Lean kereső: Ctrl/Cmd+K" },
      { caption: "Szumma: Alt+Shift+End" },
      { caption: "Alsó fülek: Alt+Shift+←/→" },
      { caption: "Munkaterek: PageUp/PageDown" },
      { caption: "PDCA forgatás: ↓" },
    ],
    anchors: ["shortcuts"],
  },
  {
    id: "workspaces",
    title: "Munkaterek",
    body: "Fent a fülek: Magán, vállalkozás, projekt. Ami ki van választva, arra számol a középső rész.",
    visuals: [
      { caption: "Magán — saját kassza, nem a cégé." },
      { caption: "Vállalkozás / projekt — a helyzet üzleti számai." },
      { caption: "A + új teret nyit, a számokat nem keveri." },
    ],
    anchors: ["workspaces"],
    anchorLabels: { workspaces: "Fülek" },
  },
  {
    id: "security-close",
    title: "Menü",
    body: "Jobb fent. Innen mentesz, segítséget kérsz, vagy kilépsz a helyzetből.",
    visuals: [
      { caption: "Gyors mentés — a fájl a gépeden marad." },
      { caption: "Tudásbázis / GYIK — ha elakadtál." },
      { caption: "Másik eset — vissza a kapuhoz, ez bezárul." },
    ],
    anchors: ["app-menu"],
    anchorLabels: { "app-menu": "Menü" },
  },
];
