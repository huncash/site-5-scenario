import { DATA_CONTROLLER } from "@/content/legal";

const c = DATA_CONTROLLER;

export type AszfSection = { title: string; paragraphs: string[] };

export const ASZF_META = {
  hu: {
    title: "Általános Szerződési Feltételek (ÁSZF)",
    lead: "Szcenárió digitális szolgáltatás (SaaS) — B2C és B2B partnerek elhatárolásával.",
    updated: "Hatályos: 2026. október 4.",
  },
  en: {
    title: "Terms of Service (ToS)",
    lead: "Szcenárió digital service (SaaS) — with explicit B2C and B2B partner separation.",
    updated: "Effective: 4 October 2026.",
  },
} as const;

export const ASZF_SECTIONS_HU: AszfSection[] = [
  {
    title: "1. Szolgáltató",
    paragraphs: [
      `${c.legalName} („Szolgáltató”), székhely: ${c.address}, adószám: ${c.taxId}.`,
      `Kapcsolat írásban: ${c.contactChannel}. A szolgáltatás: szcenario.hu — helyi (client-side) szcenárió-modellező szoftverhez való hozzáférés (digitális szolgáltatás / SaaS).`,
    ],
  },
  {
    title: "2. Felhasználók köre (B2C és B2B elhatárolása)",
    paragraphs: [
      "Fogyasztónak minősülő Felhasználó (B2C): az a természetes személy, aki szakmája, önálló foglalkozása vagy üzleti tevékenysége körén kívül jár el, és nem ad meg vállalkozói adószámot a megrendeléshez.",
      "Vállalkozásnak minősülő Felhasználó (B2B): az a jogi személy, egyéni vállalkozó, szervezet, vagy olyan természetes személy, aki adószám megadásával, szakmai vagy üzleti tevékenysége körében köt szerződést.",
      "A partner besorolását a pénztárfolyamatban a Felhasználó választása és az adószám megadása együtt határozza meg. Adószám megadása esetén a szerződés B2B jellegűnek minősül.",
    ],
  },
  {
    title: "3. A szerződés tárgya",
    paragraphs: [
      "A Szolgáltató a választott csomag (Starter / Pro / Expert vagy kampánycsomag) szerinti hozzáférést biztosít a Szcenárió modellező platformhoz. A számítás és a modellezett adatok alapvetően a Felhasználó eszközén futnak (local-first); a számlázási adatok kezelése a GDPR tájékoztató szerint történik.",
    ],
  },
  {
    title: "4. Elállási és felmondási jog",
    paragraphs: [
      "B2C (fogyasztók): A 45/2014. (II. 26.) Korm. rendelet alapján a fogyasztót főszabály szerint 14 napos indoklás nélküli elállási jog illeti meg. Digitális adathordozón nem nyújtott digitális tartalom / szolgáltatás esetén (29. § (1) m) pont) a fogyasztó elveszíti ezt a jogát, ha a teljesítés a fogyasztó kifejezett, előzetes beleegyezésével megkezdődött, és a fogyasztó tudomásul vette, hogy a teljesítés megkezdésével az elállási jogát elveszíti.",
      "A pénztárfolyamatban a B2C vevő kötelező nyilatkozattal kéri a szolgáltatás azonnali megkezdését. A hozzáférés megadásával (aktiválás / belépés) a teljesítés megkezdődik.",
      "B2B (vállalkozások): A Ptk. alapján a vállalkozásnak minősülő vevőket nem illeti meg az indoklás nélküli 14 napos elállási jog. A vásárlás — eltérő, írásbeli megállapodás hiányában — végleges; visszatérítés nem kötelező.",
    ],
  },
  {
    title: "5. Jótállás és kellékszavatosság",
    paragraphs: [
      "B2C: a fogyasztóra a jogszabály szerinti fogyasztóvédelmi és kellékszavatossági szabályok vonatkoznak.",
      "B2B: a Ptk. általános kellékszavatossági szabályai érvényesek; törvényi kötelező jótállás nincs. A szoftver „ahogy van” jellegű hozzáférés. Oktatási és szimulációs célú eszköz; nem minősül pénzügyi, hitel- vagy befektetési tanácsadásnak, hitelközvetítésnek.",
    ],
  },
  {
    title: "6. ÁSZF módosítása",
    paragraphs: [
      "B2C: a fogyasztóra nézve egyoldalú, hátrányos módosítások a tisztességtelen feltételek tilalma szerint korlátozottak; lényeges változásról a Szolgáltató indokolt esetben tájékoztat.",
      "B2B: a felek a Ptk. diszpozitív szabályaitól eltérhetnek; a közzétett ÁSZF a vállalkozási megrendelésekre is irányadó, ha a megrendeléskor elfogadták.",
    ],
  },
  {
    title: "7. Jogviták és békéltető testület",
    paragraphs: [
      "B2C: a fogyasztó jogosult a Pest Vármegyei Békéltető Testülethez fordulni (a Szolgáltató székhelye szerint), továbbá a fogyasztóvédelmi hatósághoz.",
      "B2B: vállalkozások közötti jogvitákban a Szolgáltató székhelye szerint illetékes rendes bíróság jár el; békéltető testületi eljárás fogyasztói jogviszony hiányában nem alkalmazandó.",
    ],
  },
  {
    title: "8. Irányadó jog",
    paragraphs: [
      "A szerződésre a magyar jog, így különösen a Ptk., a 45/2014. (II. 26.) Korm. rendelet (B2C), valamint az uniós fogyasztóvédelmi szabályok irányadók. Az adatkezelésről a /gdpr tájékoztató rendelkezik.",
    ],
  },
];

export const ASZF_SECTIONS_EN: AszfSection[] = [
  {
    title: "1. Provider",
    paragraphs: [
      `${c.legalName} (“Provider”), seat: ${c.address}, tax ID: ${c.taxId}.`,
      `Contact in writing: ${c.contactChannel}. Service: szcenario.hu — access to a local-first (client-side) scenario modelling tool (digital service / SaaS).`,
    ],
  },
  {
    title: "2. Users (B2C vs B2B)",
    paragraphs: [
      "Consumer (B2C): a natural person acting outside their trade, business or profession, who does not provide a business tax ID at checkout.",
      "Business (B2B): a legal entity, sole trader, organisation, or natural person who contracts in a professional/business capacity by providing a tax ID.",
      "Classification follows the checkout choice and tax ID. Providing a tax ID makes the contract B2B.",
    ],
  },
  {
    title: "3. Subject matter",
    paragraphs: [
      "The Provider grants access to the Szcenárió platform under the chosen plan. Modelling runs primarily on the user’s device (local-first); billing data is handled as described in the GDPR notice.",
    ],
  },
  {
    title: "4. Right of withdrawal",
    paragraphs: [
      "B2C: under Hungarian Gov. Decree 45/2014, consumers generally have a 14-day withdrawal right. For digital content/services not supplied on a tangible medium (Art. 29(1)(m)), the consumer loses that right if performance began with their express prior consent and they acknowledged loss of the withdrawal right.",
      "At checkout, B2C buyers must request immediate start of the service. Granting access (activation / login) starts performance.",
      "B2B: under the Civil Code, business buyers have no statutory 14-day no-reason withdrawal right. Unless agreed otherwise in writing, the purchase is final.",
    ],
  },
  {
    title: "5. Warranty",
    paragraphs: [
      "B2C: statutory consumer protection and conformity rules apply.",
      "B2B: general Civil Code conformity rules apply; no mandatory statutory warranty. Access is as-is; modelling is not financial or legal advice.",
    ],
  },
  {
    title: "6. Changes to these terms",
    paragraphs: [
      "B2C: one-sided changes that harm the consumer are limited by unfair-terms rules.",
      "B2B: parties may deviate from default Civil Code rules; published terms apply if accepted at order.",
    ],
  },
  {
    title: "7. Disputes",
    paragraphs: [
      "B2C: the consumer may apply to the Pest County Conciliation Board (provider seat) and consumer-protection authorities.",
      "B2B: disputes go to the ordinary court competent for the Provider’s seat; conciliation boards for consumers do not apply.",
    ],
  },
  {
    title: "8. Governing law",
    paragraphs: [
      "Hungarian law applies, including the Civil Code, Gov. Decree 45/2014 (B2C), and applicable EU consumer rules. Privacy: see /gdpr.",
    ],
  },
];
