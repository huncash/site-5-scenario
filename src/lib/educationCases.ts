export type EducationCaseId =
  | "demo16_edu_startup_cashflow"
  | "demo17_edu_ops_process"
  | "demo22_edu_campus_energy"
  | "demo23_edu_cyber_incident";

export const EDUCATION_CASE_IDS: readonly EducationCaseId[] = [
  "demo16_edu_startup_cashflow",
  "demo17_edu_ops_process",
  "demo22_edu_campus_energy",
  "demo23_edu_cyber_incident",
] as const;

export function isEducationSegment(id: string | null | undefined): id is EducationCaseId {
  return EDUCATION_CASE_IDS.includes(id as EducationCaseId);
}

export type EducationTone = "opt" | "real" | "pess";
export type EducationKind = "startup" | "ops" | "campus" | "cyber";

export const EDUCATION_SEGMENTS: Array<{
  id: EducationCaseId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
  projectAlias: string;
  businessAlias: string;
  goalName: string;
  kind: EducationKind;
}> = [
  {
    id: "demo16_edu_startup_cashflow",
    name: "DEMO 16 — Startup cash-flow (diákoknak)",
    title: "Startup pénzügyi tervezés és cash-flow",
    blurb: "Fix tőke, marketing / fejlesztés / bér. Késleltetett piac, PRO sáv, Poka-Yoke tartalék.",
    lead: "Virtuális induló cég fix tőkével. Te osztod a keretet. A motor a múltbeli szórással szimulálja a piacot — a döntés késve hat.",
    baseRevenueNetHuf: 420_000,
    projectAlias: "Diák startup",
    businessAlias: "Inkubátor / hallgatói cég",
    goalName: "Fedezeti pont 8 hónap alatt",
    kind: "startup",
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
    projectAlias: "Folyamat-audit",
    businessAlias: "Tanműhely / kis sor",
    goalName: "OEE 75% + lead time −30% (Quick Wins)",
    kind: "ops",
  },
  {
    id: "demo22_edu_campus_energy",
    name: "DEMO 22 — Campus energia- és hőtakarékosság",
    title: "Campus energia- és hőtakarékossági vészhelyzet",
    blurb: "Hőhullám, hálózat-túlterhelés, passzív hűtés, kollégiumi kvóta — kWh és Ft együtt.",
    lead: "Hőhullám terheli a campus hálózatát. Passzív hűtés, decentralizált kollégiumi kvóta. A mutató a kWh-kvóta és a rezsi, nem csak a komfort.",
    baseRevenueNetHuf: 0,
    projectAlias: "Campus hőhullám",
    businessAlias: "Egyetemi campus",
    goalName: "Kvóta tartás 6 napos hőhullámon",
    kind: "campus",
  },
  {
    id: "demo23_edu_cyber_incident",
    name: "DEMO 23 — Kiberincidens oktatási intézményben",
    title: "Kiberbiztonsági / adatszivárgási incidens",
    blurb: "Zsarolóvírus a tanszéki szerveren. Analóg vizsga, izolációs idő, helyreállás Ft-ban.",
    lead: "A tanszéki szerver titkosítva. Izolálod a hálózatot, analóg vizsgáztatásra és adminra mész, számolod az izolációs időt és a helyreállás költségét.",
    baseRevenueNetHuf: 0,
    projectAlias: "Kiberincidens",
    businessAlias: "Kar / tanszék",
    goalName: "Izoláció 4 óra + analóg vizsga",
    kind: "cyber",
  },
];

export function educationCaseById(id: EducationCaseId) {
  const found = EDUCATION_SEGMENTS.find((s) => s.id === id);
  if (!found) throw new Error("Ismeretlen oktatási eset.");
  return found;
}

export function educationSurface(segmentId: EducationCaseId) {
  const cse = educationCaseById(segmentId);
  const p = (key: string) => `p:${segmentId}:${key}`;
  const d = (key: string) => `d:${segmentId}:${key}`;
  const partners =
    cse.kind === "startup"
      ? [
          { id: p("inc"), kind: "authority", name: "Inkubátor / pályázat", tax_id: null, payment_term_days: null, note: "Diákkeret, nem ügyfél." },
          { id: p("mentor"), kind: "supplier", name: "Mentor / könyvelő", tax_id: "41414141-2-42", payment_term_days: 14, note: "Fix havi tétel." },
          { id: p("cloud"), kind: "supplier", name: "SaaS / tárhely", tax_id: null, payment_term_days: 0, note: "Változó + fix csomag." },
        ]
      : cse.kind === "ops"
        ? [
            { id: p("smed"), kind: "supplier", name: "SMED / átszerszámozás", tax_id: "42424242-2-13", payment_term_days: 21, note: "Átállási idő." },
            { id: p("poka"), kind: "supplier", name: "Poka-Yoke készlet", tax_id: null, payment_term_days: 14, note: "Hibamegelőző pont." },
            { id: p("cust"), kind: "customer", name: "Tanműhely megrendelő", tax_id: null, payment_term_days: 7, note: "Kis sor forgalma." },
          ]
        : cse.kind === "campus"
          ? [
              { id: p("grid"), kind: "supplier", name: "Campus elosztó / távhő", tax_id: "43434343-2-42", payment_term_days: 30, note: "Hőhullám-terhelés." },
              { id: p("dorm"), kind: "authority", name: "Kollégiumi kvóta", tax_id: null, payment_term_days: null, note: "Decentralizált keret." },
            ]
          : [
              { id: p("soc"), kind: "supplier", name: "IT biztonság / SOC", tax_id: null, payment_term_days: 14, note: "Izoláció + helyreállás." },
              { id: p("exam"), kind: "authority", name: "Tanulmányi / vizsga", tax_id: null, payment_term_days: null, note: "Analóg protokoll." },
            ];
  const duties =
    cse.kind === "ops"
      ? [
          { id: d("smed"), name: "SMED gyakorlat", cadence: "havi", fixed_cost_huf: 0 },
          { id: d("poka"), name: "Poka-Yoke felülvizsgálat", cadence: "negyedéves", fixed_cost_huf: 0 },
        ]
      : cse.kind === "cyber"
        ? [{ id: d("drill"), name: "Incidensgyakorlat", cadence: "féléves", fixed_cost_huf: 0 }]
        : [{ id: d("review"), name: "PDCA tréning-felülvizsgálat", cadence: "havi", fixed_cost_huf: 0 }];
  return { businessAlias: cse.businessAlias, projectAlias: cse.projectAlias, partners, duties };
}

export type EducationKpi = {
  id: string;
  label: string;
  unit: string;
  opt: number;
  real: number;
  pess: number;
  hint: string;
  family: "finance" | "lean" | "energy" | "time";
};

export type EducationPoint = { t: number; opt: number; real: number; pess: number };

export type EducationModel = {
  caseId: EducationCaseId;
  kind: EducationKind;
  title: string;
  kpis: EducationKpi[];
  series: EducationPoint[];
  seriesUnit: string;
  seriesLabel: string;
  extras: Array<{ label: string; opt: string; real: string; pess: string }>;
};

function series(n: number, step: number, opt0: number, real0: number, pess0: number, od: number, rd: number, pd: number, floor = 0): EducationPoint[] {
  const out: EducationPoint[] = [];
  for (let t = 0; t <= n; t += step) {
    out.push({
      t,
      opt: Math.max(floor, opt0 + od * t),
      real: Math.max(floor, real0 + rd * t),
      pess: Math.max(floor, pess0 + pd * t),
    });
  }
  return out;
}

export function buildEducationModel(caseId: EducationCaseId): EducationModel {
  const cse = educationCaseById(caseId);

  if (cse.kind === "startup") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      seriesUnit: "e Ft",
      seriesLabel: "Kumulált cash (e Ft)",
      kpis: [
        { id: "burn", label: "Burn rate", unit: "e Ft/hó", opt: 220, real: 310, pess: 420, hint: "Havi nettó égés. Lean: a pesszimista ág a muda-t is viszi.", family: "finance" },
        { id: "be", label: "Fedezeti pont", unit: "hó", opt: 4, real: 8, pess: 14, hint: "Az első hónap, amikor a kumulált eredmény eléri a nullát.", family: "finance" },
        { id: "fixshare", label: "Fix / változó", unit: "%", opt: 38, real: 52, pess: 71, hint: "A havi kiadásból mennyi a kötött. Magas arány: kevesebb mozgástér.", family: "lean" },
      ],
      series: series(12, 1, 1600, 1600, 1600, 90, -40, -210),
      extras: [
        { label: "Késleltetés", opt: "Marketing 2 hó, termék 3 hó", real: "Ugyanaz a késés, közepes szórás", pess: "Ugyanaz a késés, −18% sáv" },
        { label: "Poka-Yoke tartalék", opt: "≥12% — a rossz döntést megfogja", real: "12% alap", pess: "0% — a sáv a nullához megy" },
        { label: "Runway", opt: "a tartalék + bevétel", real: "bérégetés vs. késő bevétel", pess: "fizetésképtelenség, ha a tartalék elfogy" },
      ],
    };
  }

  if (cse.kind === "ops") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      seriesUnit: "nap",
      seriesLabel: "Átfutási idő (nap)",
      kpis: [
        { id: "oee", label: "OEE", unit: "%", opt: 82, real: 68, pess: 51, hint: "Rendelkezésre állás × teljesítmény × minőség. A Poka-Yoke a minőséget emeli.", family: "lean" },
        { id: "smed", label: "SMED átszerszámozás", unit: "perc", opt: 12, real: 38, pess: 95, hint: "Belső/külső átállás szétválasztva. Rövidebb SMED = rövidebb lead time.", family: "lean" },
        { id: "lead", label: "Lead time", unit: "nap", opt: 4.5, real: 9, pess: 16, hint: "Folyamat átfutás. A kiesés óradíja a pénzügyi sávon látszik.", family: "time" },
        {
          id: "roi",
          label: "Quick Win ROI (12 hó)",
          unit: "×",
          opt: 18,
          real: 9,
          pess: 2.4,
          hint: "Éves muda-megtakarítás / fix megvalósítási CapEx. Az első fázis alacsony CapEx, magas cash-flow.",
          family: "finance",
        },
      ],
      series: series(8, 1, 16, 16, 16, -1.4, -0.85, -0.15, 3),
      extras: [
        { label: "Poka-Yoke pontok", opt: "8 beépített", real: "3 próba", pess: "0 — utólagos selejt" },
        { label: "Kiesés óradíja", opt: "18 e Ft/ó", real: "26 e Ft/ó", pess: "34 e Ft/ó" },
        { label: "Selejthányad", opt: "0,6%", real: "2,4%", pess: "7,1%" },
        {
          label: "CapEx vs. havi megtakarítás",
          opt: "80 e Ft CapEx → ~240 e Ft/hó",
          real: "180 e Ft CapEx → ~135 e Ft/hó",
          pess: "420 e Ft CapEx → ~70 e Ft/hó",
        },
      ],
    };
  }

  if (cse.kind === "campus") {
    return {
      caseId,
      kind: cse.kind,
      title: cse.title,
      seriesUnit: "kWh",
      seriesLabel: "Kollégiumi kvóta-maradék (kWh)",
      kpis: [
        { id: "quota", label: "Napi kvóta", unit: "kWh", opt: 18, real: 14, pess: 9, hint: "Decentralizált kollégiumi keret hőhullám alatt.", family: "energy" },
        { id: "overload", label: "Hálózat-túlterhelés", unit: "%", opt: 8, real: 22, pess: 41, hint: "Campus elosztó csúcs. Passzív hűtés csökkenti.", family: "energy" },
        { id: "bill", label: "Rezsi (6 nap)", unit: "e Ft", opt: 210, real: 340, pess: 520, hint: "Energia + távhő a hőhullám ablakán. Pénzügyi sáv a kvóta mellett.", family: "finance" },
      ],
      series: series(6, 1, 86, 72, 48, -9, -14, -18),
      extras: [
        { label: "Passzív hűtés", opt: "éjszakai szellő + árnyékolás", real: "részleges árnyékolás", pess: "csak klíma, csúcsban" },
        { label: "Hőhullám", opt: "4 nap, 32 °C", real: "6 nap, 36 °C", pess: "8 nap, 39 °C" },
        { label: "Kvóta-túlépés", opt: "nincs", real: "2 kollégium", pess: "campus-szintű" },
      ],
    };
  }

  return {
    caseId,
    kind: cse.kind,
    title: cse.title,
    seriesUnit: "óra",
    seriesLabel: "Izolációs / helyreállási idő (óra)",
    kpis: [
      { id: "iso", label: "Izolációs idő", unit: "óra", opt: 1.5, real: 4, pess: 18, hint: "Mikor válik le a tanszéki szegmens a campus-hálózatról.", family: "time" },
      { id: "analog", label: "Analóg vizsga-folytonosság", unit: "%", opt: 92, real: 64, pess: 28, hint: "Papír + helyi névsor, ha a Neptun/szerver áll.", family: "lean" },
      { id: "recover", label: "Helyreállás", unit: "e Ft", opt: 180, real: 640, pess: 2_400, hint: "Backup + óradíj + kieső admin. Poka-Yoke: offline másolat.", family: "finance" },
    ],
    series: series(24, 2, 0.4, 0.4, 0.4, 0.05, 0.18, 0.85),
    extras: [
      { label: "Titkosított tanszéki szerver", opt: "1 / 6, izolálva", real: "3 / 6", pess: "5 / 6 + hallgatói gép" },
      { label: "Analóg admin", opt: "kész sablon, 2 óra", real: "részleges, 8 óra", pess: "nincs protokoll" },
      { label: "Local-first másolat", opt: "meleg, napi", real: "heti hideg", pess: "nincs" },
    ],
  };
}

function monthLabel(now: Date, i: number) {
  const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function buildEducationWhatIf(input: {
  caseId: EducationCaseId;
  horizonMonths: number;
  now?: Date;
}): { chart: Array<{ month: string; optimistic: number; realistic: number; pessimistic: number }> } | null {
  const cse = educationCaseById(input.caseId);
  const now = input.now ?? new Date();
  const n = input.horizonMonths;
  if (cse.kind !== "startup" && cse.kind !== "ops") return null;

  const chart: Array<{ month: string; optimistic: number; realistic: number; pessimistic: number }> = [];
  let o = cse.kind === "startup" ? 1_600_000 : 0;
  let r = cse.kind === "startup" ? 1_600_000 : 0;
  let p = cse.kind === "startup" ? 1_600_000 : 0;

  for (let i = 0; i < n; i++) {
    if (cse.kind === "startup") {
      const revO = 80_000 + i * 55_000;
      const revR = 40_000 + i * 32_000;
      const revP = 18_000 + i * 8_000;
      const fixO = 160_000;
      const fixR = 210_000;
      const fixP = 260_000;
      const varO = 60_000;
      const varR = 100_000;
      const varP = 160_000;
      o += revO - fixO - varO;
      r += revR - fixR - varR;
      p += revP - fixP - varP;
    } else {
      const downO = 18_000 * 4;
      const downR = 26_000 * 11;
      const downP = 34_000 * 22;
      const yieldO = 2_400_000 * (0.82 / 0.68);
      const yieldR = 2_400_000;
      const yieldP = 2_400_000 * (0.51 / 0.68);
      o += yieldO - 1_720_000 - downO;
      r += yieldR - 1_860_000 - downR;
      p += yieldP - 1_980_000 - downP;
    }
    chart.push({
      month: monthLabel(now, i),
      optimistic: Math.round(o),
      realistic: Math.round(r),
      pessimistic: Math.round(p),
    });
  }
  return { chart };
}
