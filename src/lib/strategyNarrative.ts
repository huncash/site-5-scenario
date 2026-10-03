import { MASTER_BASELINE } from "@/lib/masterBaseline";

export type NarrativeTone = "opt" | "real" | "pess";

export type NarrativeChoice = {
  id: string;
  label: string;
  tone: NarrativeTone;
  lead: string;
  next?: string | null;
};

export type NarrativeStep = {
  id: string;
  month: number;
  question: string;
  choices: NarrativeChoice[];
};

export type NarrativeClimax = {
  title: string;
  tone: NarrativeTone;
  cashHuf: number;
  runwayMonths: number;
  beMonth: number | null;
  lockIn: string;
  wow: string;
};

export type NarrativeStory = {
  id: string;
  title: string;
  root: string;
  startId: string;
  steps: NarrativeStep[];
};

function formatHuf(n: number) {
  return `${Math.round(n).toLocaleString("hu-HU")} Ft`;
}

export function newLineStory(): NarrativeStory {
  return {
    id: "new-line",
    title: "Új termékvonal / kapacitásbővítés",
    root: MASTER_BASELINE.businessAlias,
    startId: "path",
    steps: [
      {
        id: "path",
        month: 0,
        question: "Melyik párhuzamos ágon viszed a vonalat?",
        choices: [
          {
            id: "real",
            label: "Realista — tervezett ütem",
            tone: "real",
            lead: "Stabil megrendelés, kiszámítható megtérülés. A core viszi a fixet.",
            next: null,
          },
          {
            id: "opt",
            label: "Optimista — piaci berobbanás",
            tone: "opt",
            lead: "Hirtelen kereslet. Az alapanyagot és a kapacitást előre kell finanszírozni.",
            next: "stop",
          },
          {
            id: "pess",
            label: "Pesszimista — kereslet / beszerzés",
            tone: "pess",
            lead: "Csökkenő forgalom vagy dráguló input. Runway és Lean vágás.",
            next: "lean",
          },
        ],
      },
      {
        id: "stop",
        month: 2,
        question: "A kereslet berobbant. Tovább expanzálsz, vagy megálljt parancsolsz a likviditási csapdánál?",
        choices: [
          {
            id: "halt",
            label: "Megállj — ne finanszírozd előre a következő sort",
            tone: "opt",
            lead: "A wow-faktor: a motor megmutatja, hol kell megállni, mielőtt a WC megeszi a core-t.",
            next: null,
          },
          {
            id: "push",
            label: "Tovább — még egy kapacitáskör",
            tone: "pess",
            lead: "Még mélyebb előfinanszírozás. A felfutás később hozza vissza — ha kitart a kereslet.",
            next: null,
          },
        ],
      },
      {
        id: "lean",
        month: 2,
        question: "Lean muda-írtás most, vagy vársz a következő rendelésre?",
        choices: [
          {
            id: "cut",
            label: "Vágás most — változó pazarlás ki",
            tone: "real",
            lead: "Runway nő. A fizetésképtelenség elkerülhető a core pufferrel.",
            next: null,
          },
          {
            id: "wait",
            label: "Várunk — hátha jön rendelés",
            tone: "pess",
            lead: "A burn marad. A runway hónapokban fogy.",
            next: null,
          },
        ],
      },
    ],
  };
}

export function loanWhatIfStory(): NarrativeStory {
  return {
    id: "loan-whatif",
    title: "Komplex stratégiai projekt — Mi lenne, ha…",
    root: MASTER_BASELINE.businessAlias,
    startId: "credit",
    steps: [
      {
        id: "credit",
        month: 0,
        question: "Felveszünk-e külső hitelt a fejlesztéshez, vagy organikus növekedésre építünk?",
        choices: [
          {
            id: "organic",
            label: "Organikus",
            tone: "real",
            lead: "Nincs kamat, nincs kötbér. Lassabb felfutás, a core tartja a házat.",
            next: null,
          },
          {
            id: "loan",
            label: "Külső hitel",
            tone: "opt",
            lead: "Gyorsabb kapacitás. A következő fordulat a konstrukciót választja.",
            next: "terms",
          },
        ],
      },
      {
        id: "terms",
        month: 1,
        question: "Melyik hitelkonstrukció?",
        choices: [
          {
            id: "cheap",
            label: "A — olcsóbb, kötbéres",
            tone: "opt",
            lead: "Alacsonyabb kamat, de 6 hónapig nem léphetsz ki kötbér nélkül.",
            next: null,
          },
          {
            id: "flex",
            label: "B — drágább, rugalmas",
            tone: "real",
            lead: "Magasabb kamat, előtörlesztés szabad. Stop-loss él.",
            next: null,
          },
        ],
      },
    ],
  };
}

export function storyById(id: "new-line" | "loan-whatif"): NarrativeStory {
  return id === "loan-whatif" ? loanWhatIfStory() : newLineStory();
}

export function stepById(story: NarrativeStory, id: string): NarrativeStep | null {
  return story.steps.find((s) => s.id === id) ?? null;
}

export function walkedSteps(story: NarrativeStory, path: string[]) {
  const out: Array<{ step: NarrativeStep; picked: NarrativeChoice | null }> = [];
  let id: string | null = story.startId;
  let i = 0;
  while (id) {
    const step = stepById(story, id);
    if (!step) break;
    const picked = step.choices.find((c) => c.id === path[i]) ?? null;
    out.push({ step, picked });
    if (!picked) break;
    id = picked.next ?? null;
    i += 1;
  }
  return out;
}

export function chooseAt(path: string[], stepIndex: number, choiceId: string): string[] {
  return [...path.slice(0, stepIndex), choiceId];
}

export function resolveNarrative(storyId: "new-line" | "loan-whatif", path: string[]): NarrativeClimax {
  const inc = MASTER_BASELINE.monthlyRevenueNet;
  const cash0 = MASTER_BASELINE.startingCashHuf;
  const ids = path;

  if (storyId === "loan-whatif") {
    if (ids.includes("organic")) {
      return {
        title: "Organikus végkifejlet",
        tone: "real",
        cashHuf: cash0 + Math.round(inc * 0.18),
        runwayMonths: 11,
        beMonth: 9,
        lockIn: "Nincs kötbér, nincs kamat. A core ritmusa.",
        wow: "A szál önfinanszírozott. Lassabb, de a törzs nem adósodik.",
      };
    }
    if (ids.includes("cheap")) {
      return {
        title: "Olcsó hitel + kötbér",
        tone: "opt",
        cashHuf: cash0 + Math.round(inc * 0.42) - 180_000,
        runwayMonths: 8,
        beMonth: 5,
        lockIn: "6 hónap kötbér. Kilépés = 2 havi törlesztés.",
        wow: "Gyors klímax, de a szál bezár. A motor számolja a kilépési árat.",
      };
    }
    if (ids.includes("flex")) {
      return {
        title: "Rugalmas hitel",
        tone: "real",
        cashHuf: cash0 + Math.round(inc * 0.22) - 310_000,
        runwayMonths: 7,
        beMonth: 7,
        lockIn: "Előtörlesztés szabad. Stop-loss él.",
        wow: "Drágább szál, de bármikor lezárható — a döntés nem végleges.",
      };
    }
    return {
      title: "Hitelág — konstrukció nélkül",
      tone: "opt",
      cashHuf: cash0,
      runwayMonths: 6,
      beMonth: null,
      lockIn: "Válaszd az A vagy B konstrukciót.",
      wow: "A következő fordulat a kötöttséget dönti el.",
    };
  }

  if (ids.includes("push")) {
    return {
      title: "Túlzott expanzió",
      tone: "pess",
      cashHuf: cash0 - Math.round(inc * 0.62),
      runwayMonths: 3,
      beMonth: 10,
      lockIn: "A következő sor előre viszi a készpénzt.",
      wow: "A berobbanás wow — a lyuk is. Itt kellett volna megállni.",
    };
  }
  if (ids.includes("halt")) {
    return {
      title: "Megállj a csapdánál",
      tone: "opt",
      cashHuf: cash0 - Math.round(inc * 0.18),
      runwayMonths: 6,
      beMonth: 6,
      lockIn: "Nincs új előfinanszírozás. A felfutás a már lekötött sort hozza.",
      wow: "A motor megmutatta a megállót — a core megmarad.",
    };
  }
  if (ids.includes("cut")) {
    return {
      title: "Lean vágás — fizetőképesség",
      tone: "real",
      cashHuf: cash0 - Math.round(inc * 0.08),
      runwayMonths: 8,
      beMonth: 8,
      lockIn: "Változó muda ki. A core puffer tart.",
      wow: "A pesszimista ág nem csőd, ha időben vágsz.",
    };
  }
  if (ids.includes("wait")) {
    return {
      title: "Várakozás — fogyó runway",
      tone: "pess",
      cashHuf: cash0 - Math.round(inc * 0.38),
      runwayMonths: 3,
      beMonth: null,
      lockIn: "A burn marad. 3 hónap a fizetésképtelenségig.",
      wow: "A rendszer azonnal számolja, mennyi tartalékidő maradt.",
    };
  }
  if (ids.includes("real")) {
    return {
      title: "Tervezett ütem",
      tone: "real",
      cashHuf: cash0 + Math.round(inc * 0.12),
      runwayMonths: 10,
      beMonth: 7,
      lockIn: "Stabil likviditás. Nincs előre hozott WC-lyuk.",
      wow: "Kiszámítható megtérülés — a core ritmusa.",
    };
  }
  if (ids.includes("opt")) {
    return {
      title: "Berobbanás — még nem döntöttél",
      tone: "opt",
      cashHuf: cash0 - Math.round(inc * 0.28),
      runwayMonths: 4,
      beMonth: 8,
      lockIn: "Az első 60 nap előfinanszírozás.",
      wow: "A következő lépés: megállsz-e a csapdánál.",
    };
  }
  if (ids.includes("pess")) {
    return {
      title: "Pesszimista sáv — Lean előtt",
      tone: "pess",
      cashHuf: cash0 - Math.round(inc * 0.22),
      runwayMonths: 5,
      beMonth: null,
      lockIn: "Kereslet esik vagy az input drágul.",
      wow: "A következő: vágás vagy várakozás.",
    };
  }
  return {
    title: "Válassz ágat",
    tone: "real",
    cashHuf: cash0,
    runwayMonths: 8,
    beMonth: null,
    lockIn: "A törzs adott. A szálat te viszed.",
    wow: "Három párhuzamos jövő — nem jóslat, elágazás.",
  };
}

export function formatNarrativeCash(n: number) {
  return formatHuf(n);
}
