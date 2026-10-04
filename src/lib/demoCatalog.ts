import { MASTER_BASELINE } from "@/lib/masterBaseline";
import { filterPublicCases } from "@/lib/private/publicCaseFilter";

export const DEMO_PASSWORD = "demo";

export const BASE_CASE_IDS = [
  "demo1_multisite_operator",
  "demo2_premium_nightlife",
  "demo3_specialty_cafe_tea",
  "demo4_fine_dining_bistro",
  "demo5_pastry_gelato",
  "demo6_event_catering_popup",
  "demo18_personal_pocket_seasonal_pilot",
] as const;

export const LENS_CASE_IDS = [
  "demo7_industry_hospital_blackout",
  "demo8_industry_supply_shock",
  "demo9_industry_poka_recall",
  "demo10_industry_wms_outage",
  "demo11_strategy_kahn_fork",
  "demo12_resilience_saas_outage",
  "demo13_resilience_community_grid",
  "demo14_resilience_home_blackout",
  "demo15_resilience_demography",
  "demo16_edu_startup_cashflow",
  "demo17_edu_ops_process",
] as const;

/** Nyilvános mag: DEMO 1…18 folytonos sorrend (base 1–6 → lens 7–17 → base személyes 18). */
export const CORE_CASE_IDS = [
  "demo1_multisite_operator",
  "demo2_premium_nightlife",
  "demo3_specialty_cafe_tea",
  "demo4_fine_dining_bistro",
  "demo5_pastry_gelato",
  "demo6_event_catering_popup",
  ...LENS_CASE_IDS,
  "demo18_personal_pocket_seasonal_pilot",
] as const;
export const KAHN_SEGMENT_ID = "demo11_strategy_kahn_fork" as const;

/** Seed-only leftovers from the 26-pack. Not listed on the public door. */
export const HIDDEN_CASE_IDS = [
  "demo19_strategy_new_line",
  "demo20_strategy_input_inflation",
  "demo21_strategy_new_market",
  "demo22_edu_campus_energy",
  "demo23_edu_cyber_incident",
  "demo24_industry_fuel_crisis",
  "demo25_industry_tax_shock",
  "demo26_industry_saas_exit",
] as const;

export type BaseCaseId = (typeof BASE_CASE_IDS)[number];
export type LensCaseId = (typeof LENS_CASE_IDS)[number];
export type CoreCaseId = (typeof CORE_CASE_IDS)[number];
export type HiddenCaseId = (typeof HIDDEN_CASE_IDS)[number];
export type DemoSegmentId = CoreCaseId | HiddenCaseId;

export type DemoSegmentMeta = {
  id: DemoSegmentId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
  /** Ha true, soha nem jelenik meg publikus listában / ajtón. */
  isPrivate?: boolean;
};

export const HOSPITALITY_SEGMENTS: DemoSegmentMeta[] = [
  {
    id: "demo1_multisite_operator",
    name: "DEMO 1 — Láncvezető / multi‑site HoReCa operátor",
    title: "Több vendéglátóhely egy kézben",
    blurb: "Három–nyolc egység, közös beszerzés. A kérdés: a költséget központosítod-e, vagy egységenként hagyod.",
    lead: "Több étterem vagy kávézó van egy kézben. A forgalom megvan, a beszerzés és a hatósági teher viszont szétszóródik. A költséget egy helyre húzni, vagy egységenként hagyni olcsóbb?",
    baseRevenueNetHuf: 18_000_000,
  },
  {
    id: "demo2_premium_nightlife",
    name: "DEMO 2 — Premium cocktail bar & high‑end nightlife",
    title: "Éjszakai bár, magas vendégköltés",
    blurb: "Kevesebb vendég, magas esti számla, drága üzem. A kérdés: a hétvége kitartja-e a gyengébb hónapokat.",
    lead: "Kevesen jönnek, de sokat költenek. A hétvége viszi a hetet. A személyzetet és a biztonságot akkor is ki kell fizetni, ha hétköznap csend van; a drága készlet a polcon vár, a pénz addig nem forog. Kitartja-e a magas vendégköltés a gyengébb hónapokat?",
    baseRevenueNetHuf: 7_800_000,
  },
  {
    id: "demo3_specialty_cafe_tea",
    name: "DEMO 3 — Specialty kávézó & újhullámos teázó",
    title: "Nappali kávézó, változó kereslet",
    blurb: "Stabil nappali forgalom; nő a tej-, cukor- és gluténmentes igény. A kérdés: trendet látsz-e, vagy csak zajt.",
    lead: "A nappali forgalom egyenletes, a vendég viszont egyre gyakrabban kér állati tej-, cukor- vagy gluténmentes italt és ételt. Tartós eltolódás ez a rendelésben, vagy csak átmeneti hullám?",
    baseRevenueNetHuf: 6_000_000,
  },
  {
    id: "demo4_fine_dining_bistro",
    name: "DEMO 4 — Fine dining & bisztró éttermek",
    title: "Étterem: minőség és költség",
    blurb: "Magasabb árfekvés, szigorú konyhai rutin. A kérdés: hol csúszik el a fedezet.",
    lead: "A minőséghez drága alapanyag és szigorú konyhai rend kell. Fedezi-e a számla ezt a költséget, vagy valamelyik tételen elfogy a haszon?",
    baseRevenueNetHuf: 11_000_000,
  },
  {
    id: "demo5_pastry_gelato",
    name: "DEMO 5 — Kézműves cukrászda & fagylaltmanufaktúra",
    title: "Cukrászda: szezon és hűtés",
    blurb: "Cukrászda és fagylalt; a tél csendes. A kérdés: a holtszezon mit visz el.",
    lead: "Nyáron megy, télen visszaesik, a hűtés viszont egész évben megy. Mennyit visznek el a csendes hónapok a nyári többletből?",
    baseRevenueNetHuf: 4_900_000,
  },
  {
    id: "demo6_event_catering_popup",
    name: "DEMO 6 — Event catering & pop‑up gasztro‑klubok",
    title: "Rendezvényes vendéglátás",
    blurb: "Catering és alkalmi kitelepülés, hullámzó bevétel. A kérdés: egy rendezvény viszi-e a hónapot.",
    lead: "A bevétel hullámzik. A logisztika és a személyzet egy-egy estére ugrik meg. Kitartja-e egy nagyobb megbízás a hónapot, vagy utána lyuk marad?",
    baseRevenueNetHuf: 9_000_000,
  },
  {
    id: "demo18_personal_pocket_seasonal_pilot",
    name: "DEMO 18 — Magán zsebből induló szezonális pilot vendéglátás",
    title: "Saját zsebből indított vendéglátás",
    blurb: "Magán jövedelem és kis plusz, tagi kölcsön. Példa a növekedésre, nem ajánlat.",
    lead: "Valaki a saját fizetéséből indít egy kis vendéglátást, és a cégnek tagi kölcsönt ad. A magánkeret és a céges működés egymást húzza. Ez példa, nem ajánlat.",
    baseRevenueNetHuf: 2_900_000,
  },
];

export const PUBLIC_LENS_SEGMENTS: DemoSegmentMeta[] = [
  {
    id: "demo7_industry_hospital_blackout",
    name: "DEMO 7 — Kórházi blackout / Lean triázs",
    title: "Kórházi vészhelyzeti kapacitás és energia",
    blurb: "Hálózati kiesés. UPS, dízel, ICU / műtő / inkubátor. Lean triázs a szűkös kW-on.",
    lead: "A külső hálózat kiesett. A létfontosságú osztályok a tartalék áramon osztoznak. Te osztod a kW-ot — a motor a betegtúlélést és az üzemanyag-runwayt számolja.",
    baseRevenueNetHuf: 0,
  },
  {
    id: "demo8_industry_supply_shock",
    name: "DEMO 8 — Kritikus beszállító kiesése",
    title: "Supply chain shock — alkatrész / alapanyag",
    blurb: "Egyedi komponens lánca megszakad. Helyettesítő + SMED, vagy a sor áll. OEE lyuk.",
    lead: "A speciális alkatrész nem jön. Alternatív technológia vagy helyettesítő anyag. A kérdés: mennyi az átállás, és mennyit esik az OEE.",
    baseRevenueNetHuf: 18_400_000,
  },
  {
    id: "demo9_industry_poka_recall",
    name: "DEMO 9 — Poka-Yoke audit / selejt-visszafogás",
    title: "Minőségbiztosítási vészhelyzet",
    blurb: "Rejtett sorozathiba, visszahívás. Tétel-elhatárolás, gyökérok, folyamatba épített poka.",
    lead: "A késztermék-soron rejtett hiba fut. Elhatárolod a tételt, feltárod a gyökérokot, vagy hajtasz tovább. A motor a selejt és a visszahívás költségét számolja.",
    baseRevenueNetHuf: 14_200_000,
  },
  {
    id: "demo10_industry_wms_outage",
    name: "DEMO 10 — Cross-dock WMS kiesés",
    title: "Regionális elosztóközpont — IT-kiesés",
    blurb: "WMS sötét. Papír- és vonalkód-komissiózás. Lead time és torlódás.",
    lead: "A raktárirányítás elérhetetlen. Manuális, papír- és vonalkód-alapú BCP. A kérdés: mennyit nő az átfutás, és hol torlódik a dokk.",
    baseRevenueNetHuf: 9_600_000,
  },
  {
    id: "demo11_strategy_kahn_fork",
    name: "DEMO 11 — Bisztró bővítés & magánvagyon-kockázat",
    title: "Bisztró bővítés & magánvagyon-kockázat szimuláció",
    blurb:
      "Vendéglátóipari kapacitás-elágazás, hitelek, magán ingatlanfedezet és adósságkezelés egyetlen integrált modellben.",
    lead:
      "Működő melegkonyhás bisztró elérte a kapacitásplafont. A tulajdonos lakására jelzálog/hitelkeret van. A-opció: terasz és konyha külső hitelből. B-opció: magán adósságrendezés és mérsékelt organikus fejlesztés. Először a pesszimista (Stop-Loss) ágat nézd.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
  },
  {
    id: "demo12_resilience_saas_outage",
    name: "DEMO 12 — Vállalati BCP: kritikus SaaS leállás",
    title: "BCP: kritikus SaaS / felhő kiesése",
    blurb: "Operational resilience: redundáns hálózat, local-first másolat, manuális P2P. A TTR a kockázatkezelés mutatója.",
    lead: "A felhő kiesett — fekete hattyú, nem világvége. Tartalék link, helyi offline adatbázis, vagy kézi P2P. A kérdés: mennyi a helyreállási idő, és tartja-e a működés.",
    baseRevenueNetHuf: 6_200_000,
  },
  {
    id: "demo13_resilience_community_grid",
    name: "DEMO 13 — Kisközösség: víz- és energiahálózat",
    title: "Helyi ellátás és közösségi biztonság",
    blurb: "Decentralizált önfenntartás: víz, energia, LoRa mesh. Korlátozástól 72 órás regionális szünetig.",
    lead: "A településen a víz és az áram akadozik. A lajtoskocsi üteme és a helyi mesh lefedettsége mutatja, meddig tartható a közösség. Ez helyi önfenntartás és közösségi biztonság.",
    baseRevenueNetHuf: 1_800_000,
  },
  {
    id: "demo14_resilience_home_blackout",
    name: "DEMO 14 — Háztartás: 72 órás működési tartalék",
    title: "Háztartási működési tartalék — 72 órás kiesés",
    blurb: "Akkumulátor Wh, napelem, készlet napokban. Ugyanaz a motor, mint a vállalati BCP-nél — kisebb lépték.",
    lead: "Hetvenkét órára kiesik a hálózat. Nem bunker: működési tartalék. Akkumulátor, napelem, racionális készlet — a motor ugyanazokat a fizikai korlátokat számolja, mint a céges BCP.",
    baseRevenueNetHuf: 620_000,
  },
  {
    id: "demo15_resilience_demography",
    name: "DEMO 15 — Strategic foresight: demográfiai pálya",
    title: "Stratégiai előrejelzés — TFR és munkaképes kor",
    blurb: "KR, CN, IT/WE, JP, HU: TFR, rés a 2,1-hez, kezelési pálya. Strukturális trendelemzés, nem riadó.",
    lead: "A születésszám a helyettesítés alatt van. Ez a következő 20 év egyik legnagyobb gazdasági kihívása — kormányzatnak és nagyvállalatnak egyaránt. Öt nemzet TFR-jét hasonlítod össze. Mátrix, nem riadó.",
    baseRevenueNetHuf: 0,
  },
  {
    id: "demo16_edu_startup_cashflow",
    name: "DEMO 16 — Startup cash-flow (diákoknak)",
    title: "Startup pénzügyi tervezés és cash-flow",
    blurb: "Fix tőke, marketing / fejlesztés / bér. Késleltetett piac, PRO sáv, Poka-Yoke tartalék.",
    lead: "Virtuális induló cég fix tőkével. Te osztod a keretet. A motor a múltbeli szórással szimulálja a piacot — a döntés késve hat.",
    baseRevenueNetHuf: 420_000,
  },
  {
    id: "demo17_edu_ops_process",
    name: "DEMO 17 — Működő folyamatok veszteségmentesítése",
    title: "Működő folyamatok veszteségmentesítése és kapacitásbővítése",
    blurb:
      "Meglévő sor / műhely: muda-audit, OEE és átfutás. Kis CapEx Quick Win → azonnali cash-flow és árrésjavulás.",
    lead:
      "Egy már futó tanműhely / kis sor. A működési audit a várakozást, selejtet és átállást vágja; SMED és Poka-Yoke pontok az átfutást és a kapacitást bővítik — a kiesés óradíja forintban is megvan.",
    baseRevenueNetHuf: 2_400_000,
  },
];

/** Nyilvános 18: DEMO 1…18 folytonos sorrend (vendéglátás 1–6 → lencsék 7–17 → személyes 18). */
export const PUBLIC_DEMO_SEGMENTS: DemoSegmentMeta[] = [
  ...HOSPITALITY_SEGMENTS.filter((s) => s.id !== "demo18_personal_pocket_seasonal_pilot"),
  ...PUBLIC_LENS_SEGMENTS,
  ...HOSPITALITY_SEGMENTS.filter((s) => s.id === "demo18_personal_pocket_seasonal_pilot"),
];

export function demoSerialFromId(id: string | null | undefined): number | null {
  const m = String(id ?? "").match(/^demo(\d+)_/);
  return m ? Number(m[1]) : null;
}

const PUBLIC_BY_ID = new Map(PUBLIC_DEMO_SEGMENTS.map((s) => [s.id, s]));
const CORE_SET = new Set<string>(CORE_CASE_IDS);

export function isCoreCaseId(id: string | null | undefined): id is CoreCaseId {
  return Boolean(id && CORE_SET.has(id));
}

export function isDemoSegmentId(id: string | null | undefined): id is DemoSegmentId {
  return isCoreCaseId(id) || (HIDDEN_CASE_IDS as readonly string[]).includes(id ?? "");
}

export function publicSegmentById(id: string | null | undefined): DemoSegmentMeta | undefined {
  if (!id) return undefined;
  return PUBLIC_BY_ID.get(id as DemoSegmentId);
}

export function publicDemoSegments(): DemoSegmentMeta[] {
  return filterPublicCases(PUBLIC_DEMO_SEGMENTS);
}
