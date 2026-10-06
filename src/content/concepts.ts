/** Platform fogalomhierarchia — GYIK / tudásbázis / marketing közös forrás. */

export type ConceptFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ConceptFaqSection = {
  category: string;
  items: ConceptFaqItem[];
};

/** Elsődleges fogalmak (UI): Case / Slot / P-R-O / Seat / Guest. */
export const CONCEPT_HIERARCHY_HU = {
  case: "Case",
  slot: "Slot",
  pro: "P-R-O Szcenárió",
  seat: "Seat",
  guest: "Guest",
} as const;

export const CONCEPT_FAQ_HU: ConceptFaqSection = {
  category: "Fogalmak & Kapacitások",
  items: [
    {
      id: "faq-case",
      question: "Mi az Aktív Case?",
      answer:
        "Az **Aktív Case** az asztal, amin most dolgozol. A licenc azt köti, hány ilyen asztal lehet egyszerre nyitva — nem azt, mennyi régi mentésed van. A lezártat törölheted vagy felülírhatod, nincs díj.",
    },
    {
      id: "faq-slot",
      question: "Mi az Aktív Slot?",
      answer:
        "Az **Aktív Slot** a fül: Magán, Vállalkozás, Projekt — külön kassza ugyanazon az asztalon. A nem használtat felülírhatod. Ha új párhuzamos hely kell, bővíteni kell.",
    },
    {
      id: "faq-pro",
      question: "Mit jelent a P-R-O Szcenárió?",
      answer:
        "A **P-R-O** három gomb: Pesszimista, Realista, Optimista — rossz / közepes / jó. Ugyanaz a múlt, három számolás. Nem megmondja a jövőt. Azt mutatja: melyik ágon meddig bírja a kassza.",
    },
    {
      id: "faq-seat",
      question: "Mi a Seat?",
      answer:
        "A **Seat** szerkesztői fiók (teljes szerkesztési és modelligazítási jogkörrel).",
    },
    {
      id: "faq-guest",
      question: "Mi a Guest?",
      answer:
        "A **Guest** vendégfiók csak olvasói joggal (nézelődő / ellenőrző hozzáférés). Nem fogyaszt Seat-et, és nem írhatja át a modelljeidet.",
    },
  ],
};

export const CONCEPT_FAQ_EN: ConceptFaqSection = {
  category: "Concepts & Capacity",
  items: [
    {
      id: "faq-case",
      question: "What is a Case?",
      answer:
        "A **Case** is the complete, saved decision and simulation model.",
    },
    {
      id: "faq-slot",
      question: "What is a Slot?",
      answer:
        "A **Slot** is a separate data area inside a Case (the top tabs). Types: Personal, Business, Project. Within one Case, several Slots can run simultaneously depending on your plan.",
    },
    {
      id: "faq-pro",
      question: "What does the P-R-O Scenario mean?",
      answer:
        "The **P-R-O Scenario** stands for Pessimistic · Realistic · Optimistic: the three simultaneously running simulation curves in every Slot — the full risk room to move, not a single number.",
    },
    {
      id: "faq-seat",
      question: "What is a Seat?",
      answer:
        "A **Seat** is an editor account (full editing and model-alignment rights).",
    },
    {
      id: "faq-guest",
      question: "What is a Guest?",
      answer:
        "A **Guest** is a guest account with read-only access (viewer / auditor). It does not consume a Seat and cannot change your models.",
    },
  ],
};

export function conceptFaq(locale: "hu" | "en"): ConceptFaqSection {
  return locale === "en" ? CONCEPT_FAQ_EN : CONCEPT_FAQ_HU;
}
