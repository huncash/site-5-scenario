import type { ScenarioDoorStep } from "@/lib/doorStep";
import { parseLangSearch, type LangSearch } from "@/lib/langSearch";

export const CAMPAIGN_IDS = ["bcp", "strategia", "kozosseg", "oktatas", "makro"] as const;
export type CampaignId = (typeof CAMPAIGN_IDS)[number];

export type CampaignUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

export type CampaignSearch = LangSearch & {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const UTM_ALIASES: Record<string, CampaignId> = {
  bcp: "bcp",
  continuity: "bcp",
  resilience: "bcp",
  strategia: "strategia",
  "what-if": "strategia",
  whatif: "strategia",
  what_if: "strategia",
  kozosseg: "kozosseg",
  community: "kozosseg",
  offgrid: "kozosseg",
  "off-grid": "kozosseg",
  oktatas: "oktatas",
  education: "oktatas",
  training: "oktatas",
  makro: "makro",
  macro: "makro",
  tfr: "makro",
  demography: "makro",
};

export const CAMPAIGN_PATHS: Record<CampaignId, `/${CampaignId}`> = {
  bcp: "/bcp",
  strategia: "/strategia",
  kozosseg: "/kozosseg",
  oktatas: "/oktatas",
  makro: "/makro",
};

export const CAMPAIGN_DOOR_STEP: Record<CampaignId, ScenarioDoorStep> = {
  bcp: "resilience",
  strategia: "strategy",
  kozosseg: "resilience",
  oktatas: "education",
  makro: "resilience",
};

export const CAMPAIGN_SEGMENT_IDS: Record<CampaignId, readonly string[]> = {
  bcp: ["demo12_resilience_saas_outage"],
  strategia: ["demo11_strategy_kahn_fork"],
  kozosseg: ["demo13_resilience_community_grid", "demo14_resilience_home_blackout"],
  oktatas: ["demo16_edu_startup_cashflow", "demo17_edu_ops_process"],
  makro: ["demo15_resilience_demography"],
};

export function isCampaignId(value: unknown): value is CampaignId {
  return CAMPAIGN_IDS.includes(value as CampaignId);
}

export function normalizePath(path: string): string {
  const raw = String(path ?? "").split("?")[0]!.split("#")[0]!;
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed || "/";
}

export function campaignIdFromPath(path: string): CampaignId | null {
  const p = normalizePath(path);
  if (p === "/bcp") return "bcp";
  if (p === "/strategia") return "strategia";
  if (p === "/kozosseg") return "kozosseg";
  if (p === "/oktatas") return "oktatas";
  if (p === "/makro") return "makro";
  return null;
}

export function campaignIdFromUtmCampaign(raw: string | null | undefined): CampaignId | null {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!v) return null;
  if (UTM_ALIASES[v]) return UTM_ALIASES[v]!;
  const m = v.match(/(?:^|[-_/])(bcp|strategia|kozosseg|oktatas|makro)$/);
  return m && isCampaignId(m[1]) ? m[1] : null;
}

export function optSearchStr(value: unknown): string | undefined {
  const t = typeof value === "string" ? value.trim() : "";
  return t ? t : undefined;
}

export function campaignSearchFromUnknown(s: Record<string, unknown>): CampaignSearch {
  return {
    ...parseLangSearch(s),
    utm_source: optSearchStr(s.utm_source),
    utm_medium: optSearchStr(s.utm_medium),
    utm_campaign: optSearchStr(s.utm_campaign),
    utm_content: optSearchStr(s.utm_content),
    utm_term: optSearchStr(s.utm_term),
  };
}

export function utmFromSearch(search: CampaignSearch | URLSearchParams): CampaignUtm {
  if (search instanceof URLSearchParams) {
    return {
      source: optSearchStr(search.get("utm_source")),
      medium: optSearchStr(search.get("utm_medium")),
      campaign: optSearchStr(search.get("utm_campaign")),
      content: optSearchStr(search.get("utm_content")),
      term: optSearchStr(search.get("utm_term")),
    };
  }
  return {
    source: search.utm_source,
    medium: search.utm_medium,
    campaign: search.utm_campaign,
    content: search.utm_content,
    term: search.utm_term,
  };
}

export function hasUtm(utm: CampaignUtm | null | undefined): boolean {
  return Boolean(utm?.source || utm?.medium || utm?.campaign || utm?.content || utm?.term);
}

export function defaultUtmForCampaign(id: CampaignId, utm?: CampaignUtm | null): CampaignUtm {
  return {
    source: utm?.source || "direct",
    medium: utm?.medium || "landing",
    campaign: utm?.campaign || id,
    content: utm?.content,
    term: utm?.term,
  };
}

export function mergeUtm(base: CampaignUtm | null | undefined, next: CampaignUtm): CampaignUtm {
  return {
    source: next.source || base?.source,
    medium: next.medium || base?.medium,
    campaign: next.campaign || base?.campaign,
    content: next.content || base?.content,
    term: next.term || base?.term,
  };
}

export function filterByCampaign<T extends { id: string }>(
  rows: readonly T[],
  campaignId: CampaignId | null | undefined,
): T[] {
  if (!campaignId) return [...rows];
  const ids = new Set(CAMPAIGN_SEGMENT_IDS[campaignId]);
  const next = rows.filter((row) => ids.has(row.id));
  return next.length ? next : [...rows];
}

export function applyAttributionSearchParams(
  url: URL,
  attr: { id?: CampaignId | null; utm?: CampaignUtm | null },
  opts?: { ref?: string },
) {
  if (opts?.ref) url.searchParams.set("ref", opts.ref);
  else if (attr.id) url.searchParams.set("ref", `kampany-${attr.id}`);

  const utm = attr.utm;
  if (utm?.source) url.searchParams.set("utm_source", utm.source);
  if (utm?.medium) url.searchParams.set("utm_medium", utm.medium);
  if (utm?.campaign) url.searchParams.set("utm_campaign", utm.campaign);
  if (utm?.content) url.searchParams.set("utm_content", utm.content);
  if (utm?.term) url.searchParams.set("utm_term", utm.term);
  if (!url.searchParams.get("utm_campaign") && attr.id) {
    url.searchParams.set("utm_campaign", attr.id);
  }
}
