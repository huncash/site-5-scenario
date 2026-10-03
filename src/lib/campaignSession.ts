import {
  CAMPAIGN_DOOR_STEP,
  campaignIdFromPath,
  campaignIdFromUtmCampaign,
  defaultUtmForCampaign,
  hasUtm,
  isCampaignId,
  mergeUtm,
  utmFromSearch,
  type CampaignId,
  type CampaignUtm,
} from "@/lib/campaignFunnels";
import { writeScenarioDoorStep } from "@/lib/demoSession";

const ATTR_KEY = "ui:campaignAttribution";

export type CampaignAttribution = {
  id: CampaignId;
  path: string;
  capturedAt: string;
  touch: "path" | "utm";
  utm: CampaignUtm;
};

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readCampaignAttribution(): CampaignAttribution | null {
  const ss = storage();
  if (!ss) return null;
  try {
    const raw = ss.getItem(ATTR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignAttribution;
    if (!isCampaignId(parsed?.id)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function readCampaignId(): CampaignId | null {
  return readCampaignAttribution()?.id ?? null;
}

export function writeCampaignAttribution(next: CampaignAttribution) {
  const ss = storage();
  if (!ss) return;
  try {
    ss.setItem(ATTR_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function enterCampaignChooser(id: CampaignId, utm?: CampaignUtm | null) {
  const prev = readCampaignAttribution();
  const same = prev?.id === id ? prev.utm : null;
  writeCampaignAttribution({
    id,
    path: typeof window !== "undefined" ? window.location.pathname : `/${id}`,
    capturedAt: new Date().toISOString(),
    touch: "path",
    utm: defaultUtmForCampaign(id, mergeUtm(same, utm ?? {})),
  });
  writeScenarioDoorStep(CAMPAIGN_DOOR_STEP[id]);
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("szcenario_home_mode");
    window.dispatchEvent(new Event("szcenario:home_mode"));
  } catch {
    /* ignore */
  }
}

export function captureCampaignFromLocation(opts?: {
  campaignId?: CampaignId;
  doorStep?: boolean;
}) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const search = new URLSearchParams(window.location.search);
  const utm = utmFromSearch(search);
  const fromPath = opts?.campaignId ?? campaignIdFromPath(path);
  const fromUtm = campaignIdFromUtmCampaign(utm.campaign);
  const prev = readCampaignAttribution();
  const onHome = path === "/" || path === "";

  if (fromPath) {
    const same = prev?.id === fromPath ? prev.utm : null;
    writeCampaignAttribution({
      id: fromPath,
      path,
      capturedAt: new Date().toISOString(),
      touch: "path",
      utm: defaultUtmForCampaign(fromPath, mergeUtm(same, utm)),
    });
    if (opts?.doorStep) writeScenarioDoorStep(CAMPAIGN_DOOR_STEP[fromPath]);
    return;
  }

  if (onHome && fromUtm) {
    const same = prev?.id === fromUtm ? prev.utm : null;
    writeCampaignAttribution({
      id: fromUtm,
      path,
      capturedAt: prev?.id === fromUtm ? prev.capturedAt : new Date().toISOString(),
      touch: prev?.id === fromUtm && prev.touch === "path" ? "path" : "utm",
      utm: defaultUtmForCampaign(fromUtm, mergeUtm(same, utm)),
    });
    if (opts?.doorStep !== false) writeScenarioDoorStep(CAMPAIGN_DOOR_STEP[fromUtm]);
    return;
  }

  if (!hasUtm(utm)) return;

  if (fromUtm && !prev) {
    writeCampaignAttribution({
      id: fromUtm,
      path,
      capturedAt: new Date().toISOString(),
      touch: "utm",
      utm: defaultUtmForCampaign(fromUtm, utm),
    });
    return;
  }

  if (prev && hasUtm(utm)) {
    writeCampaignAttribution({
      ...prev,
      utm: mergeUtm(prev.utm, utm),
    });
  }
}
