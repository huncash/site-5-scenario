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

/** Elsődleges fogalmak (UI): Case / Slot / három jövőkép / Seat / Guest. */
export const CONCEPT_HIERARCHY_HU = {
  case: "Case",
  slot: "Slot",
  pro: "Három jövőkép",
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
        "Az **Aktív Case** az asztal, amin most dolgozol. A licenc azt köti, hány ilyen asztal lehet egyszerre nyitva — nem azt, mennyi régi mentésed van. Az oktatási vagy BCP motor felvétele külön Case-t nem ad. A lezártat törölheted vagy felülírhatod, nincs díj.",
    },
    {
      id: "faq-slot",
      question: "Mi az Aktív Slot?",
      answer:
        "Az **Aktív Slot** a fül: Magán, Vállalkozás, Projekt — külön kassza ugyanazon az asztalon. A Slot a licenc kvótája; motorfelvétel új fület nem nyit. A nem használtat felülírhatod. Ha új párhuzamos hely kell, Extra Slot kell.",
    },
    {
      id: "faq-pro",
      question: "Mit jelent a három jövőkép?",
      answer:
        "Három számolás ugyanarra a múltra: pesszimista, realista, optimista — rossz / közepes / jó. Nem megmondja a jövőt. Azt mutatja: melyik ágon meddig bírja a kassza.",
    },
    {
      id: "faq-seat",
      question: "Mi a Seat?",
      answer:
        "A **Seat** az, aki írhat: tétel, terv, beállítás. A Seat a licenchez tartozik, nem a motorhoz.",
    },
    {
      id: "faq-guest",
      question: "Mi a Guest?",
      answer:
        "A **Guest** vendégfiók csak olvasói joggal (nézelődő / ellenőrző hozzáférés). A Guest a licenckeret része; motorfelvétel vendéghelyet nem nyit. Nem fogyaszt Seat-et, és nem írhatja át a modelljeidet.",
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
        "A **Case** is the complete, saved decision and simulation model. Adding an education or BCP engine does not give you an extra Case.",
    },
    {
      id: "faq-slot",
      question: "What is a Slot?",
      answer:
        "A **Slot** is a separate data area inside a Case (the top tabs). Types: Personal, Business, Project. The Slot belongs to the licence quota; adding an engine does not open a new tab. Within one Case, several Slots can run simultaneously depending on your plan.",
    },
    {
      id: "faq-pro",
      question: "What do the three futures mean?",
      answer:
        "Three calculations on the same past: pessimistic, realistic, optimistic — bad / mid / good. It does not tell the future. It shows how long the till lasts on each path — the full risk room to move, not a single number.",
    },
    {
      id: "faq-seat",
      question: "What is a Seat?",
      answer:
        "A **Seat** is who can write: postings, plan, settings. The Seat belongs to the licence, not to the engine.",
    },
    {
      id: "faq-guest",
      question: "What is a Guest?",
      answer:
        "A **Guest** only looks. The Guest is part of the licence frame; adding an engine does not open a guest place. They cannot write and they do not use a Seat. You can revoke the key any time.",
    },
  ],
};

export function conceptFaq(locale: "hu" | "en"): ConceptFaqSection {
  return locale === "en" ? CONCEPT_FAQ_EN : CONCEPT_FAQ_HU;
}
