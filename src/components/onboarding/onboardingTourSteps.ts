"use client";

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  bullets?: string[];
};

export const ONBOARDING_TOUR_STEPS: OnboardingStep[] = [
  {
    id: "welcome-shortcuts",
    title: "Üdvözlés & Gyorsbillentyűk",
    body: "A Szcenárió desktopon gyors: billentyűzettel pár másodperc alatt tudsz váltani, menteni és forgatni a PDCA fókuszt. A gyorsbillentyűk listáját a felső sávban, a hamburger mellett találod (⌨).",
    bullets: [
      "Mentés: Ctrl/Cmd + S",
      "Alsó fülek váltása: Alt + Shift + ← / →",
      "Felső munkaterek váltása: PageUp / PageDown (vagy Alt+Shift+PageUp/PageDown; Ctrl+Alt+←/→ fallback)",
      "Szumma toggle: Alt + Shift + End",
      "PDCA negyed forgatás: ↓ (vagy Alt + Shift + ↓ fallback)",
    ],
  },
  {
    id: "anatomy",
    title: "A felület anatómiája",
    body: "A felső sávban van a profil és a gyorsmenü (hamburger). A középen lévő PDCA tárcsa a fókuszváltás (PLAN→DO→CHECK→ACT) vizuális „iránytűje”.",
    bullets: [
      "Globális kereső: a felső sáv keresőmezője (tételek / célok / törzsadatok)",
      "Hamburger menü: extra funkciók, eszközök, beállítások és ez a bemutató",
      "Nézet: split / full elrendezés (ha elérhető a nézetvezérlő)",
    ],
  },
  {
    id: "pdca",
    title: "A PDCA ciklus lényege",
    body: "A szimuláció lényege, hogy ne csak rögzíts, hanem döntést hozz: PLAN (terv) → DO (működés) → CHECK (eltérés) → ACT (beavatkozás).",
    bullets: [
      "PLAN: terv és célok — mit szeretnél elérni",
      "DO: a napi működés tételei — mi történik valójában",
      "CHECK: eltérés és mintázatok — hol csúszik el",
      "ACT: beavatkozás — mit változtatsz, hogy a következő kör jobb legyen",
    ],
  },
  {
    id: "demo",
    title: "A demó adatok felfedezése",
    body: "Most egy előre betöltött, biztonságos demó állapotot látsz. Nem kell banki import ahhoz, hogy értelmet kapjon a felület — a lényeg azonnal látható.",
    bullets: ["Minden helyben fut (local‑first)", "A demó csak minta — nem „éles” adat", "Bármikor válthatsz másik esetre/profilra"],
  },
  {
    id: "what-if",
    title: "Interaktív módosítások (What‑if)",
    body: "Állíts értékeket, próbálj ki alternatívákat és nézd meg azonnal a hatást. A cél: gyors „mi lenne, ha” döntési visszajelzés a böngészőben.",
    bullets: ["Csúszkák / mezők: finomhangolás", "Grafikonok: azonnali visszacsatolás", "Fókusz: PDCA‑ban lépj tovább, ne ragadj a listákban"],
  },
  {
    id: "security-close",
    title: "Adatkezelés & következő 2 perc",
    body: "Zárásként két praktikus dolog: hogyan ments, és hol tudsz visszajönni ide segítségért. Nem ígéret — konkrét műveletek.",
    bullets: [
      "Mentés: Hamburger → Gyors mentés (.json) vagy Beállítások → Mentés betöltése…",
      "Eszköz hozzáadása: Hamburger → Eszköz hozzáadása QR-rel (ha több eszközön dolgozol)",
      "Segítség: Hamburger → Tudásbázis / GYIK",
      "Demó váltás: Hamburger → Másik eset",
    ],
  },
];

