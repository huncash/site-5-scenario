import { MASTER_BASELINE, masterDuties, masterPartners } from "@/lib/masterBaseline";

export type StrategyCaseId =
  | "demo19_strategy_new_line"
  | "demo20_strategy_input_inflation"
  | "demo21_strategy_new_market"
  | "demo11_strategy_kahn_fork";

export const STRATEGY_CASE_IDS: readonly StrategyCaseId[] = [
  "demo19_strategy_new_line",
  "demo20_strategy_input_inflation",
  "demo21_strategy_new_market",
  "demo11_strategy_kahn_fork",
] as const;

export function isKahnForkSegment(id: string | null | undefined): id is "demo11_strategy_kahn_fork" {
  return id === "demo11_strategy_kahn_fork";
}

export function isNewLineSegment(id: string | null | undefined): id is "demo19_strategy_new_line" {
  return id === "demo19_strategy_new_line";
}

export function isInflationSegment(id: string | null | undefined): id is "demo20_strategy_input_inflation" {
  return id === "demo20_strategy_input_inflation";
}

export function isNewMarketSegment(id: string | null | undefined): id is "demo21_strategy_new_market" {
  return id === "demo21_strategy_new_market";
}

export function isStrategySegment(id: string | null | undefined): id is StrategyCaseId {
  return STRATEGY_CASE_IDS.includes(id as StrategyCaseId);
}

/** Kahn-esettanulmány: konkrét inputok a döntési fához és a seedhez. */
export const KAHN_FORK = {
  horizonMonths: 8,
  loanDrawHuf: 4_500_000,
  organicMonthlyCommitHuf: 1_100_000,
  organicCommitMonths: 3,
  optionFeeHuf: 540_000,
  capacityDepositHuf: 1_200_000,
  commitPctOfRevenue: 0.12,
  minMarginPct: 12,
  minRunwayMonths: 4,
  contractA: {
    id: "cheap",
    label: "A — olcsó + kötbéres",
    monthlyRatePct: 0.9,
    monthlyInterestHuf: 40_500,
    exitPenaltyHuf: 850_000,
    lockMonths: 6,
  },
  contractB: {
    id: "flex",
    label: "B — drága + rugalmas",
    monthlyRatePct: 1.25,
    monthlyInterestHuf: 56_250,
    exitPenaltyHuf: 0,
    lockMonths: 0,
  },
} as const;

export const STRATEGY_SEGMENTS: Array<{
  id: StrategyCaseId;
  name: string;
  title: string;
  blurb: string;
  lead: string;
  baseRevenueNetHuf: number;
  projectAlias: string;
  goalName: string;
}> = [
  {
    id: "demo19_strategy_new_line",
    name: "DEMO 19 — Új termékvonal és kapacitásbővítés",
    title: "Új termékvonal és kapacitásbővítés",
    blurb: "Gyors berobbanás vagy tervezett felfutás — a készlet előre viszi a pénzt. A pesszimista ág runwayt és muda-írtást számol.",
    lead: "A core üzem megvan. Új vonalat hozol be, és bővíted a kapacitást. A kérdés: a gyors piaci ugrás előre köti-e a likviditást az alapanyagban, vagy a tervezett ütem tartja a megtérülést.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Új termékvonal",
    goalName: "Termékvonal — megtérülés + 60 nap puffer",
  },
  {
    id: "demo20_strategy_input_inflation",
    name: "DEMO 20 — Alapanyag- és beszerzési árinfláció",
    title: "Alapanyag- és beszerzési árinfláció",
    blurb: "Fixált szerződés, fokozatos áthárítás, vagy stop-loss a belső folyamaton — ugyanaz a törzs, más beszerzési pálya.",
    lead: "A core számok megmaradnak. Az alapanyag drágul. Időben rögzítetted az árat, fokozatosan viszed át az árrésbe, vagy a belső folyamatot vágod, ha a fedezet elfogy.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Beszerzési infláció",
    goalName: "Árrés — 12% alá ne essen 60 napig",
  },
  {
    id: "demo21_strategy_new_market",
    name: "DEMO 21 — Diverzifikáció / új piac",
    title: "Diverzifikáció / új piacra lépés",
    blurb: "Azonnali szinergia, core által finanszírozott felfutás, vagy kilépés stop-loss-szal — a törzs nem változik.",
    lead: "A core üzem tartja a házat. Új piacra lépsz. Jön-e azonnal a szinergia, a core finanszírozza a hosszabb felfutást, vagy a stop-loss kiléptet, mielőtt a core-t is megenné.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Új piac",
    goalName: "Új piac — 6 havi stop-loss keret",
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
    projectAlias: "Terasz & konyha elágazás",
    goalName: "60 napon belül döntés · rossz ágon ≥4 hó tartalék · árrés ≥12%",
  },
];

export function strategyCaseById(id: StrategyCaseId) {
  const found = STRATEGY_SEGMENTS.find((s) => s.id === id);
  if (!found) throw new Error("Ismeretlen stratégiai eset.");
  return found;
}

export function strategySurface(segmentId: StrategyCaseId) {
  const cse = strategyCaseById(segmentId);
  const extra =
    segmentId === "demo19_strategy_new_line"
      ? [
          {
            id: `p:${segmentId}:copack`,
            kind: "supplier",
            name: "Kapacitás / copacker",
            tax_id: "21212121-2-42",
            payment_term_days: 10,
            note: "Eset-réteg: előszerződött kapacitás.",
          },
        ]
      : segmentId === "demo20_strategy_input_inflation"
        ? [
            {
              id: `p:${segmentId}:hedge`,
              kind: "supplier",
              name: "Fixált keretszerződés",
              tax_id: "23232323-2-42",
              payment_term_days: 30,
              note: "Eset-réteg: árrögzítés / hedge.",
            },
          ]
        : segmentId === "demo11_strategy_kahn_fork"
          ? [
              {
                id: `p:${segmentId}:bank-a`,
                kind: "supplier",
                name: "Bank A — olcsó + kötbéres",
                tax_id: "25252525-2-42",
                payment_term_days: 30,
                note: `Kahn A: ${KAHN_FORK.contractA.monthlyRatePct}%/hó, ${KAHN_FORK.contractA.lockMonths} hó zár, kilépés ${KAHN_FORK.contractA.exitPenaltyHuf.toLocaleString("hu-HU")} Ft.`,
              },
              {
                id: `p:${segmentId}:bank-b`,
                kind: "supplier",
                name: "Bank B — drága + rugalmas",
                tax_id: "25252526-2-42",
                payment_term_days: 30,
                note: `Kahn B: ${KAHN_FORK.contractB.monthlyRatePct}%/hó, előtörlesztés szabad, kötbér 0.`,
              },
              {
                id: `p:${segmentId}:capacity`,
                kind: "supplier",
                name: "Gépsor / 2. műszak (copacker)",
                tax_id: "25252527-2-42",
                payment_term_days: 14,
                note: `Előszerződés / foglaló ${KAHN_FORK.capacityDepositHuf.toLocaleString("hu-HU")} Ft — opt ág commit.`,
              },
            ]
        : [
            {
              id: `p:${segmentId}:dist`,
              kind: "customer",
              name: "Új piaci disztribútor",
              tax_id: "24242424-2-13",
              payment_term_days: 21,
              note: "Eset-réteg: új csatorna.",
            },
          ];
  return {
    businessAlias: MASTER_BASELINE.businessAlias,
    projectAlias: cse.projectAlias,
    partners: [...masterPartners(segmentId), ...extra],
    duties: masterDuties(segmentId),
  };
}

export type StrategyTone = "opt" | "real" | "pess";

export type StrategySignal = {
  tone: StrategyTone;
  title: string;
  metric: string;
  detail: string;
};

export type KahnCheckMetrics = {
  worseRunwayMonths: number;
  exitPenaltyHuf: number;
  optionFeeHuf: number;
  decisionDays: number;
  minRunwayMonths: number;
  minMarginPct: number;
  /** Opció + kötbér + 1 hó saját finanszírozás — döntési tartalék cél */
  reserveTargetHuf: number;
};

export function kahnReserveTargetHuf() {
  return KAHN_FORK.optionFeeHuf + KAHN_FORK.contractA.exitPenaltyHuf + KAHN_FORK.organicMonthlyCommitHuf;
}

export type StrategyWhatIf = {
  chart: Array<{ month: string; optimistic: number; realistic: number; pessimistic: number }>;
  signals: StrategySignal[];
  inheritedFrom: string;
  kahnMetrics?: KahnCheckMetrics;
};

export type KahnBranch = {
  tone: StrategyTone;
  label: string;
  strategy: string;
  outcome: string;
};

export type KahnForkNode = {
  id: string;
  label: string;
  tone: StrategyTone;
  detail: string;
  amountHint: string;
};

export type KahnDecisionTree = {
  root: string;
  caseLead: string;
  financingQuestion: string;
  financing: KahnForkNode[];
  contractQuestion: string;
  contracts: KahnForkNode[];
  outcomeQuestion: string;
  /** @deprecated use outcomeQuestion — kept for older callers */
  question: string;
  branches: KahnBranch[];
};

export type KahnFinancingId = "loan" | "organic";
export type KahnContractId = "cheap" | "flex";

export type KahnProLive = {
  tone: StrategyTone;
  label: string;
  runwayMonths: number | null;
  exitPenaltyHuf: number | null;
  monthlyObligationHuf: number | null;
  strategy: string;
};

/** Élő PLAN-mátrix: a két fordulat → Bővítés / Tartás / Tartalék mutatói. */
export function resolveKahnPlanPro(
  financing: KahnFinancingId | null,
  contract: KahnContractId | null,
): KahnProLive[] {
  const a = KAHN_FORK.contractA;
  const b = KAHN_FORK.contractB;

  if (!financing) {
    return resolveKahnPlanPro("organic", null);
  }

  if (financing === "organic") {
    return [
      {
        tone: "opt",
        label: "Bővítés",
        runwayMonths: 7,
        exitPenaltyHuf: 0,
        monthlyObligationHuf: KAHN_FORK.organicMonthlyCommitHuf,
        strategy: "Lassabb kapacitás a törzsből. Nincs kamat.",
      },
      {
        tone: "real",
        label: "Tartás",
        runwayMonths: 11,
        exitPenaltyHuf: 0,
        monthlyObligationHuf: Math.round(KAHN_FORK.optionFeeHuf / 6),
        strategy: `Opció ${formatHuf(KAHN_FORK.optionFeeHuf)}. A core ritmusa viszi a házat.`,
      },
      {
        tone: "pess",
        label: "Tartalék",
        runwayMonths: 9,
        exitPenaltyHuf: 0,
        monthlyObligationHuf: 0,
        strategy: `Nincs kötbér. Cél ≥${KAHN_FORK.minRunwayMonths} hó runway.`,
      },
    ];
  }

  if (!contract) {
    return resolveKahnPlanPro("loan", "flex");
  }

  if (contract === "cheap") {
    return [
      {
        tone: "opt",
        label: "Bővítés",
        runwayMonths: 8,
        exitPenaltyHuf: a.exitPenaltyHuf,
        monthlyObligationHuf: a.monthlyInterestHuf,
        strategy: "Olcsó kamat, zárt szál — ha a kereslet megjön.",
      },
      {
        tone: "real",
        label: "Tartás",
        runwayMonths: 6,
        exitPenaltyHuf: a.exitPenaltyHuf,
        monthlyObligationHuf: a.monthlyInterestHuf,
        strategy: `${a.lockMonths} hó zár. Kilépés kötbéres.`,
      },
      {
        tone: "pess",
        label: "Tartalék",
        runwayMonths: KAHN_FORK.minRunwayMonths,
        exitPenaltyHuf: a.exitPenaltyHuf,
        monthlyObligationHuf: a.monthlyInterestHuf,
        strategy: `Kilépés = +${formatHuf(a.exitPenaltyHuf)} kötbér.`,
      },
    ];
  }

  return [
    {
      tone: "opt",
      label: "Bővítés",
      runwayMonths: 7,
      exitPenaltyHuf: 0,
      monthlyObligationHuf: b.monthlyInterestHuf,
      strategy: "Drágább futás, szabad kilépés.",
    },
    {
      tone: "real",
      label: "Tartás",
      runwayMonths: 6,
      exitPenaltyHuf: 0,
      monthlyObligationHuf: b.monthlyInterestHuf,
      strategy: "Előtörlesztés szabad, kötbér 0.",
    },
    {
      tone: "pess",
      label: "Tartalék",
      runwayMonths: 6,
      exitPenaltyHuf: 0,
      monthlyObligationHuf: b.monthlyInterestHuf,
      strategy: `Kötbér 0. Cél ≥${KAHN_FORK.minRunwayMonths} hó runway.`,
    },
  ];
}

export function kahnDecisionTree(): KahnDecisionTree {
  const a = KAHN_FORK.contractA;
  const b = KAHN_FORK.contractB;
  const outcomeQuestion = "PRO kimenet — melyik sávon olvasod a döntést?";
  return {
    root: MASTER_BASELINE.businessAlias,
    caseLead:
      "Bővítés előtt: először a finanszírozás (hitel vagy saját tartalék), aztán a szerződés — csak utána a három kimenet.",
    financingQuestion: "1. fordulat: külső hitel vagy organikus növekedés?",
    financing: [
      {
        id: "loan",
        label: "Külső hitel",
        tone: "opt",
        detail: "Gyorsabb kapacitás. A 2. fordulat az A/B konstrukciót választja.",
        amountHint: `${formatHuf(KAHN_FORK.loanDrawHuf)} lehívás`,
      },
      {
        id: "organic",
        label: "Organikus növekedés",
        tone: "real",
        detail: "Nincs kamat, nincs kötbér. A core tartja a házat lassabb ütemben.",
        amountHint: `${KAHN_FORK.organicCommitMonths}× ${formatHuf(KAHN_FORK.organicMonthlyCommitHuf)}/hó a törzsből`,
      },
    ],
    contractQuestion: "2. fordulat (ha hitel): melyik konstrukció?",
    contracts: [
      {
        id: a.id,
        label: a.label,
        tone: "opt",
        detail: `${a.lockMonths} hónap zárás. Kilépéskor kötbér — olcsó, ha tuti a kereslet.`,
        amountHint: `${a.monthlyRatePct}%/hó · kötbér ${formatHuf(a.exitPenaltyHuf)}`,
      },
      {
        id: b.id,
        label: b.label,
        tone: "real",
        detail: "Előtörlesztés szabad. Drágább futás, olcsóbb megállás a pesszimista sávon.",
        amountHint: `${b.monthlyRatePct}%/hó · kötbér 0`,
      },
    ],
    outcomeQuestion,
    question: outcomeQuestion,
    branches: [
      {
        tone: "opt",
        label: "Bővítés",
        strategy: "Hitel + kapacitás előre",
        outcome: `~${Math.round(KAHN_FORK.commitPctOfRevenue * 100)}% havi bevétel commit + foglaló ${formatHuf(KAHN_FORK.capacityDepositHuf)}. A felfutás hozza vissza — ha a kereslet megjön.`,
      },
      {
        tone: "real",
        label: "Tartás",
        strategy: "Organikus / meglepetésmentes",
        outcome: `Opció nyitva: ${formatHuf(KAHN_FORK.optionFeeHuf)}. Nincs ugrás; a törzs ritmusa viszi a házat.`,
      },
      {
        tone: "pess",
        label: "Tartalék",
        strategy: "Stop-loss a nehéz sávon",
        outcome: `Először a pesszimista ág. A-n kilépés = +${formatHuf(a.exitPenaltyHuf)} kötbér; B-n csak kamatveszteség. Cél: ≥${KAHN_FORK.minRunwayMonths} hó runway.`,
      },
    ],
  };
}

function monthLabel(now: Date, i: number) {
  const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
  return m.toLocaleDateString("hu-HU", { year: "numeric", month: "short" });
}

function formatHuf(n: number) {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

function runwayMonths(startCash: number, nets: number[]) {
  let cash = startCash;
  for (let i = 0; i < nets.length; i++) {
    cash += nets[i]!;
    if (cash <= 0) return i;
  }
  return nets.length;
}

export function buildStrategyWhatIf(input: {
  caseId: StrategyCaseId;
  baseIncome: number;
  baseExpense: number;
  horizonMonths: number;
  now?: Date;
}): StrategyWhatIf {
  const now = input.now ?? new Date();
  const n = Math.max(3, input.horizonMonths);
  const inc0 = input.baseIncome > 0 ? input.baseIncome : MASTER_BASELINE.monthlyRevenueNet;
  const exp0 = input.baseExpense > 0 ? input.baseExpense : Math.round(inc0 * 0.78);
  const startCash = Math.round(inc0 * 0.55);

  const optNets: number[] = [];
  const realNets: number[] = [];
  const pessNets: number[] = [];
  const optCum: number[] = [];
  const realCum: number[] = [];
  const pessCum: number[] = [];
  let o = 0;
  let r = 0;
  let p = 0;

  for (let i = 0; i < n; i++) {
    let oi = inc0;
    let oe = exp0;
    let ri = inc0;
    let re = exp0;
    let pi = inc0;
    let pe = exp0;

    if (input.caseId === "demo19_strategy_new_line") {
      const wcTrap = Math.round(inc0 * 0.55);
      oi = inc0 * (1.1 + Math.min(0.55, i * 0.07));
      oe = exp0 * 0.96 + (i < 2 ? wcTrap : Math.round(inc0 * 0.04));
      ri = inc0 * (1.03 + Math.min(0.28, i * 0.028));
      re = exp0 * 1.02 + Math.round(inc0 * 0.035);
      pi = inc0 * (i < 2 ? 0.94 : 0.66);
      pe = i < 3 ? exp0 * 1.1 : exp0 * 0.86;
    } else if (input.caseId === "demo20_strategy_input_inflation") {
      oi = inc0 * 1.04;
      oe = exp0 * 0.98;
      const infl = 1 + i * 0.016;
      ri = inc0 * (1 + i * 0.011);
      re = exp0 * infl;
      pi = inc0 * (1 - Math.min(0.18, i * 0.02));
      pe = exp0 * (1 + i * 0.042);
    } else if (input.caseId === "demo11_strategy_kahn_fork") {
      const commit = Math.round(inc0 * KAHN_FORK.commitPctOfRevenue);
      const optionMonthly = Math.round(KAHN_FORK.optionFeeHuf / 6);
      const organicSlice = i < KAHN_FORK.organicCommitMonths ? Math.round(KAHN_FORK.organicMonthlyCommitHuf * 0.35) : 0;
      // Opt = hitel A + bővítés: gyors ramp, előre kötött kapacitás, alacsonyabb kamat
      oi = inc0 * (1.06 + Math.min(0.32, i * 0.04));
      oe =
        exp0 * 0.99 +
        (i < 2 ? commit : Math.round(inc0 * 0.02)) +
        KAHN_FORK.contractA.monthlyInterestHuf +
        (i === 0 ? Math.round(KAHN_FORK.capacityDepositHuf * 0.25) : 0);
      // Real = organikus / tartás: opciódíj amortizálva, nincs ugrás
      ri = inc0 * (0.99 + Math.min(0.08, i * 0.008));
      re = exp0 * (1 + i * 0.004) + organicSlice + optionMonthly;
      // Pess = gyenge kereslet + A-kötbér a 3. hónapban (szimulált kilépés)
      pi = inc0 * (1 - Math.min(0.14, i * 0.012));
      pe =
        exp0 * 0.94 +
        Math.round(inc0 * 0.03) +
        Math.round(KAHN_FORK.contractB.monthlyInterestHuf * 0.5) +
        (i === 2 ? KAHN_FORK.contractA.exitPenaltyHuf : 0);
    } else {
      oi = inc0 * 1.22;
      oe = exp0 * 0.97 + (i === 0 ? Math.round(inc0 * 0.05) : Math.round(inc0 * 0.01));
      const ramp = Math.min(1, i / 9);
      ri = inc0 * (1 + 0.08 * ramp);
      re = exp0 + Math.round(inc0 * 0.11) * (1 - ramp * 0.55);
      pi = i < 5 ? inc0 * (0.98 + i * 0.01) : inc0 * 0.9;
      pe = i < 5 ? exp0 + Math.round(inc0 * 0.09) : exp0 * 0.94;
    }

    const on = oi - oe;
    const rn = ri - re;
    const pn = pi - pe;
    o += on;
    r += rn;
    p += pn;
    optNets.push(on);
    realNets.push(rn);
    pessNets.push(pn);
    optCum.push(o);
    realCum.push(r);
    pessCum.push(p);
  }

  const chart = optCum.map((_, i) => ({
    month: monthLabel(now, i),
    optimistic: Math.round(optCum[i]!),
    realistic: Math.round(realCum[i]!),
    pessimistic: Math.round(pessCum[i]!),
  }));

  const optDip = Math.min(...optCum, 0);
  const realBe = realCum.findIndex((v) => v >= 0);
  const pessRun = runwayMonths(startCash, pessNets);
  const mudaCut = Math.max(0, exp0 * 0.12);
  const lastPess = pessCum[pessCum.length - 1] ?? 0;
  const stopAt = pessCum.findIndex((v, i) => i >= 2 && v < -Math.max(400_000, inc0 * 0.08));

  const signals: StrategySignal[] =
    input.caseId === "demo19_strategy_new_line"
      ? [
          {
            tone: "opt",
            title: "Likviditási csapda",
            metric: optDip < 0 ? formatHuf(optDip) : "nincs lyuk",
            detail: "Gyors berobbanás: az előszerződött alapanyag és kapacitás az első 60 napban előre viszi a készpénzt.",
          },
          {
            tone: "real",
            title: "Tervezett megtérülés",
            metric: realBe < 0 ? "horizonton túl" : `${realBe + 1}. hónap`,
            detail: "Ütemezett felfutás: a core törzs viszi a fixet, a vonal fokozatosan hozza vissza a setupot.",
          },
          {
            tone: "pess",
            title: "Runway + muda-írtás",
            metric: `${pessRun} hó · −${formatHuf(mudaCut)}/hó`,
            detail: "Keresletcsökkenés után Lean vágás a változó pazarláson. A runway a core pufferrel számol.",
          },
        ]
      : input.caseId === "demo20_strategy_input_inflation"
        ? [
            {
              tone: "opt",
              title: "Fixált beszállítói ár",
              metric: "COGS zárva",
              detail: "Időben rögzített keret: az infláció nem megy át a változóba, a core árrés megmarad.",
            },
            {
              tone: "real",
              title: "Árrés-optimalizálás",
              metric: `+${Math.round(((realCum[Math.min(5, n - 1)] ?? 0) / Math.max(1, inc0)) * 100)}% / 6hó`,
              detail: "Fokozatos áremelkedés: a drágulás ~70%-át viszed át az árba, a maradék a fedezetet nyomja.",
            },
            {
              tone: "pess",
              title: "Stop-loss a folyamaton",
              metric: stopAt < 0 ? "kereten belül" : `${stopAt + 1}. hónap`,
              detail: "Drasztikus drágulás: ha a fedezet két hónapig 8% alatt marad, a belső folyamatot leállítod.",
            },
          ]
        : input.caseId === "demo11_strategy_kahn_fork"
          ? [
              {
                tone: "opt",
                title: "Bővítés — hitel A + kapacitás",
                metric: optDip < 0 ? formatHuf(optDip) : formatHuf(optCum[0] ?? 0),
                detail: `Lehívás ${formatHuf(KAHN_FORK.loanDrawHuf)}, commit ~${Math.round(KAHN_FORK.commitPctOfRevenue * 100)}%×bevétel, kamat ${formatHuf(KAHN_FORK.contractA.monthlyInterestHuf)}/hó. Felfutás, ha a kereslet megjön.`,
              },
              {
                tone: "real",
                title: "Tartás — organikus / opció",
                metric: `${formatHuf(Math.round((realCum[Math.min(5, n - 1)] ?? 0) / 6))}/hó`,
                detail: `Opciódíj ${formatHuf(KAHN_FORK.optionFeeHuf)} + ${KAHN_FORK.organicCommitMonths} hó belső kötés. Nincs ugrás; a törzs viszi a házat.`,
              },
              {
                tone: "pess",
                title: "Tartalék — kötbér vs kilépés",
                metric: `${pessRun} hó runway · A-kötbér ${formatHuf(KAHN_FORK.contractA.exitPenaltyHuf)}`,
                detail: `Stop-loss a 3. hónapban: A konstrukción +kötbér. Cél ≥${KAHN_FORK.minRunwayMonths} hó runway, árrés ≥${KAHN_FORK.minMarginPct}%.`,
              },
            ]
        : [
            {
              tone: "opt",
              title: "Azonnali szinergia",
              metric: formatHuf(optCum[0] ?? 0),
              detail: "Az új csatorna az első hónaptól emeli a core kosarat, a belépési költség egyszeri.",
            },
            {
              tone: "real",
              title: "Core finanszírozza",
              metric: `${formatHuf(Math.round(inc0 * 0.11))}/hó → lecseng`,
              detail: "Hosszabb felfutás: a Master Baseline üzem tartja a cash-t, amíg az új piac feláll.",
            },
            {
              tone: "pess",
              title: "Kilépés / stop-loss",
              metric: stopAt < 0 ? "nem lép be" : `${stopAt + 1}. hónap`,
              detail: `Automatikus szimuláció: ha a kumulált lyuk tartós, kilépsz. Maradék pálya: ${formatHuf(lastPess)}.`,
            },
          ];

  const kahnMetrics: KahnCheckMetrics | undefined =
    input.caseId === "demo11_strategy_kahn_fork"
      ? {
          worseRunwayMonths: pessRun,
          exitPenaltyHuf: KAHN_FORK.contractA.exitPenaltyHuf,
          optionFeeHuf: KAHN_FORK.optionFeeHuf,
          decisionDays: 60,
          minRunwayMonths: KAHN_FORK.minRunwayMonths,
          minMarginPct: KAHN_FORK.minMarginPct,
          reserveTargetHuf: kahnReserveTargetHuf(),
        }
      : undefined;

  return { chart, signals, inheritedFrom: MASTER_BASELINE.businessAlias, kahnMetrics };
}
