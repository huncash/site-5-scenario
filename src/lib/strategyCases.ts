import { MASTER_BASELINE, masterDuties, masterPartners } from "@/lib/masterBaseline";

export type StrategyCaseId =
  | "demo8_strategy_new_line"
  | "demo9_strategy_input_inflation"
  | "demo10_strategy_new_market"
  | "demo19_strategy_kahn_fork";

export const STRATEGY_CASE_IDS: readonly StrategyCaseId[] = [
  "demo8_strategy_new_line",
  "demo9_strategy_input_inflation",
  "demo10_strategy_new_market",
  "demo19_strategy_kahn_fork",
] as const;

export function isKahnForkSegment(id: string | null | undefined): id is "demo19_strategy_kahn_fork" {
  return id === "demo19_strategy_kahn_fork";
}

export function isNewLineSegment(id: string | null | undefined): id is "demo8_strategy_new_line" {
  return id === "demo8_strategy_new_line";
}

export function isStrategySegment(id: string | null | undefined): id is StrategyCaseId {
  return STRATEGY_CASE_IDS.includes(id as StrategyCaseId);
}

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
    id: "demo8_strategy_new_line",
    name: "DEMO 8 — Új termékvonal és kapacitásbővítés",
    title: "Új termékvonal és kapacitásbővítés",
    blurb: "Gyors berobbanás vagy tervezett felfutás — a készlet előre viszi a pénzt. A pesszimista ág runwayt és muda-írtást számol.",
    lead: "A core üzem megvan. Új vonalat hozol be, és bővíted a kapacitást. A kérdés: a gyors piaci ugrás előre köti-e a likviditást az alapanyagban, vagy a tervezett ütem tartja a megtérülést.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Új termékvonal",
    goalName: "Termékvonal — megtérülés + 60 nap puffer",
  },
  {
    id: "demo9_strategy_input_inflation",
    name: "DEMO 9 — Alapanyag- és beszerzési árinfláció",
    title: "Alapanyag- és beszerzési árinfláció",
    blurb: "Fixált szerződés, fokozatos áthárítás, vagy stop-loss a belső folyamaton — ugyanaz a törzs, más beszerzési pálya.",
    lead: "A core számok megmaradnak. Az alapanyag drágul. Időben rögzítetted az árat, fokozatosan viszed át az árrésbe, vagy a belső folyamatot vágod, ha a fedezet elfogy.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Beszerzési infláció",
    goalName: "Árrés — 12% alá ne essen 60 napig",
  },
  {
    id: "demo10_strategy_new_market",
    name: "DEMO 10 — Diverzifikáció / új piac",
    title: "Diverzifikáció / új piacra lépés",
    blurb: "Azonnali szinergia, core által finanszírozott felfutás, vagy kilépés stop-loss-szal — a törzs nem változik.",
    lead: "A core üzem tartja a házat. Új piacra lépsz. Jön-e azonnal a szinergia, a core finanszírozza a hosszabb felfutást, vagy a stop-loss kiléptet, mielőtt a core-t is megenné.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Új piac",
    goalName: "Új piac — 6 havi stop-loss keret",
  },
  {
    id: "demo19_strategy_kahn_fork",
    name: "DEMO 19 — Kahn-féle jövőkutató & stratégiai elágazás",
    title: "Kahn-féle Jövőkutató & Stratégiai Elágazás",
    blurb:
      "What-if szálak: hitel vagy organikus, majd olcsó+kötbéres vagy drága+rugalmas. Kahn-fa a törzsből — nem jóslat, elágazás.",
    lead:
      "A core üzem adott. Első fordulat: külső hitel vagy organikus növekedés. Ha hitel, A olcsóbb de kötbéres, B drágább de rugalmas. A motor élőben számolja a klímaxot.",
    baseRevenueNetHuf: MASTER_BASELINE.monthlyRevenueNet,
    projectAlias: "Stratégiai elágazás",
    goalName: "Egy ág mellett döntés — vagy tartalék a pesszimista sávon",
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
    segmentId === "demo8_strategy_new_line"
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
      : segmentId === "demo9_strategy_input_inflation"
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
        : segmentId === "demo19_strategy_kahn_fork"
          ? [
              {
                id: `p:${segmentId}:desk`,
                kind: "supplier",
                name: "Jövőkutató asztal",
                tax_id: "25252525-2-42",
                payment_term_days: 30,
                note: "Eset-réteg: Kahn/RAND sablon — elágazási opciók, nem jóslat.",
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

export type StrategyWhatIf = {
  chart: Array<{ month: string; optimistic: number; realistic: number; pessimistic: number }>;
  signals: StrategySignal[];
  inheritedFrom: string;
};

export type KahnBranch = {
  tone: StrategyTone;
  label: string;
  strategy: string;
  outcome: string;
};

export type KahnDecisionTree = {
  root: string;
  question: string;
  branches: KahnBranch[];
};

export function kahnDecisionTree(): KahnDecisionTree {
  return {
    root: MASTER_BASELINE.businessAlias,
    question: "Melyik jövőágra kötsz készpénzt?",
    branches: [
      {
        tone: "opt",
        label: "Bővítés",
        strategy: "Optimista stratégia",
        outcome: "Kapacitást előre viszel. A felfutás hozza vissza a kötést — ha a kereslet megjön.",
      },
      {
        tone: "real",
        label: "Tartás",
        strategy: "Realista / meglepetésmentes",
        outcome: "A törzs ritmusa marad. Kahn referenciaága: nem meglepetés, nem ugrás.",
      },
      {
        tone: "pess",
        label: "Tartalék",
        strategy: "Pesszimista stratégia",
        outcome: "Runway és stop-loss. A nehéz sávot is számolod, mielőtt elkötelezed a készpénzt.",
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

    if (input.caseId === "demo8_strategy_new_line") {
      const wcTrap = Math.round(inc0 * 0.55);
      oi = inc0 * (1.1 + Math.min(0.55, i * 0.07));
      oe = exp0 * 0.96 + (i < 2 ? wcTrap : Math.round(inc0 * 0.04));
      ri = inc0 * (1.03 + Math.min(0.28, i * 0.028));
      re = exp0 * 1.02 + Math.round(inc0 * 0.035);
      pi = inc0 * (i < 2 ? 0.94 : 0.66);
      pe = i < 3 ? exp0 * 1.1 : exp0 * 0.86;
    } else if (input.caseId === "demo9_strategy_input_inflation") {
      oi = inc0 * 1.04;
      oe = exp0 * 0.98;
      const infl = 1 + i * 0.016;
      ri = inc0 * (1 + i * 0.011);
      re = exp0 * infl;
      pi = inc0 * (1 - Math.min(0.18, i * 0.02));
      pe = exp0 * (1 + i * 0.042);
    } else if (input.caseId === "demo19_strategy_kahn_fork") {
      const commit = Math.round(inc0 * 0.12);
      oi = inc0 * (1.06 + Math.min(0.32, i * 0.04));
      oe = exp0 * 0.99 + (i < 2 ? commit : Math.round(inc0 * 0.02));
      ri = inc0 * (0.99 + Math.min(0.08, i * 0.008));
      re = exp0 * (1 + i * 0.004);
      pi = inc0 * (1 - Math.min(0.14, i * 0.012));
      pe = exp0 * 0.94 + Math.round(inc0 * 0.03);
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
    input.caseId === "demo8_strategy_new_line"
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
      : input.caseId === "demo9_strategy_input_inflation"
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
        : input.caseId === "demo19_strategy_kahn_fork"
          ? [
              {
                tone: "opt",
                title: "Bővítési ág",
                metric: optDip < 0 ? formatHuf(optDip) : formatHuf(optCum[0] ?? 0),
                detail: "Előre kötött kapacitás. A fa ezen az ágon a felfutást számolja — ha a kereslet megjön.",
              },
              {
                tone: "real",
                title: "Meglepetésmentes ág",
                metric: `${formatHuf(Math.round((realCum[Math.min(5, n - 1)] ?? 0) / 6))}/hó`,
                detail: "Kahn referenciaága: a törzs ritmusa, nincs ugrás. A core viszi a házat.",
              },
              {
                tone: "pess",
                title: "Tartalék-ág",
                metric: `${pessRun} hó runway`,
                detail: "A nehéz sávot is számolod. Stop-loss, mielőtt a core-t is megenné az elköteleződés.",
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

  return { chart, signals, inheritedFrom: MASTER_BASELINE.businessAlias };
}
