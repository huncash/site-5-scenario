import { MASTER_BASELINE } from "@/lib/masterBaseline";
import type { KahnForkNode, KahnProLive } from "@/lib/strategyCases";

export type StrategyForkKind = "inflation" | "market" | "newline";

export function strategyForkKindOf(id: string | null | undefined): StrategyForkKind | null {
  if (id === "demo20_strategy_input_inflation") return "inflation";
  if (id === "demo21_strategy_new_market") return "market";
  if (id === "demo19_strategy_new_line") return "newline";
  return null;
}

export type StrategyForkTree = {
  root: string;
  primaryQuestion: string;
  primary: KahnForkNode[];
  secondaryQuestion: string;
  secondary: KahnForkNode[];
  secondaryNeeds: string;
  outcomeQuestion: string;
  metricLabels: [string, string, string];
};

function formatHuf(n: number) {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

const CORE_DRAIN = Math.round(MASTER_BASELINE.monthlyRevenueNet * 0.11);
const ENTRY_COST = 420_000;
const PASS_COGS = 180_000;
const CUT_COGS = 90_000;
const LINE_STOCK = Math.round(MASTER_BASELINE.monthlyRevenueNet * 0.28);
const LINE_PUSH = Math.round(MASTER_BASELINE.monthlyRevenueNet * 0.62);

export function inflationForkTree(): StrategyForkTree {
  return {
    root: MASTER_BASELINE.businessAlias,
    primaryQuestion: "1. fordulat: rögzíted az árat, vagy nyitva hagyod?",
    primary: [
      {
        id: "lock",
        label: "Fixált szerződés",
        tone: "opt",
        detail: "A beszállítói ár zárva. Az infláció nem megy át a változóba.",
        amountHint: "COGS zárva",
      },
      {
        id: "float",
        label: "Nyitott ár",
        tone: "real",
        detail: "A 2. fordulat: áthárítás vagy belső vágás.",
        amountHint: "havi extra a változón",
      },
    ],
    secondaryQuestion: "2. fordulat (ha nyitott): áthárítás vagy folyamat-vágás?",
    secondary: [
      {
        id: "pass",
        label: "Fokozatos áthárítás",
        tone: "opt",
        detail: "A drágulás ~70%-át viszed az árba. A maradék a fedezetet nyomja.",
        amountHint: `+${formatHuf(PASS_COGS)}/hó extra COGS`,
      },
      {
        id: "cut",
        label: "Folyamat-vágás",
        tone: "pess",
        detail: "Ha a fedezet két hónapig 8% alatt marad, a belső folyamatot leállítod.",
        amountHint: `Lean vágás · ${formatHuf(CUT_COGS)}/hó`,
      },
    ],
    secondaryNeeds: "float",
    outcomeQuestion: "PRO kimenet — melyik sávon olvasod a döntést?",
    metricLabels: ["Runway", "Árrés", "Havi extra"],
  };
}

export function marketForkTree(): StrategyForkTree {
  return {
    root: MASTER_BASELINE.businessAlias,
    primaryQuestion: "1. fordulat: azonnali belépés vagy ütemezett felfutás?",
    primary: [
      {
        id: "now",
        label: "Azonnali szinergia",
        tone: "opt",
        detail: "Az új csatorna az első hónaptól emeli a core kosarat. Belépés egyszeri.",
        amountHint: `belépés ${formatHuf(ENTRY_COST)}`,
      },
      {
        id: "staged",
        label: "Ütemezett belépés",
        tone: "real",
        detail: "A 2. fordulat: a törzs viszi, vagy stop-loss keret.",
        amountHint: "nincs ugrás az első hónapban",
      },
    ],
    secondaryQuestion: "2. fordulat (ha ütemezett): core viszi, vagy kilépési keret?",
    secondary: [
      {
        id: "core",
        label: "Core finanszírozza",
        tone: "real",
        detail: "A Master Baseline üzem tartja a cash-t, amíg az új piac feláll.",
        amountHint: `${formatHuf(CORE_DRAIN)}/hó a törzsből`,
      },
      {
        id: "exit",
        label: "Stop-loss keret",
        tone: "pess",
        detail: "Ha a kumulált lyuk tartós, kilépsz. A törzs nem viszi tovább.",
        amountHint: "6 havi stop-loss",
      },
    ],
    secondaryNeeds: "staged",
    outcomeQuestion: "PRO kimenet — melyik sávon olvasod a döntést?",
    metricLabels: ["Runway", "Belépés", "Havi teher"],
  };
}

export function newLineForkTree(): StrategyForkTree {
  return {
    root: MASTER_BASELINE.businessAlias,
    primaryQuestion: "1. fordulat: tervezett ütem vagy piaci berobbanás?",
    primary: [
      {
        id: "planned",
        label: "Tervezett ütem",
        tone: "real",
        detail: "Stabil megrendelés. A törzs viszi a fixet — nincs előre hozott készletlyuk.",
        amountHint: "nincs előfinanszírozás",
      },
      {
        id: "burst",
        label: "Piaci berobbanás",
        tone: "opt",
        detail: "A 2. fordulat: megállj a likviditásnál, vagy tovább finanszírozd a sort.",
        amountHint: `készlet ${formatHuf(LINE_STOCK)}`,
      },
    ],
    secondaryQuestion: "2. fordulat (ha berobbanás): megállj a csapdánál, vagy tovább?",
    secondary: [
      {
        id: "halt",
        label: "Megállj",
        tone: "opt",
        detail: "Nincs új előfinanszírozás. A felfutás a már lekötött sort hozza.",
        amountHint: "a core megmarad",
      },
      {
        id: "push",
        label: "Tovább — még egy kör",
        tone: "pess",
        detail: "Még mélyebb előfinanszírozás. A lyuk nő, ha a kereslet nem tart.",
        amountHint: `készlet ${formatHuf(LINE_PUSH)}`,
      },
    ],
    secondaryNeeds: "burst",
    outcomeQuestion: "PRO kimenet — melyik sávon olvasod a döntést?",
    metricLabels: ["Runway", "Készletkötés", "Havi teher"],
  };
}

export function strategyForkTree(kind: StrategyForkKind): StrategyForkTree {
  if (kind === "inflation") return inflationForkTree();
  if (kind === "market") return marketForkTree();
  return newLineForkTree();
}

function filled(cards: KahnProLive[]): KahnProLive[] {
  return cards.map((c) => ({
    ...c,
    runwayMonths: c.runwayMonths ?? 0,
    exitPenaltyHuf: c.exitPenaltyHuf ?? 0,
    monthlyObligationHuf: c.monthlyObligationHuf ?? 0,
  }));
}

export function resolveInflationPlanPro(primary: string | null, secondary: string | null): KahnProLive[] {
  if (!primary) {
    return resolveInflationPlanPro("lock", null);
  }
  if (primary === "lock") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 12, exitPenaltyHuf: 18, monthlyObligationHuf: 0, strategy: "COGS zárva. Az árrés megmarad." },
      { tone: "real", label: "Tartás", runwayMonths: 10, exitPenaltyHuf: 14, monthlyObligationHuf: 0, strategy: "Nincs extra változó. A törzs ritmusa viszi." },
      { tone: "pess", label: "Tartalék", runwayMonths: 8, exitPenaltyHuf: 12, monthlyObligationHuf: 0, strategy: "Zárt ár: a pesszimista sáv is a küszöb fölött." },
    ];
  }
  if (!secondary) {
    return filled([
      { tone: "opt", label: "Bővítés", runwayMonths: 9, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Nyitott ár. Válaszd az áthárítást vagy a vágást." },
      { tone: "real", label: "Tartás", runwayMonths: 7, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "A 2. fordulat a fedezetet dönti el." },
      { tone: "pess", label: "Tartalék", runwayMonths: 5, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Áthárítás: extra COGS. Vágás: stop-loss." },
    ]);
  }
  if (secondary === "pass") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 9, exitPenaltyHuf: 14, monthlyObligationHuf: Math.round(PASS_COGS * 0.7), strategy: "70% átmegy az árba. A kosár tartja." },
      { tone: "real", label: "Tartás", runwayMonths: 7, exitPenaltyHuf: 11, monthlyObligationHuf: PASS_COGS, strategy: "A maradék a fedezetet nyomja." },
      { tone: "pess", label: "Tartalék", runwayMonths: 5, exitPenaltyHuf: 8, monthlyObligationHuf: Math.round(PASS_COGS * 1.2), strategy: "8% árrés — a vészfék küszöbe." },
    ];
  }
  return [
    { tone: "opt", label: "Bővítés", runwayMonths: 10, exitPenaltyHuf: 13, monthlyObligationHuf: CUT_COGS, strategy: "Lean vágás: a változó pazarlás megy." },
    { tone: "real", label: "Tartás", runwayMonths: 8, exitPenaltyHuf: 12, monthlyObligationHuf: CUT_COGS, strategy: "A folyamat szűkül, a törzs megmarad." },
    { tone: "pess", label: "Tartalék", runwayMonths: 6, exitPenaltyHuf: 9, monthlyObligationHuf: 0, strategy: "Stop-loss: a belső folyamat áll. Extra COGS 0." },
  ];
}

export function resolveMarketPlanPro(primary: string | null, secondary: string | null): KahnProLive[] {
  if (!primary) {
    return resolveMarketPlanPro("now", null);
  }
  if (primary === "now") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 11, exitPenaltyHuf: ENTRY_COST, monthlyObligationHuf: 0, strategy: "Azonnali kosár-emelés. Belépés egyszeri." },
      { tone: "real", label: "Tartás", runwayMonths: 9, exitPenaltyHuf: ENTRY_COST, monthlyObligationHuf: 0, strategy: "Nincs havi teher. A csatorna az első hónaptól dolgozik." },
      { tone: "pess", label: "Tartalék", runwayMonths: 7, exitPenaltyHuf: ENTRY_COST, monthlyObligationHuf: 0, strategy: "Ha nem jön a szinergia, a belépés már kint van." },
    ];
  }
  if (!secondary) {
    return filled([
      { tone: "opt", label: "Bővítés", runwayMonths: 8, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Ütemezett. Válaszd: core viszi, vagy stop-loss." },
      { tone: "real", label: "Tartás", runwayMonths: 7, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "A 2. fordulat a havi terhet dönti el." },
      { tone: "pess", label: "Tartalék", runwayMonths: 5, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Core: havi teher. Stop-loss: kilépés." },
    ]);
  }
  if (secondary === "core") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 8, exitPenaltyHuf: 0, monthlyObligationHuf: CORE_DRAIN, strategy: "A törzs viszi a felfutást." },
      { tone: "real", label: "Tartás", runwayMonths: 7, exitPenaltyHuf: 0, monthlyObligationHuf: CORE_DRAIN, strategy: `${formatHuf(CORE_DRAIN)}/hó a core-ból, amíg feláll.` },
      { tone: "pess", label: "Tartalék", runwayMonths: 5, exitPenaltyHuf: 0, monthlyObligationHuf: CORE_DRAIN, strategy: "Hosszú felfutás: a puffer fogynia kezd." },
    ];
  }
  return [
    { tone: "opt", label: "Bővítés", runwayMonths: 10, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Nem mélyülsz bele. A keret zár, ha lyuk van." },
    { tone: "real", label: "Tartás", runwayMonths: 8, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "6 havi stop-loss. Kilépés, mielőtt a törzset viszi." },
    { tone: "pess", label: "Tartalék", runwayMonths: 6, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Automatikus vágás. Maradék pálya a törzsön." },
  ];
}

export function resolveNewLinePlanPro(primary: string | null, secondary: string | null): KahnProLive[] {
  if (!primary) {
    return resolveNewLinePlanPro("planned", null);
  }
  if (primary === "planned") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 12, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "A törzs ritmusa viszi. Nincs WC-lyuk." },
      { tone: "real", label: "Tartás", runwayMonths: 10, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Kiszámítható megtérülés. Stabil likviditás." },
      { tone: "pess", label: "Tartalék", runwayMonths: 8, exitPenaltyHuf: 0, monthlyObligationHuf: 0, strategy: "Ha a kereslet lassul, a puffer még tart." },
    ];
  }
  if (!secondary) {
    return filled([
      { tone: "opt", label: "Bővítés", runwayMonths: 5, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "Berobbanás. Válaszd: megállj vagy tovább." },
      { tone: "real", label: "Tartás", runwayMonths: 4, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "Az első 60 nap előfinanszírozás." },
      { tone: "pess", label: "Tartalék", runwayMonths: 3, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "A 2. fordulat a lyukat dönti el." },
    ]);
  }
  if (secondary === "halt") {
    return [
      { tone: "opt", label: "Bővítés", runwayMonths: 8, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "Nincs új előfinanszírozás. A core megmarad." },
      { tone: "real", label: "Tartás", runwayMonths: 6, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "A felfutás a lekötött sort hozza." },
      { tone: "pess", label: "Tartalék", runwayMonths: 5, exitPenaltyHuf: LINE_STOCK, monthlyObligationHuf: 0, strategy: "A motor megmutatta a megállót." },
    ];
  }
  return [
    { tone: "opt", label: "Bővítés", runwayMonths: 5, exitPenaltyHuf: LINE_PUSH, monthlyObligationHuf: Math.round(LINE_STOCK * 0.4), strategy: "Még egy kapacitáskör. A keresletnek tartania kell." },
    { tone: "real", label: "Tartás", runwayMonths: 4, exitPenaltyHuf: LINE_PUSH, monthlyObligationHuf: Math.round(LINE_STOCK * 0.4), strategy: "Mélyebb előfinanszírozás." },
    { tone: "pess", label: "Tartalék", runwayMonths: 3, exitPenaltyHuf: LINE_PUSH, monthlyObligationHuf: Math.round(LINE_STOCK * 0.5), strategy: "A berobbanás wow — a lyuk is." },
  ];
}

export function resolveStrategyForkPro(
  kind: StrategyForkKind,
  primary: string | null,
  secondary: string | null,
): KahnProLive[] {
  if (kind === "inflation") return resolveInflationPlanPro(primary, secondary);
  if (kind === "market") return resolveMarketPlanPro(primary, secondary);
  return resolveNewLinePlanPro(primary, secondary);
}

export const STRATEGY_FORK_CONST = {
  coreDrain: CORE_DRAIN,
  entryCost: ENTRY_COST,
  passCogs: PASS_COGS,
  cutCogs: CUT_COGS,
  lineStock: LINE_STOCK,
  linePush: LINE_PUSH,
} as const;
