export type ResilienceCaseId =
  | "demo12_resilience_saas_outage"
  | "demo13_resilience_community_grid"
  | "demo14_resilience_home_blackout"
  | "demo15_resilience_demography";

export const RESILIENCE_CASE_IDS: readonly ResilienceCaseId[] = [
  "demo12_resilience_saas_outage",
  "demo13_resilience_community_grid",
  "demo14_resilience_home_blackout",
  "demo15_resilience_demography",
] as const;

export function isResilienceSegment(id: string | null | undefined): id is ResilienceCaseId {
  return RESILIENCE_CASE_IDS.includes(id as ResilienceCaseId);
}

export type ResilienceTone = "opt" | "real" | "pess";

export const RESILIENCE_SEGMENTS: Array<{
  id: ResilienceCaseId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
  projectAlias: string;
  businessAlias: string;
  goalName: string;
  kind: "bcp" | "community" | "household" | "macro";
}> = [
  {
    id: "demo12_resilience_saas_outage",
    name: "DEMO 12 — Vállalati BCP: kritikus SaaS leállás",
    title: "BCP: kritikus SaaS / felhő kiesése",
    blurb: "Operational resilience: redundáns hálózat, local-first másolat, manuális P2P. A TTR a kockázatkezelés mutatója.",
    lead: "A felhő kiesett — fekete hattyú, nem világvége. Tartalék link, helyi offline adatbázis, vagy kézi P2P. A kérdés: mennyi a helyreállási idő, és tartja-e a működés.",
    baseRevenueNetHuf: 6_200_000,
    projectAlias: "Felhőleállás",
    businessAlias: "Üzem / SaaS",
    goalName: "TTR 4 óra alatt — local-first élesítés",
    kind: "bcp",
  },
  {
    id: "demo13_resilience_community_grid",
    name: "DEMO 13 — Kisközösség: víz- és energiahálózat",
    title: "Helyi ellátás és közösségi biztonság",
    blurb: "Decentralizált önfenntartás: víz, energia, LoRa mesh. Korlátozástól 72 órás regionális szünetig.",
    lead: "A településen a víz és az áram akadozik. A lajtoskocsi üteme és a helyi mesh lefedettsége mutatja, meddig tartható a közösség. Ez helyi önfenntartás és közösségi biztonság.",
    baseRevenueNetHuf: 1_800_000,
    projectAlias: "Víz + energia",
    businessAlias: "Kisközösség",
    goalName: "72 óra — víz és LoRa lefedettség",
    kind: "community",
  },
  {
    id: "demo14_resilience_home_blackout",
    name: "DEMO 14 — Háztartás: 72 órás működési tartalék",
    title: "Háztartási működési tartalék — 72 órás kiesés",
    blurb: "Akkumulátor Wh, napelem, készlet napokban. Ugyanaz a motor, mint a vállalati BCP-nél — kisebb lépték.",
    lead: "Hetvenkét órára kiesik a hálózat. Nem bunker: működési tartalék. Akkumulátor, napelem, racionális készlet — a motor ugyanazokat a fizikai korlátokat számolja, mint a céges BCP.",
    baseRevenueNetHuf: 620_000,
    projectAlias: "72 órás tartalék",
    businessAlias: "Háztartás",
    goalName: "72 óra energia + 5 nap készlet",
    kind: "household",
  },
  {
    id: "demo15_resilience_demography",
    name: "DEMO 15 — Strategic foresight: demográfiai pálya",
    title: "Stratégiai előrejelzés — TFR és munkaképes kor",
    blurb: "KR, CN, IT/WE, JP, HU: TFR, rés a 2,1-hez, kezelési pálya. Strukturális trendelemzés, nem riadó.",
    lead: "A születésszám a helyettesítés alatt van. Ez a következő 20 év egyik legnagyobb gazdasági kihívása — kormányzatnak és nagyvállalatnak egyaránt. Öt nemzet TFR-jét hasonlítod össze. Mátrix, nem riadó.",
    baseRevenueNetHuf: 0,
    projectAlias: "TFR mátrix",
    businessAlias: "Nemzeti modell",
    goalName: "TFR pálya — 2,1-es helyettesítés",
    kind: "macro",
  },
];

export function resilienceCaseById(id: ResilienceCaseId) {
  const found = RESILIENCE_SEGMENTS.find((s) => s.id === id);
  if (!found) throw new Error("Ismeretlen reziliencia-eset.");
  return found;
}

export function resilienceSurface(segmentId: ResilienceCaseId) {
  const cse = resilienceCaseById(segmentId);
  const p = (key: string) => `p:${segmentId}:${key}`;
  const d = (key: string) => `d:${segmentId}:${key}`;
  const partners =
    cse.kind === "bcp"
      ? [
          { id: p("cloud"), kind: "supplier", name: "Felhő / SaaS üzemeltető", tax_id: null, payment_term_days: null, note: "Kieső külső függőség." },
          { id: p("isp"), kind: "supplier", name: "Tartalék hálózat / ISP", tax_id: "31313131-2-42", payment_term_days: 14, note: "Redundáns link." },
          { id: p("mesh"), kind: "supplier", name: "P2P / mesh csomópont", tax_id: null, payment_term_days: null, note: "Manuális protokoll." },
        ]
      : cse.kind === "community"
        ? [
            { id: p("water"), kind: "authority", name: "Vízmű / katasztrófavédelem", tax_id: null, payment_term_days: null, note: "Lajtoskocsi-rendelés." },
            { id: p("grid"), kind: "supplier", name: "Elosztói hálózat", tax_id: "32323232-2-13", payment_term_days: 30, note: "Regionális áram." },
            { id: p("lora"), kind: "supplier", name: "LoRa mesh önkéntesek", tax_id: null, payment_term_days: null, note: "Hordozható lefedettség." },
          ]
        : cse.kind === "household"
          ? [
              { id: p("solar"), kind: "supplier", name: "Napelem / inverter", tax_id: null, payment_term_days: 14, note: "Háztartási betáplálás." },
              { id: p("store"), kind: "supplier", name: "Készlet / élelmiszer", tax_id: null, payment_term_days: 0, note: "Racionális tartalék." },
            ]
          : [
              { id: p("stat"), kind: "authority", name: "Statisztikai hivatal (helyi másolat)", tax_id: null, payment_term_days: null, note: "TFR 2023 — nem élő API." },
            ];
  const duties =
    cse.kind === "macro"
      ? [{ id: d("tfr"), name: "TFR-felülvizsgálat (éves)", cadence: "éves", fixed_cost_huf: 0 }]
      : [
          { id: d("drill"), name: "BCP / kiesés-gyakorlat", cadence: "féléves", fixed_cost_huf: 0 },
          { id: d("inv"), name: "Készlet- és energia-leltár", cadence: "negyedéves", fixed_cost_huf: 0 },
        ];
  return { businessAlias: cse.businessAlias, projectAlias: cse.projectAlias, partners, duties };
}

export type PhysicalKpi = {
  id: "resourceRunway" | "energyAutonomy" | "ttr";
  label: string;
  unit: string;
  opt: number;
  real: number;
  pess: number;
  hint: string;
};

export type HourPoint = { hour: number; opt: number; real: number; pess: number };

export type TfrRow = {
  id: string;
  country: string;
  tfr: number;
  year: number;
  source: string;
  gapToReplacement: number;
  strategy: string;
};

export type ResilienceModel = {
  caseId: ResilienceCaseId;
  kind: "bcp" | "community" | "household" | "macro";
  title: string;
  kpis: PhysicalKpi[];
  hours: HourPoint[];
  hourUnit: string;
  hourLabel: string;
  extras: Array<{ label: string; opt: string; real: string; pess: string }>;
  tfrRows: TfrRow[];
  replacementTfr: number;
};

const REPLACEMENT_TFR = 2.1;

/** 2023 közzétett TFR — helyi másolat, nem élő hívás. */
export const TFR_MATRIX: TfrRow[] = [
  {
    id: "kr",
    country: "Dél-Korea",
    tfr: 0.72,
    year: 2023,
    source: "Statistics Korea",
    gapToReplacement: 2.1 - 0.72,
    strategy: "Lakhatás és gyermekfelügyelet költsége; natalista csomagok, késői házasság.",
  },
  {
    id: "cn",
    country: "Kína",
    tfr: 1.0,
    year: 2023,
    source: "NBS",
    gapToReplacement: 2.1 - 1.0,
    strategy: "Háromgyermekes politika, urbanizáció, késleltetett gyermekvállalás.",
  },
  {
    id: "it",
    country: "Nyugat-Európa / Olaszország",
    tfr: 1.2,
    year: 2023,
    source: "ISTAT / Eurostat sáv",
    gapToReplacement: 2.1 - 1.2,
    strategy: "Családi támogatás, migrációs egyenleg, déli régiók alacsonyabb TFR-je.",
  },
  {
    id: "jp",
    country: "Japán",
    tfr: 1.2,
    year: 2023,
    source: "MHLW",
    gapToReplacement: 2.1 - 1.2,
    strategy: "Munkakultúra, óvodai férőhely, vidéki elnéptelenedés.",
  },
  {
    id: "hu",
    country: "Magyarország",
    tfr: 1.51,
    year: 2023,
    source: "KSH",
    gapToReplacement: 2.1 - 1.51,
    strategy: "Otthonteremtési és adókedvezmény; a TFR így is a 2,1 alatt.",
  },
];

function hours72(optStart: number, realStart: number, pessStart: number, optDrain: number, realDrain: number, pessDrain: number): HourPoint[] {
  const out: HourPoint[] = [];
  for (let h = 0; h <= 72; h += 3) {
    out.push({
      hour: h,
      opt: Math.max(0, optStart - optDrain * h),
      real: Math.max(0, realStart - realDrain * h),
      pess: Math.max(0, pessStart - pessDrain * h),
    });
  }
  return out;
}

export function buildResilienceModel(caseId: ResilienceCaseId): ResilienceModel {
  const cse = resilienceCaseById(caseId);

  if (cse.kind === "bcp") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      hourUnit: "óra",
      hourLabel: "Működési tartalék (óra)",
      kpis: [
        {
          id: "ttr",
          label: "TTR — helyreállási idő",
          unit: "óra",
          opt: 0.4,
          real: 3,
          pess: 36,
          hint: "Optimista: redundáns hálózat. Realista: local-first másolat. Pesszimista: manuális P2P.",
        },
        {
          id: "resourceRunway",
          label: "ResourceRunway",
          unit: "óra",
          opt: 72,
          real: 36,
          pess: 8,
          hint: "Mennyi ideig viszi a helyi másolat / tartalék link a kritikus folyamatot.",
        },
        {
          id: "energyAutonomy",
          label: "EnergyAutonomy (UPS)",
          unit: "óra",
          opt: 18,
          real: 8,
          pess: 2,
          hint: "Telephelyi szünetmentes — a felhő kiesése után a helyi node meddig él.",
        },
      ],
      hours: hours72(72, 36, 8, 0.15, 0.55, 1.1),
      extras: [
        { label: "Redundáns hálózat", opt: "automatikus fail-over", real: "kézi átkapcsolás", pess: "nincs tartalék link" },
        { label: "Local-first DB", opt: "meleg másolat", real: "élesítés 3 óra", pess: "nincs szinkron" },
        { label: "Manuális P2P", opt: "nem kell", real: "háttérprotokoll", pess: "egyetlen út, TTR 36 óra" },
      ],
      tfrRows: [],
      replacementTfr: REPLACEMENT_TFR,
    };
  }

  if (cse.kind === "community") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      hourUnit: "óra",
      hourLabel: "Ivóvíz-runway (óra)",
      kpis: [
        {
          id: "resourceRunway",
          label: "ResourceRunway — ivóvíz",
          unit: "óra",
          opt: 96,
          real: 48,
          pess: 18,
          hint: "Lajtoskocsi-ütem és háztartási tartalék. 72 órás regionális szünet a pesszimista ág.",
        },
        {
          id: "energyAutonomy",
          label: "EnergyAutonomy — hálózat",
          unit: "óra",
          opt: 72,
          real: 24,
          pess: 6,
          hint: "Részleges korlátozástól teljes 72 órás áramszünetig.",
        },
        {
          id: "ttr",
          label: "TTR — hálózat + víz",
          unit: "óra",
          opt: 8,
          real: 30,
          pess: 72,
          hint: "Mikor tér vissza a vezetékes szolgáltatás.",
        },
      ],
      hours: hours72(96, 48, 18, 0.4, 0.85, 1.4),
      extras: [
        { label: "Lajtoskocsi", opt: "4 forduló / nap", real: "2 forduló / nap", pess: "1 forduló, későn" },
        { label: "LoRa mesh lefedettség", opt: "82%", real: "46%", pess: "14%" },
        { label: "Áram", opt: "sávos korlátozás", real: "24 óra szünet", pess: "72 óra regionális" },
      ],
      tfrRows: [],
      replacementTfr: REPLACEMENT_TFR,
    };
  }

  if (cse.kind === "household") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      hourUnit: "Wh",
      hourLabel: "Akkumulátor-maradék (Wh)",
      kpis: [
        {
          id: "energyAutonomy",
          label: "EnergyAutonomy",
          unit: "óra",
          opt: 86,
          real: 52,
          pess: 22,
          hint: "5,2 kWh telep + napelem vs. 180–320 W létfontosságú terhelés.",
        },
        {
          id: "resourceRunway",
          label: "ResourceRunway — készlet",
          unit: "nap",
          opt: 9,
          real: 5,
          pess: 2.5,
          hint: "Racionális készletgazdálkodás a családi logisztikában, napokban.",
        },
        {
          id: "ttr",
          label: "TTR — hálózati visszatérés",
          unit: "óra",
          opt: 18,
          real: 48,
          pess: 72,
          hint: "72 órás hálózati kiesés a pesszimista sáv felső széle — BCP-stresszteszt.",
        },
      ],
      hours: hours72(5200, 5200, 3200, 18, 42, 78),
      extras: [
        { label: "Akkumulátor", opt: "5,2 kWh + tartalék", real: "5,2 kWh", pess: "3,2 kWh, hideg" },
        { label: "Napelem betáplálás", opt: "720 W (derült)", real: "280 W (borult)", pess: "40 W (vihar)" },
        { label: "Készlet", opt: "9 nap", real: "5 nap", pess: "2,5 nap" },
      ],
      tfrRows: [],
      replacementTfr: REPLACEMENT_TFR,
    };
  }

  return {
    caseId,
    kind: cse.kind,
    title: cse.title,
    hourUnit: "TFR",
    hourLabel: "TFR a 2,1-es helyettesítéshez",
    kpis: [
      {
        id: "resourceRunway",
        label: "Reprodukciós rés (HU)",
        unit: "TFR",
        opt: 1.8,
        real: 1.51,
        pess: 1.2,
        hint: "Magyar strukturális pálya a 2,1-hez. Nem riadó: a következő 20 év gazdasági kérdése.",
      },
      {
        id: "energyAutonomy",
        label: "Munkaképes korú tartalék",
        unit: "év",
        opt: 28,
        real: 16,
        pess: 9,
        hint: "Hány évig tartható a mai munkaképes arány a TFR-pálya mellett (modell).",
      },
      {
        id: "ttr",
        label: "TTR — TFR 1,8-ig",
        unit: "év",
        opt: 12,
        real: 24,
        pess: 40,
        hint: "Milyen távon közelítene a helyettesítéshez a kezelési pálya.",
      },
    ],
    hours: [],
    extras: [],
    tfrRows: TFR_MATRIX,
    replacementTfr: REPLACEMENT_TFR,
  };
}

export function resilienceEntryWorkspace(id: ResilienceCaseId): "personal" | "Projekt1" {
  return resilienceCaseById(id).kind === "household" ? "personal" : "Projekt1";
}
