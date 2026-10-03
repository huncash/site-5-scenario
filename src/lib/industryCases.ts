import { MASTER_BASELINE } from "@/lib/masterBaseline";
import type { NarrativeChoice, NarrativeClimax, NarrativeStory, NarrativeTone } from "@/lib/strategyNarrative";

export type IndustryCaseId =
  | "demo7_industry_hospital_blackout"
  | "demo8_industry_supply_shock"
  | "demo9_industry_poka_recall"
  | "demo10_industry_wms_outage"
  | "demo24_industry_fuel_crisis"
  | "demo25_industry_tax_shock"
  | "demo26_industry_saas_exit";

export const INDUSTRY_CASE_IDS: readonly IndustryCaseId[] = [
  "demo7_industry_hospital_blackout",
  "demo8_industry_supply_shock",
  "demo9_industry_poka_recall",
  "demo10_industry_wms_outage",
  "demo24_industry_fuel_crisis",
  "demo25_industry_tax_shock",
  "demo26_industry_saas_exit",
] as const;

export type IndustryKind = "hospital" | "supply" | "quality" | "wms" | "fuel" | "tax" | "saas";
export type IndustryDoor = "healthcare" | "manufacturing" | "logistics" | "services";

export function isIndustrySegment(id: string | null | undefined): id is IndustryCaseId {
  return INDUSTRY_CASE_IDS.includes(id as IndustryCaseId);
}

export const INDUSTRY_SEGMENTS: Array<{
  id: IndustryCaseId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
  projectAlias: string;
  businessAlias: string;
  goalName: string;
  kind: IndustryKind;
  door: IndustryDoor;
}> = [
  {
    id: "demo7_industry_hospital_blackout",
    name: "DEMO 7 — Kórházi blackout / Lean triázs",
    title: "Kórházi vészhelyzeti kapacitás és energia",
    blurb: "Hálózati kiesés. UPS, dízel, ICU / műtő / inkubátor. Lean triázs a szűkös kW-on.",
    lead: "A külső hálózat kiesett. A létfontosságú osztályok a tartalék áramon osztoznak. Te osztod a kW-ot — a motor a betegtúlélést és az üzemanyag-runwayt számolja.",
    baseRevenueNetHuf: 0,
    projectAlias: "Blackout / triázs",
    businessAlias: "Regionális kórház",
    goalName: "ICU + NICU tartva 12 órán",
    kind: "hospital",
    door: "healthcare",
  },
  {
    id: "demo8_industry_supply_shock",
    name: "DEMO 8 — Kritikus beszállító kiesése",
    title: "Supply chain shock — alkatrész / alapanyag",
    blurb: "Egyedi komponens lánca megszakad. Helyettesítő + SMED, vagy a sor áll. OEE lyuk.",
    lead: "A speciális alkatrész nem jön. Alternatív technológia vagy helyettesítő anyag. A kérdés: mennyi az átállás, és mennyit esik az OEE.",
    baseRevenueNetHuf: 18_400_000,
    projectAlias: "Beszállítói sokk",
    businessAlias: "Gyártósor / alkatrész",
    goalName: "OEE −8 pontról vissza 6 óra SMED alatt",
    kind: "supply",
    door: "manufacturing",
  },
  {
    id: "demo9_industry_poka_recall",
    name: "DEMO 9 — Poka-Yoke audit / selejt-visszafogás",
    title: "Minőségbiztosítási vészhelyzet",
    blurb: "Rejtett sorozathiba, visszahívás. Tétel-elhatárolás, gyökérok, folyamatba épített poka.",
    lead: "A késztermék-soron rejtett hiba fut. Elhatárolod a tételt, feltárod a gyökérokot, vagy hajtasz tovább. A motor a selejt és a visszahívás költségét számolja.",
    baseRevenueNetHuf: 14_200_000,
    projectAlias: "Selejtvisszafogás",
    businessAlias: "Késztermék-sor",
    goalName: "Hibás tétel 1 műszak alatt elhatárolva",
    kind: "quality",
    door: "manufacturing",
  },
  {
    id: "demo10_industry_wms_outage",
    name: "DEMO 10 — Cross-dock WMS kiesés",
    title: "Regionális elosztóközpont — IT-kiesés",
    blurb: "WMS sötét. Papír- és vonalkód-komissiózás. Lead time és torlódás.",
    lead: "A raktárirányítás elérhetetlen. Manuális, papír- és vonalkód-alapú BCP. A kérdés: mennyit nő az átfutás, és hol torlódik a dokk.",
    baseRevenueNetHuf: 9_600_000,
    projectAlias: "WMS-kiesés",
    businessAlias: "Cross-dock központ",
    goalName: "Lead time ×2 alatt, dokk nem áll",
    kind: "wms",
    door: "logistics",
  },
  {
    id: "demo24_industry_fuel_crisis",
    name: "DEMO 24 — Üzemanyagár és fuvardíj-válság",
    title: "Üzemanyagár-volatilitás / fuvardíj",
    blurb: "Drasztikus dízelugrás vagy útzár. Útvonal, kihasználtság, járatsűrűség — muda a üres km-en.",
    lead: "Az üzemanyag hirtelen drágul. Újraszervezed a járatokat, emeled a fuvardíjat, vagy viszed a lyukat. A motor a kihasználtságot és a cash-t számolja.",
    baseRevenueNetHuf: 11_200_000,
    projectAlias: "Fuvardíj-válság",
    businessAlias: "Flotta / disztribúció",
    goalName: "Üres km −20% + likviditás 60 nap",
    kind: "fuel",
    door: "logistics",
  },
  {
    id: "demo25_industry_tax_shock",
    name: "DEMO 25 — Jogszabály / adókörnyezet-sokk",
    title: "Váratlan adónem-módosítás",
    blurb: "Azonnali árrés-lyuk. Cash-flow hatás + Lean muda-csökkentés a likviditásért.",
    lead: "Egy törvénymódosítás felborítja az árrést. Muda-írtás, áthárítás, vagy a puffer viszi. A core törzs adott — itt csak a teher rétege mozog.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Adósokk",
    businessAlias: MASTER_BASELINE.businessAlias,
    goalName: "Likviditás 60 nap — muda a változón",
    kind: "tax",
    door: "services",
  },
  {
    id: "demo26_industry_saas_exit",
    name: "DEMO 26 — SaaS megszűnés / áremelés",
    title: "Kritikus SaaS megszűnése vagy áremelése",
    blurb: "A felhős szolgáltató kiesik vagy drágul. Local-first / edge átállás, migrációs óra, kockázat.",
    lead: "A külső szoftver eltűnik vagy fizetőssé válik. Azonnali local-first, dual-run, vagy fizeted. A motor a munkaórát és a TTR-t számolja — nincs felhő-adat.",
    baseRevenueNetHuf: 6_200_000,
    projectAlias: "SaaS-kilépés",
    businessAlias: "Üzem / local-first",
    goalName: "Local-first 10 munkanap, TTR 4 óra",
    kind: "saas",
    door: "services",
  },
];

export function industryCaseById(id: IndustryCaseId) {
  const found = INDUSTRY_SEGMENTS.find((s) => s.id === id);
  if (!found) throw new Error("Ismeretlen iparági eset.");
  return found;
}

export function industryCasesByDoor(door: IndustryDoor) {
  return INDUSTRY_SEGMENTS.filter((s) => s.door === door);
}

export function industrySurface(segmentId: IndustryCaseId) {
  const cse = industryCaseById(segmentId);
  const p = (key: string) => `p:${segmentId}:${key}`;
  const d = (key: string) => `d:${segmentId}:${key}`;
  const partners =
    cse.kind === "hospital"
      ? [
          { id: p("grid"), kind: "supplier", name: "Elosztói hálózat", tax_id: null, payment_term_days: 30, note: "Kieső külső áram." },
          { id: p("fuel"), kind: "supplier", name: "Dízel / aggregátor", tax_id: "61616161-2-42", payment_term_days: 7, note: "Üzemanyag-tartalék." },
          { id: p("ups"), kind: "supplier", name: "UPS / szünetmentes", tax_id: null, payment_term_days: 14, note: "ICU / NICU kör." },
        ]
      : cse.kind === "supply"
        ? [
            { id: p("crit"), kind: "supplier", name: "Kritikus alkatrész", tax_id: "62626262-2-13", payment_term_days: 21, note: "Kieső egyedi komponens." },
            { id: p("alt"), kind: "supplier", name: "Helyettesítő / copacker", tax_id: "63636363-2-42", payment_term_days: 10, note: "Alternatív technológia." },
          ]
        : cse.kind === "quality"
          ? [
              { id: p("lab"), kind: "supplier", name: "Minőség / labor", tax_id: null, payment_term_days: 7, note: "Gyökérok, tétel." },
              { id: p("cust"), kind: "customer", name: "Késztermék-vevő", tax_id: null, payment_term_days: 14, note: "Visszahívási kockázat." },
            ]
          : cse.kind === "wms"
            ? [
                { id: p("wms"), kind: "supplier", name: "WMS / szerver", tax_id: null, payment_term_days: 14, note: "Kieső digitális irányítás." },
                { id: p("scan"), kind: "supplier", name: "Vonalkód / papír BCP", tax_id: "64646464-2-13", payment_term_days: 7, note: "Manuális komissiózás." },
              ]
            : cse.kind === "fuel"
              ? [
                  { id: p("fuel"), kind: "supplier", name: "Üzemanyag-nagyker", tax_id: "65656565-2-42", payment_term_days: 8, note: "Dízelvolatilitás." },
                  { id: p("cust"), kind: "customer", name: "Fuvarmegrendelő", tax_id: null, payment_term_days: 21, note: "Fuvardíj-áthárítás." },
                ]
              : cse.kind === "tax"
                ? [
                    { id: p("tax"), kind: "authority", name: "Adó / hatóság (helyi másolat)", tax_id: null, payment_term_days: null, note: "Azonnali teher, nem élő API." },
                  ]
                : [
                    { id: p("saas"), kind: "supplier", name: "SaaS / felhő", tax_id: null, payment_term_days: 0, note: "Megszűnő vagy dráguló külső." },
                    { id: p("edge"), kind: "supplier", name: "Local-first / edge node", tax_id: null, payment_term_days: 14, note: "Saját gépen futó másolat." },
                  ];
  const duties = [
    { id: d("drill"), name: cse.kind === "tax" ? "Árrés-felülvizsgálat" : "BCP / Lean gyakorlat", cadence: "negyedéves", fixed_cost_huf: 0 },
  ];
  return { businessAlias: cse.businessAlias, projectAlias: cse.projectAlias, partners, duties };
}

export const HOSPITAL_GENERATOR_KW = 160;
export const HOSPITAL_DIESEL_L = 380;
export const HOSPITAL_L_PER_KWH = 0.28;
export const HOSPITAL_UPS_KWH = 42;

export type HospitalAlloc = { icu: number; or: number; nicu: number; ward: number };

export type HospitalWard = { id: keyof HospitalAlloc; label: string; servedKw: number; askedKw: number; hours: number; kept: boolean };

export type HospitalSim = {
  alloc: HospitalAlloc;
  loadKw: number;
  shedKw: number;
  dieselHours: number;
  upsHours: number;
  wards: HospitalWard[];
  triageOk: boolean;
  note: string;
};

export function defaultHospitalAlloc(): HospitalAlloc {
  return { icu: 62, or: 48, nicu: 36, ward: 28 };
}

export function simulateHospital(raw: HospitalAlloc): HospitalSim {
  const alloc = {
    icu: Math.max(0, raw.icu),
    or: Math.max(0, raw.or),
    nicu: Math.max(0, raw.nicu),
    ward: Math.max(0, raw.ward),
  };
  const order: Array<keyof HospitalAlloc> = ["icu", "nicu", "or", "ward"];
  const labels: Record<keyof HospitalAlloc, string> = {
    icu: "Intenzív",
    nicu: "Újszülött / inkubátor",
    or: "Műtők",
    ward: "Általános osztály",
  };
  let remaining = HOSPITAL_GENERATOR_KW;
  const served: HospitalAlloc = { icu: 0, or: 0, nicu: 0, ward: 0 };
  for (const id of order) {
    served[id] = Math.min(alloc[id], remaining);
    remaining -= served[id];
  }
  const loadKw = served.icu + served.or + served.nicu + served.ward;
  const asked = alloc.icu + alloc.or + alloc.nicu + alloc.ward;
  const shedKw = Math.max(0, asked - loadKw);
  const dieselHours = HOSPITAL_DIESEL_L / Math.max(0.05, loadKw * HOSPITAL_L_PER_KWH);
  const upsHours = HOSPITAL_UPS_KWH / Math.max(0.05, loadKw);
  const wards: HospitalWard[] = order.map((id) => {
    const kept = served[id] >= alloc[id] * 0.92 || alloc[id] === 0;
    return {
      id,
      label: labels[id],
      servedKw: Math.round(served[id]),
      askedKw: Math.round(alloc[id]),
      hours: kept ? Math.round(dieselHours * 10) / 10 : 0,
      kept,
    };
  });
  const triageOk = wards.filter((w) => w.id === "icu" || w.id === "nicu").every((w) => w.kept);
  return {
    alloc,
    loadKw: Math.round(loadKw),
    shedKw: Math.round(shedKw),
    dieselHours: Math.round(dieselHours * 10) / 10,
    upsHours: Math.round(upsHours * 10) / 10,
    wards,
    triageOk,
    note: triageOk
      ? "Lean triázs: ICU és NICU tartva. A vágás a nem létfontosságú körön."
      : "A létfontosságú kör is kap kevesebbet. Emeld a dízelterhelést, vagy vágj a műtő / osztály felől.",
  };
}

export type IndustrySignal = {
  tone: NarrativeTone;
  title: string;
  metric: string;
  detail: string;
};

export type IndustryWhatIf = {
  chart: Array<{ month: string; optimistic: number; realistic: number; pessimistic: number }>;
  signals: IndustrySignal[];
};

function monthLabel(now: Date, i: number) {
  return new Date(now.getFullYear(), now.getMonth() + i, 1).toLocaleDateString("hu-HU", { year: "numeric", month: "short" });
}

function formatHuf(n: number) {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

export function industryShowsFinance(kind: IndustryKind) {
  return kind === "fuel" || kind === "tax" || kind === "saas";
}

export function industryShowsPhysical(kind: IndustryKind) {
  return kind === "hospital" || kind === "supply" || kind === "quality" || kind === "wms" || kind === "saas";
}

export function buildIndustryWhatIf(input: { caseId: IndustryCaseId; horizonMonths: number; now?: Date }): IndustryWhatIf | null {
  const cse = industryCaseById(input.caseId);
  if (!industryShowsFinance(cse.kind)) return null;
  const now = input.now ?? new Date();
  const n = Math.max(3, input.horizonMonths);
  const inc0 = cse.baseRevenueNetHuf || MASTER_BASELINE.monthlyRevenueNet;
  const exp0 = Math.round(inc0 * 0.8);
  let o = 0;
  let r = 0;
  let p = 0;
  const chart: IndustryWhatIf["chart"] = [];
  for (let i = 0; i < n; i++) {
    let on = inc0 * 0.08;
    let rn = inc0 * 0.02;
    let pn = -inc0 * 0.06;
    if (cse.kind === "fuel") {
      const spike = i < 2 ? inc0 * 0.14 : inc0 * 0.05;
      on = inc0 * 0.06 + (i > 1 ? inc0 * 0.04 : -spike * 0.2);
      rn = inc0 * 0.01 - spike * 0.35;
      pn = -spike * (i < 3 ? 1 : 0.55);
    } else if (cse.kind === "tax") {
      const tax = inc0 * 0.09;
      on = inc0 * 0.05 - tax * 0.25;
      rn = inc0 * 0.01 - tax * 0.7;
      pn = -tax * (i < 2 ? 1.15 : 0.8);
    } else {
      const hours = 420_000;
      on = inc0 * 0.04 - hours * 0.15;
      rn = -hours * 0.35 + (i > 2 ? inc0 * 0.03 : 0);
      pn = -hours * 0.85;
    }
    o += on;
    r += rn;
    p += pn;
    chart.push({ month: monthLabel(now, i), optimistic: Math.round(o), realistic: Math.round(r), pessimistic: Math.round(p) });
  }
  const signals: IndustrySignal[] =
    cse.kind === "fuel"
      ? [
          { tone: "opt", title: "Útvonal + kihasználtság", metric: "üres km −22%", detail: "Járatok összevonva. A flotta kevesebbet ég, a dízelugrás részben elnyelődik." },
          { tone: "real", title: "Frekvencia-vágás", metric: formatHuf(Math.round(inc0 * 0.05)) + "/hó", detail: "Ritkább indítás, teljesebb kocsi. A vevő később kap — a muda csökken." },
          { tone: "pess", title: "Üres km muda", metric: formatHuf(chart[2]!.pessimistic), detail: "Ugyanaz a menetrend, drágább dízel. A lyuk a 3. hónapig nő." },
        ]
      : cse.kind === "tax"
        ? [
            { tone: "opt", title: "Muda viszi a terhet", metric: "árrés tartva", detail: "Változó pazarlás ki. A core puffer megmarad." },
            { tone: "real", title: "Fokozatos áthárítás", metric: `−${formatHuf(Math.round(inc0 * 0.06))}/hó`, detail: "A teher ~70%-át viszed át. A fedezet szűkül, nem lyukad." },
            { tone: "pess", title: "Likviditási lyuk", metric: formatHuf(chart[1]!.pessimistic), detail: "Nincs vágás, nincs áthárítás. A runway hónapokban fogy." },
          ]
        : [
            { tone: "opt", title: "Local-first kész", metric: "12 munkaóra", detail: "A másolat már a gépen van. TTR percben. Nincs felhő-függés." },
            { tone: "real", title: "Dual-run migráció", metric: "6 hét · 180 óra", detail: "Párhuzamosan fut a régi és a helyi. A kockázat a belső óra." },
            { tone: "pess", title: "Vendor-sokk", metric: "400+ óra", detail: "Nincs másolat. A működés áll, amíg a saját node feláll." },
          ];
  return { chart, signals };
}

export function industryWalk(kind: IndustryKind): NarrativeStory | null {
  if (kind === "hospital") return null;
  const root = industryCaseById(
    INDUSTRY_SEGMENTS.find((s) => s.kind === kind)!.id,
  ).businessAlias;
  if (kind === "supply") {
    return {
      id: "supply",
      title: "Helyettesítés vagy sorleállás",
      root,
      startId: "path",
      steps: [
        {
          id: "path",
          month: 0,
          question: "Helyettesítő anyag + SMED, vagy megállítod a sort?",
          choices: [
            { id: "smed", label: "Helyettesítő + SMED", tone: "opt", lead: "Átállás 4–6 óra. OEE lyuk rövid. A minőség Poka-Yoke-kal zár.", next: null },
            { id: "hold", label: "Várunk az eredetire", tone: "real", lead: "A sor áll. Nincs selejt, de a kihozatal nullán.", next: null },
            { id: "push", label: "Hajtás más alkatrésszel, audit nélkül", tone: "pess", lead: "OEE látszólag tart. A rejtett hiba később jön.", next: null },
          ],
        },
      ],
    };
  }
  if (kind === "quality") {
    return {
      id: "quality",
      title: "Tétel-elhatárolás",
      root,
      startId: "path",
      steps: [
        {
          id: "path",
          month: 0,
          question: "Elhatárolod a hibás tételt, vagy hajtasz tovább?",
          choices: [
            { id: "hold", label: "Elhatárolás + gyökérok", tone: "opt", lead: "A visszahívás megáll. Poka-Yoke pont a soron.", next: null },
            { id: "sample", label: "Mintavétel, sor megy", tone: "real", lead: "Részleges kockázat. A költség közepes.", next: null },
            { id: "ship", label: "Kiszállítás, utólag javítunk", tone: "pess", lead: "Visszahívási hullám. A reputáció és a Ft együtt megy.", next: null },
          ],
        },
      ],
    };
  }
  if (kind === "wms") {
    return {
      id: "wms",
      title: "Manuális BCP",
      root,
      startId: "path",
      steps: [
        {
          id: "path",
          month: 0,
          question: "Papír + vonalkód most, vagy vársz a WMS-re?",
          choices: [
            { id: "paper", label: "Papír / vonalkód BCP", tone: "opt", lead: "Lead time ×1,6. A dokk forog. Torlódás elkerülhető.", next: null },
            { id: "hybrid", label: "Csak indítás, komissió kézzel", tone: "real", lead: "Részleges átfutás. A sor lassabb, nem áll.", next: null },
            { id: "wait", label: "Várunk a szerverre", tone: "pess", lead: "A dokk megtelik. Lead time ×4, kamionok állnak.", next: null },
          ],
        },
      ],
    };
  }
  if (kind === "fuel") {
    return {
      id: "fuel",
      title: "Flotta újraszervezés",
      root,
      startId: "path",
      steps: [
        {
          id: "path",
          month: 0,
          question: "Újraszervezed a járatokat, vagy emeled a fuvardíjat?",
          choices: [
            { id: "route", label: "Útvonal + kihasználtság", tone: "opt", lead: "Üres km ki. A dízelugrás részben elnyelődik.", next: null },
            { id: "price", label: "Fuvardíj-áthárítás", tone: "real", lead: "A vevő fizet. Ritkábban rendel. A volume esik.", next: null },
            { id: "hold", label: "Ugyanaz a menetrend", tone: "pess", lead: "A muda marad. A cash-lyuk a 3. hónapig nő.", next: null },
          ],
        },
      ],
    };
  }
  if (kind === "tax") {
    return {
      id: "tax",
      title: "Árrés-sokk",
      root,
      startId: "path",
      steps: [
        {
          id: "path",
          month: 0,
          question: "Muda-írtás most, vagy áthárítod a terhet?",
          choices: [
            { id: "cut", label: "Lean vágás a változón", tone: "opt", lead: "A core puffer tart. Az árrés megmarad.", next: null },
            { id: "pass", label: "Fokozatos áthárítás", tone: "real", lead: "A teher ~70%-a az árban. A volume kicsit esik.", next: null },
            { id: "wait", label: "Várunk, a puffer viszi", tone: "pess", lead: "A runway fogy. Nincs vágás, nincs ár.", next: null },
          ],
        },
      ],
    };
  }
  return {
    id: "saas",
    title: "Local-first átállás",
    root,
    startId: "path",
    steps: [
      {
        id: "path",
        month: 0,
        question: "Local-first most, dual-run, vagy fizeted az új árat?",
        choices: [
          { id: "local", label: "Azonnali local-first / edge", tone: "opt", lead: "12–40 óra. TTR percben. Nincs felhő-adat.", next: null },
          { id: "dual", label: "Dual-run 6 hét", tone: "real", lead: "180 belső óra. A kockázat a párhuzamos működés.", next: null },
          { id: "pay", label: "Fizeted / vársz", tone: "pess", lead: "Ha megszűnik, 400+ óra scramble. A TTR napokban.", next: null },
        ],
      },
    ],
  };
}

export function resolveIndustryWalk(kind: IndustryKind, path: string[]): NarrativeClimax {
  const cash0 = MASTER_BASELINE.startingCashHuf;
  const pick = path[0] ?? "";
  const table: Record<string, NarrativeClimax> = {
    smed: { title: "SMED + helyettesítő", tone: "opt", cashHuf: cash0, runwayMonths: 8, beMonth: 2, lockIn: "OEE lyuk 6 óra.", wow: "Az átállás a soron van, nem a naptárban." },
    hold: { title: "Sorállás", tone: "real", cashHuf: cash0 - 420_000, runwayMonths: 5, beMonth: null, lockIn: "Nincs selejt, nincs kihozatal.", wow: "A várakozás is muda." },
    push: { title: "Audit nélküli hajtás", tone: "pess", cashHuf: cash0 - 980_000, runwayMonths: 3, beMonth: null, lockIn: "Rejtett hiba a készterméken.", wow: "Az OEE hazudik, ha a minőség nincs zárva." },
    sample: { title: "Mintavétel", tone: "real", cashHuf: cash0 - 210_000, runwayMonths: 7, beMonth: 4, lockIn: "Részleges kockázat.", wow: "A tétel fele még kint lehet." },
    ship: { title: "Visszahívási hullám", tone: "pess", cashHuf: cash0 - 2_400_000, runwayMonths: 2, beMonth: null, lockIn: "A reputáció és a Ft együtt megy.", wow: "A poka-yoke olcsóbb lett volna." },
    paper: { title: "Papír-BCP", tone: "opt", cashHuf: cash0, runwayMonths: 9, beMonth: 1, lockIn: "Lead time ×1,6. A dokk forog.", wow: "A digitális kiesés nem állítja meg a fizikai sort." },
    hybrid: { title: "Hibrid indítás", tone: "real", cashHuf: cash0 - 180_000, runwayMonths: 7, beMonth: 3, lockIn: "Lassabb, nem áll.", wow: "A torlódás a dokknál dől el." },
    wait: { title: kind === "wms" ? "Dokkállás" : "Puffer viszi", tone: "pess", cashHuf: cash0 - 860_000, runwayMonths: 3, beMonth: null, lockIn: kind === "wms" ? "Lead time ×4." : "Nincs vágás.", wow: kind === "wms" ? "A kamionok a kapunál muda." : "A teher megeszi a core-t." },
    route: { title: "Üres km ki", tone: "opt", cashHuf: cash0 + 180_000, runwayMonths: 9, beMonth: 2, lockIn: "Kihasználtság fel.", wow: "A dízelugrás nem végzet, ha a muda megy." },
    price: { title: "Áthárítás", tone: "real", cashHuf: cash0 - 90_000, runwayMonths: 7, beMonth: 5, lockIn: "Volume esik.", wow: "A vevő ritkábban rendel." },
    cut: { title: "Muda viszi a terhet", tone: "opt", cashHuf: cash0 + 40_000, runwayMonths: 10, beMonth: 3, lockIn: "Árrés tartva.", wow: "A Lean a likviditást védi." },
    pass: { title: "Fokozatos áthárítás", tone: "real", cashHuf: cash0 - 220_000, runwayMonths: 7, beMonth: 6, lockIn: "70% az árban.", wow: "A volume kicsit esik, a ház áll." },
    local: { title: "Local-first éles", tone: "opt", cashHuf: cash0 - 80_000, runwayMonths: 11, beMonth: 1, lockIn: "12–40 óra. TTR percben.", wow: "A másolat a gépen volt — nincs felhő-adat." },
    dual: { title: "Dual-run", tone: "real", cashHuf: cash0 - 310_000, runwayMonths: 8, beMonth: 6, lockIn: "180 belső óra.", wow: "A kockázat a párhuzamos működés." },
    pay: { title: "Vendor-sokk", tone: "pess", cashHuf: cash0 - 1_100_000, runwayMonths: 4, beMonth: null, lockIn: "400+ óra scramble.", wow: "Ha nincs másolat, a TTR napokban van." },
  };
  if (kind === "quality" && pick === "hold") {
    return { title: "Tétel zárva", tone: "opt", cashHuf: cash0 - 160_000, runwayMonths: 9, beMonth: 2, lockIn: "Visszahívás megáll.", wow: "A poka pont olcsóbb, mint a hullám." };
  }
  return (
    table[pick] ?? {
      title: "Válassz ágat",
      tone: "real",
      cashHuf: cash0,
      runwayMonths: 8,
      beMonth: null,
      lockIn: "A törzs adott. A szálat te viszed.",
      wow: "A döntés a folyamaton van, nem a naptárban.",
    }
  );
}

export function walkedIndustry(story: NarrativeStory, path: string[]) {
  const out: Array<{ step: (typeof story.steps)[number]; picked: NarrativeChoice | null }> = [];
  let id: string | null = story.startId;
  let i = 0;
  while (id) {
    const step = story.steps.find((s) => s.id === id);
    if (!step) break;
    const picked = step.choices.find((c) => c.id === path[i]) ?? null;
    out.push({ step, picked });
    if (!picked) break;
    id = picked.next ?? null;
    i += 1;
  }
  return out;
}
