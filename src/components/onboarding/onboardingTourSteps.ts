"use client";

import type { MessageKey } from "@/i18n";

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

type StepDef = {
  id: string;
  title: MessageKey;
  body?: MessageKey;
  visuals?: Array<{ icon?: TourVisual["icon"]; caption: MessageKey }>;
  anchors?: TourAnchorId[];
  anchorLabels?: Partial<Record<TourAnchorId, MessageKey>>;
};

const STEP_DEFS: StepDef[] = [
  {
    id: "demo",
    title: "tour.demoTitle",
    body: "tour.demoBody",
    visuals: [
      { icon: "panels", caption: "tour.demoV1" },
      { icon: "menu", caption: "tour.demoV2" },
    ],
    anchors: ["situation", "work-panels", "app-menu"],
    anchorLabels: {
      situation: "tour.demoASituation",
      "work-panels": "tour.demoAPanels",
      "app-menu": "tour.demoAMenu",
    },
  },
  {
    id: "anatomy",
    title: "tour.anatomyTitle",
    body: "tour.anatomyBody",
    visuals: [
      { icon: "layout", caption: "tour.anatomyV1" },
      { icon: "workspace", caption: "tour.anatomyV2" },
      { icon: "tabs", caption: "tour.anatomyV3" },
    ],
    anchors: ["situation", "pdca-dial", "workspaces", "bottom-tabs"],
    anchorLabels: {
      situation: "tour.anatomyATop",
      "pdca-dial": "tour.anatomyADial",
      workspaces: "tour.anatomyAWs",
      "bottom-tabs": "tour.anatomyATabs",
    },
  },
  {
    id: "pdca",
    title: "tour.pdcaTitle",
    body: "tour.pdcaBody",
    visuals: [
      { icon: "dial", caption: "tour.pdcaV1" },
      { icon: "split", caption: "tour.pdcaV2" },
    ],
    anchors: ["pdca-dial", "view-toggle"],
    anchorLabels: {
      "pdca-dial": "tour.pdcaADial",
      "view-toggle": "tour.pdcaAView",
    },
  },
  {
    id: "welcome-shortcuts",
    title: "tour.keysTitle",
    visuals: [
      { caption: "tour.keysV1" },
      { caption: "tour.keysV2" },
      { caption: "tour.keysV3" },
      { caption: "tour.keysV4" },
      { caption: "tour.keysV5" },
      { caption: "tour.keysV6" },
    ],
    anchors: ["shortcuts"],
  },
  {
    id: "workspaces",
    title: "tour.wsTitle",
    body: "tour.wsBody",
    visuals: [
      { caption: "tour.wsV1" },
      { caption: "tour.wsV2" },
      { caption: "tour.wsV3" },
    ],
    anchors: ["workspaces"],
    anchorLabels: { workspaces: "tour.wsATabs" },
  },
  {
    id: "security-close",
    title: "tour.menuTitle",
    body: "tour.menuBody",
    visuals: [
      { caption: "tour.menuV1" },
      { caption: "tour.menuV2" },
      { caption: "tour.menuV3" },
    ],
    anchors: ["app-menu"],
    anchorLabels: { "app-menu": "tour.menuAMenu" },
  },
];

export const ONBOARDING_TOUR_STEP_IDS = STEP_DEFS.map((s) => s.id);

export function onboardingTourSteps(t: (key: MessageKey) => string): OnboardingStep[] {
  return STEP_DEFS.map((s) => ({
    id: s.id,
    title: t(s.title),
    body: s.body ? t(s.body) : "",
    visuals: s.visuals?.map((v) => ({ icon: v.icon, caption: t(v.caption) })),
    anchors: s.anchors,
    anchorLabels: s.anchorLabels
      ? Object.fromEntries(
          Object.entries(s.anchorLabels).map(([k, key]) => [k, t(key)]),
        ) as Partial<Record<TourAnchorId, string>>
      : undefined,
  }));
}

/** HU fallback — length / ids only. Copy comes from onboardingTourSteps(t). */
export const ONBOARDING_TOUR_STEPS: OnboardingStep[] = onboardingTourSteps((key) => key);
