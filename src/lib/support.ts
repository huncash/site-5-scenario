import { readClientLocale } from "@/i18n/locale";

export const SUPPORT_ORIGIN_PROD = "https://support.szcenario.hu";
export const SUPPORT_MAIL = "support@szcenario.hu";
export const SUPPORT_SLA =
  "Átlagos válaszadási idő: 24 órán belül, kizárólag írásban a pontosabb és gyorsabb ügyintézés érdekében.";

export type SupportLayer = "tippek" | "gyik" | "ticket";

export function supportPublicOrigin(): string {
  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    return "http://localhost:5120";
  }
  return SUPPORT_ORIGIN_PROD;
}

export function supportEmbedUrl(slug: string): string {
  const clean = slug.replace(/^\/+/, "");
  const path = clean.startsWith("embed/") ? `/${clean}` : `/embed/${clean}`;
  const url = new URL(`${supportPublicOrigin()}${path}`);
  url.searchParams.set("lang", readClientLocale());
  return url.toString();
}

export const SUPPORT_LAYER_SLUG: Record<SupportLayer, string> = {
  tippek: "tippek",
  gyik: "gyik",
  ticket: "ticket",
};

export const ONBOARDING_EMBED_SLUG: Record<string, string> = {
  demo: "lecke-01",
  anatomy: "lecke-02",
  pdca: "lecke-03",
  "welcome-shortcuts": "lecke-04",
  workspaces: "lecke-05",
  "security-close": "lecke-06",
};
