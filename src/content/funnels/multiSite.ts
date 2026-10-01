import { buildTierOffers, PRO_MULTIUSER_BULLET, PRO_P2P_SYNC_BULLET, type TierCopy, type TierId } from "@/content/pricing/tiers";

const packages = {
  starter: {
    tagline: "Belépő csomag: azonnali rend a kasszában.",
    description:
      "Ha most akarsz tiszta képet és egy működő rutint: cash‑flow, kategóriák, tervezés — mindezt a saját eszközödön.",
    includes: [
      "1× Magán + 1× Vállalkozás + 1× Projekt alap nézet (PLAN/DO értelmesen működjön)",
      "Banki kivonat import (alap hatékonyság)",
      "Lokális mentés / export (titkosítva)",
    ],
    limits: [
      "Új munkaterület hozzáadása: nincs (csak az alap 1‑1‑1)",
      "Használat: 1 eszköz (multi‑device / csapat nélkül)",
    ],
  },
  pro: {
    tagline: "Működés- és döntéstámogatás üzemi szinten.",
    description:
      "Ha már nem csak követni akarod a költést, hanem rendszert építesz: import‑first, Lean/MUDA jelzések, több munkaterület.",
    includes: [
      "Vállalkozási cash‑flow + import‑first workflow",
      "Lean / MUDA elemzések (vizuális jelzések és fókuszok)",
      "Multi‑site fa‑struktúra (több egység és projekt kezelés a napi munkában)",
      PRO_MULTIUSER_BULLET,
      PRO_P2P_SYNC_BULLET,
    ],
    limits: ["Slotok száma: rugalmas (nem korlátlan)"],
  },
  expert: {
    tagline: "Konszolidáció több egységre, gyors beavatkozásokkal.",
    description:
      "Hálózati üzemeltetőknek: több telephely, több kassza, központi kontroll. A cél: gyorsan látni a driftet és lépni ACT-ben.",
    includes: [
      "Korlátlan slotok (egységek, projektek, nézetek)",
      "Többegységes konszolidáció és összevetés",
      "Fejlett ACT beavatkozási modulok (operátori döntés támogatás)",
      "Prioritásos módszertani sablonok (multi‑site rutinok)",
    ],
    limits: ["Korlátok: a módszertan és a valós működés szab határt, nem a csomag."],
  },
} satisfies Record<TierId, TierCopy>;

export const MULTISITE_FUNNEL = {
  hero: {
    eyebrow: "Multi‑Site / Hálózati vállalkozások",
    title: "Irányítsd a többtelephelyes költségeket egy kézből, adatszivárgási kockázat nélkül.",
    subtitle:
      "Konszolidált cash‑flow, egység‑szintű drift jelzés, és Lean/MUDA fókusz — mindez a te eszközödön, szerver‑oldali adattárolás nélkül.",
    primaryCta: "Segédeszköz ingyenes kipróbálása",
    secondaryCta: "Csomagok megtekintése",
  },
  proofBullets: [
    "Több egység → egy áttekintés: központi beszerzés és telephelyek szétcsúszásának korai jelzése",
    "Import‑first: banki kivonatból indul, nem kézi adatpötyögésből",
    "Local‑first: nincs regisztráció, nincs telemetria, nincs szerver‑oldali adatbázis",
  ],
  demoTeaser: {
    title: "Élő multi‑site demó (preloadolt állapot)",
    body:
      "Egy vendéglátó lánc mintáján látod a konszolidált kasszát, a telephely‑driftet és a Lean/MUDA jelzéseket. 1 kattintás, és már fut is — telepítés nélkül.",
    cta: "Megnyitom a multi‑site demót",
  },
  tiers: {
    defaultSelected: "pro" as TierId,
    note:
      "A csomagok ebben a verzióban tájékoztató jellegűek (marketing). A termék core motorját nem bővítjük: a funnel csak wrapper.",
  },
  packages,
  tierOffers: buildTierOffers(packages),
  faq: [
    {
      q: "Hol tárolódnak az adatok? Van szerver oldali adatbázis?",
      a: "Nincs szerver oldali adatbázis. Az adatok a te eszközödön maradnak (local‑first), titkosítva. Mentés/visszaállítás lokális export/importtal működik.",
    },
    {
      q: "Működik offline? Mi van, ha nincs net?",
      a: "Igen. A rendszer offline‑first: a fő funkciók internet nélkül is mennek. A hálózat csak kényelmi extra, nem előfeltétel.",
    },
    {
      q: "Multi‑site esetben hogyan látom egyben és külön a telephelyeket?",
      a: "A rendszer több munkaterületet (egység/projekt) kezel, és konszolidált nézetben is összerendez. Így látszik az egység‑szintű költés és a központi kép egyszerre.",
    },
    {
      q: "Kell regisztráció? Követitek a használatot?",
      a: "Nem. Nincs regisztráció és nincs használati telemetria. A cél: a működésed a te gépeden maradjon.",
    },
    {
      q: "Csapatban több eszközön is használható?",
      a: "Igen: több eszköz összeköthető, így a szinkron export/import helyett P2P módon történhet. (A csomagokban ezt marketingként jelezzük; a funnel nem implementál új korlátozást.)",
    },
  ],
} as const;

