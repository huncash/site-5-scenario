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
      id: "faq-slot",
      question: "Mi a különbség a Case és a Slot között?",
      answer:
        "A **Case** egy komplett, elmentett döntési és szimulációs modell. A **Slot** a Case-en belüli elkülönített adatterület (a felület felső lapfülei). Típusai: Magán, Vállalkozás, Projekt. Egy Case-en belül a csomagtól függően több Slot futhat párhuzamosan.",
    },
    {
      id: "faq-pro",
      question: "Mit jelent a P-R-O Szcenárió?",
      answer:
        "A **P-R-O Szcenárió** a Pesszimista (🔴), Realista (🔵) és Optimista (🟢) kimenetelek rövidítése. A motor minden Slotban és Case-ben automatikusan ezt a 3 párhuzamos görbét szimulálja, hogy ne csak egyetlen számot láss, hanem a teljes kockázati mozgásteret.",
    },
    {
      id: "faq-seat",
      question: "Hogyan működik a Seat és a Guest hozzáférés?",
      answer:
        "A **Seat** szerkesztői joggal rendelkező fiók. A **Guest** csak olvasható megosztás külső partnereknek, társtulajdonosoknak vagy könyvelőnek — nem fogyaszt Seat-et, és nem írhatja át a modelljeidet.",
    },
  ],
};

export const CONCEPT_FAQ_EN: ConceptFaqSection = {
  category: "Concepts & Capacity",
  items: [
    {
      id: "faq-slot",
      question: "What is the difference between a Case and a Slot?",
      answer:
        "A **Case** is a complete, saved decision and simulation model. A **Slot** is a separate data area inside that Case (the top tabs). Types: Personal, Business, Project. Within one Case, several Slots can run in parallel depending on your plan.",
    },
    {
      id: "faq-pro",
      question: "What does the P-R-O Scenario mean?",
      answer:
        "The **P-R-O Scenario** stands for Pessimistic (🔴), Realistic (🔵) and Optimistic (🟢) outcomes. The engine automatically simulates these three parallel curves in every Slot and Case so you see the full risk room to move — not a single number.",
    },
    {
      id: "faq-seat",
      question: "How do Seat and Guest access work?",
      answer:
        "A **Seat** is an editor account with write rights. A **Guest** is a read-only pass for external partners, co-owners or an accountant — it does not consume a Seat and cannot change your models.",
    },
  ],
};

export function conceptFaq(locale: "hu" | "en"): ConceptFaqSection {
  return locale === "en" ? CONCEPT_FAQ_EN : CONCEPT_FAQ_HU;
}
