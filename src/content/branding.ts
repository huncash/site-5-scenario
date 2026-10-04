/** Nyilvános márka- és PRO-grafikon szövegek. SEO/ajtó: nincs következő lépés, nincs kopogtató. */

import { CONCEPT_FAQ_HU } from "@/content/concepts";

export const HERO_POSITIONING =
  "Kockázati mozgástér-modellezés • 100%-ban lokális adatszuverenitás";
export const HERO_MICRO =
  "A modell a böngésződben fut: a döntési adat nem kötelezően felhőbe kerül.";
export const HERO_HEADLINE = HERO_POSITIONING;
export const HERO_SUBHEADLINE =
  "Kaotikus táblázatok és bizonytalan, növekvő költségű felhős szoftverek helyett: helyben futó, szuverén számítás — magán döntésektől a vállalkozási stratégiáig.";
export const HERO_SLOGAN = "Káoszból tiszta pálya.";
export const HERO_LOCAL_FIRST_LABEL = "100%-ban lokális adatszuverenitás:";
export const HERO_LOCAL_FIRST_BODY =
  "Adataid a böngészőben maradnak. Mentés fájl-exporttal vagy eszközök közötti (QR) szinkronnal. Nulla telemetria, nulla külső szerverfüggőség, teljes fizikai kontroll.";
export const HERO_DEMO_PREVIEW_TITLE = "További demó helyzetek";
export const HERO_DEMO_PREVIEW_BODY =
  "Interaktív előnézet: a motor egy előre betöltött helyzeten fut. Nincs regisztráció — egy kattintással átláthatod a cash-flow fókuszokat és a likviditási mutatókat.";
export const ABOUT_TAGLINE =
  "Egyetemes döntéstámogatás: kockázati mozgástér-modellezés magán- és vállalkozási helyzetekre";
export const ABOUT_LEAD =
  "A múlt adataira épülő, determinisztikus szórás- és hibahatár-számítás — háztartási beruházástól a vállalkozási stratégiáig.";

export const WHY_TITLE = "Táblázat-káosz helyett: helyben futó mozgástér-számítás";
export const WHY_LEAD =
  "A legtöbb döntéstámogató eszköz vagy egy kaotikus táblázatba zár, vagy felhős előfizetésbe, amelynek költsége és adatútja nem látszik előre. Egy „jó” és egy „rossz” év begépelése nem kockázati modell.";
export const WHY_BODY =
  "A Szcenárió kockázati mozgástér-modellezést ad: a múlt adataiból determinisztikus szórás- és hibahatár-számítással rajzol pályát. Ugyanaz a motor szolgálja a háztartási döntéseket (ingatlanvásárlás, karrierváltás) és a vállalkozási stratégiákat — 100%-ban lokális adatszuverenitással és kiszámítható, fix költségszerkezettel.";

export const PRO_CHART_CALLOUT = "Fontos: ez a grafikon nem a valóság — és nem is jóslat.";
export const PRO_CHART_WHY =
  "Determinisztikus szórás- és hibahatár-számítás a múltbeli adatokból: nem azt mondjuk meg, mi lesz, hanem milyen kockázati mozgástered van, ha a pálya elromlik vagy felpörög — legyen szó családi beruházásról vagy vállalkozási fejlesztésről.";

export const DAILY_OPS_TITLE = "Nemcsak indításkor";
export const DAILY_OPS_BODY =
  "A tervezés gyakran megáll a döntés pillanatánál. A rendszer a Lean eszközökkel a napi működtetésben, a finomhangolásban és a szűk keresztmetszetek kezelésében is végigkísér — magán háztartásban és vállalkozásban egyaránt.";

export const PRO_ARTICLE_TITLE = "Hogyan értelmezzük a Pesszimista – Realista – Optimista (PRO) grafikont?";
export const PRO_ARTICLE_SUMMARY =
  "A PRO-grafikon nem jóslat és nem a valóság: determinisztikus szórás- és hibahatár-számítással rajzol mozgásteret a múlt adataidból — tartalék- és kapacitásjelzéssel.";

export const PRO_ARTICLE_BODY = `Miért nem a valóságot látod a képernyőn?
A jövőt senki nem látja előre. Ha egy szoftver azt állítja, hogy pontosan megmondja a következő negyedéves bevételedet, az téved. A PRO-grafikon szimulációs modell: a múltbeli adataidra, a szezonális mintákra és a beállított paraméterekre építve rajzol kockázati mozgásteret.

Hogyan lesz ebből pontosabb becslés?
Determinisztikus szórás- és hibahatár-számítás — nem hasraütés:

• Csökkenti a szórási hibát: kizárja a szélsőséges érzelmi döntéseket (vak optimizmus vagy bénító pesszimizmus).
• Kifejezi a kockázatot: a pesszimista szálon mennyi tartalék marad, az optimista szálon mekkora kapacitás kell.

Egyetemes minta: háztartás és vállalkozás párhuzamosan
Ugyanaz a három pálya modellezheti a családi beruházást (pl. ingatlan) és a vállalkozási fejlesztést — a kérdés mindig a mozgástér, nem a „garantált” kimenet.

Működés közben is
Ha változik a környezet, a friss adatokkal azonnal látszik, hol kell beavatkozni. Nem elmélet: döntési rutin előre kalkulált paraméterek mentén.`;

export const PRO_CHART_FAQ = {
  q: "Hogyan értelmezzük a Pesszimista – Realista – Optimista (PRO) grafikont?",
  a: "Nem a valóságot és nem jóslatot látsz. Determinisztikus szórás- és hibahatár-számítás a múltbeli adataidból: kockázati mozgástér, pesszimista tartalék vs. optimista kapacitásigény. Friss adatnál azonnal látszik, hol kell beavatkozni.",
} as const;

export const WHY_FAQ = {
  q: "Miért hívják Szcenáriónak — ez több, mint egy jó és egy rossz év?",
  a: "Igen. A „jó/rossz év” találgatás kevés. Itt kockázati mozgástér-modellezés fut determinisztikus szórás- és hibahatár-számítással, 100%-ban lokális adatszuverenitással — háztartástól a vállalkozásig, a napi működtetésben is.",
} as const;

/** Funnel / pricing GYIK — fogalomhierarchia (Case / Slot / P-R-O / Seat / Guest). */
export const CONCEPT_FAQ_ITEMS = CONCEPT_FAQ_HU.items.map((item) => ({
  q: item.question,
  a: item.answer.replace(/\*\*/g, ""),
}));
