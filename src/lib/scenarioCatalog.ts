/**
 * Közös szcenárió-fajta katalógus: fő fajta → iparág/zóna → demó esetek.
 * A főoldal (#tipusok) és a login demólista ugyaninnen olvasson.
 */
import {
  groupPublicDemoSegments,
  type DemoCatalogIndustry,
  type DemoCatalogKind,
  type DemoCatalogKindGroup,
} from "@/lib/coreCases";
import type { MessageKey } from "@/i18n";

export type { DemoCatalogIndustry, DemoCatalogKind, DemoCatalogKindGroup };

/** Elérhető fő fajták (van legalább egy nyilvános demó). */
export const AVAILABLE_SCENARIO_KINDS: DemoCatalogKind[] = [
  "economic",
  "resilience",
  "education",
  "inner",
];

/** Későbbi fő fajták — placeholder, még nincs demó tagság. */
export const LATER_SCENARIO_KINDS = ["climate", "political"] as const;
export type LaterScenarioKind = (typeof LATER_SCENARIO_KINDS)[number];

/** Rövid fajtanév (login lista). */
export const SCENARIO_KIND_TITLE_KEY: Record<DemoCatalogKind, MessageKey> = {
  economic: "login.demoKindEconomic",
  resilience: "login.demoKindResilience",
  education: "login.demoKindEducation",
  inner: "login.demoKindInner",
};

/** Főoldali kártyacím (értékesítési). */
export const SCENARIO_KIND_CARD_TITLE_KEY: Record<DemoCatalogKind, MessageKey> = {
  economic: "door.kind.economic.title",
  resilience: "door.kind.resilience.title",
  education: "door.kind.education.title",
  inner: "door.kind.inner.title",
};

export const SCENARIO_KIND_BLURB_KEY: Record<DemoCatalogKind, MessageKey> = {
  economic: "door.kind.economic.blurb",
  resilience: "door.kind.resilience.blurb",
  education: "door.kind.education.blurb",
  inner: "door.kind.inner.blurb",
};

export const SCENARIO_KIND_FOOTER_KEY: Record<DemoCatalogKind, MessageKey> = {
  economic: "door.kind.economic.footer",
  resilience: "door.kind.resilience.footer",
  education: "door.kind.education.footer",
  inner: "door.kind.inner.footer",
};

export const SCENARIO_INDUSTRY_TITLE_KEY: Record<DemoCatalogIndustry, MessageKey> = {
  hospitality: "login.demoIndHospitality",
  healthcare: "login.demoIndHealthcare",
  manufacturing: "login.demoIndManufacturing",
  logistics: "login.demoIndLogistics",
  strategy: "login.demoIndStrategy",
  education: "login.demoIndEducation",
  firmBcp: "login.demoIndFirmBcp",
  community: "login.demoIndCommunity",
  household: "login.demoIndHousehold",
  demography: "login.demoIndDemography",
  personal: "login.demoIndPersonal",
};

export const LATER_KIND_TITLE_KEY: Record<LaterScenarioKind, MessageKey> = {
  climate: "door.type.climate.title",
  political: "door.type.political.title",
};

export const LATER_KIND_BLURB_KEY: Record<LaterScenarioKind, MessageKey> = {
  climate: "door.type.climate.blurb",
  political: "door.type.political.blurb",
};

export const SCENARIO_KIND_ACCENT: Record<DemoCatalogKind, string> = {
  economic: "border-l-sky-400/70",
  resilience: "border-l-rose-400/70",
  education: "border-l-emerald-400/70",
  inner: "border-l-slate-400/70",
};

export function publicScenarioKindGroups(): DemoCatalogKindGroup[] {
  return groupPublicDemoSegments();
}

export function kindGroup(kind: DemoCatalogKind): DemoCatalogKindGroup | undefined {
  return groupPublicDemoSegments().find((g) => g.kind === kind);
}

export function isDemoCatalogKind(v: string): v is DemoCatalogKind {
  return (AVAILABLE_SCENARIO_KINDS as readonly string[]).includes(v);
}
