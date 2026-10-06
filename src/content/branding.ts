/** Nyilvános márka- és PRO-grafikon szövegek. SEO/ajtó: nincs következő lépés, nincs kopogtató. */

import { CONCEPT_FAQ_HU } from "@/content/concepts";

export const HERO_POSITIONING =
  "Három pálya a böngésződben • a számok nálad maradnak";
export const HERO_MICRO =
  "Azonnal a böngészőben indul. Helyi adat, nincs felhős adatbázis. A Pro asztali early access 2027 tavaszán jön, ingyen.";
export const HERO_HEADLINE = HERO_POSITIONING;
export const HERO_SUBHEADLINE =
  "Táblázat helyett: látod, hány hónapig bírja a kassza, ha holnaptól semmi sem jön be. Magán, vállalkozás, projekt — ugyanazon az asztalon, a gépeden.";
export const HERO_SLOGAN = "Káoszból tiszta pálya.";
export const HERO_LOCAL_FIRST_LABEL = "A számok a gépeden maradnak:";
export const HERO_LOCAL_FIRST_BODY =
  "Mentés fájlba vagy QR-rel a másik gépre. Nem küldünk használatot. A kivonat (CAMT.053, CSV, XML) helyben jön be. A számok a böngésződben maradnak — nincs külső felhős adatbázis.";
export const HERO_DEMO_PREVIEW_TITLE = "További demó helyzetek";
export const HERO_DEMO_PREVIEW_BODY =
  "Előre betöltött példa. Nincs regisztráció — egy kattintással látod, merre szivárog a kassza.";
export const ABOUT_TAGLINE =
  "Három pálya magánra és vállalkozásra — a számok a gépeden maradnak";
export const ABOUT_LEAD =
  "A múltból számol: ha rosszul, ha átlagosan, ha jól alakul, meddig bírja a kassza. Családi lépéstől a céges döntésig.";

export const WHY_TITLE = "Miért hívják Szcenáriónak — túl a jó és a rossz éven";
export const WHY_LEAD =
  "A „jó év / rossz év” két szám az év végén. A szcenárió más: megmutatja, melyik hónapban fogy el a levegő — nem csak azt, mennyi marad decemberben.";
export const WHY_BODY =
  "Ha júliusban kiesik egy ügyfél vagy elromlik egy gép, látod: szeptemberben eléred-e a tőkevédelmi határt. Három pálya (rossz / közepes / jó) ugyanarra a múltra. 0 hónap = elfogyott a levegő: először a kasszát kell megfogni, nem új vágyat nyitni.";

export const PRO_CHART_CALLOUT = "Fontos: ez a grafikon nem a valóság — és nem is jóslat.";
export const PRO_CHART_WHY =
  "Ugyanaz a múlt, három számolás. Nem azt mondjuk meg, mi lesz — azt, hány hónapig bírja a kassza, ha elromlik vagy ha összejön. Család vagy cég, ugyanaz a kérdés.";

export const DAILY_OPS_TITLE = "Nemcsak indításkor";
export const DAILY_OPS_BODY =
  "A terv nem áll meg a döntésnél. A napi munkában is látod, hol szivárog a kassza — magánban és vállalkozásban.";

export const PRO_ARTICLE_TITLE = "Hogyan értelmezzük a pesszimista, realista és optimista grafikont?";
export const PRO_ARTICLE_SUMMARY =
  "Nem jóslat és nem a valóság: ugyanaz a múlt, három számolás. A rossz ágon: hány hónapig bírja a kassza. 0 hónap = elfogyott a levegő.";

export const PRO_ARTICLE_BODY = `Miért nem a valóságot látod a képernyőn?
A jövőt senki nem látja előre. Ha egy szoftver megmondja a következő negyedéves bevételedet, hazudik. A három pálya: ugyanaz a múlt, három számolás — rossz / közepes / jó.

Hogyan olvasd?
Nem hasraütés. A múltadból számol:

• A rossz ágon: hány hónapig bírja a kassza, ha semmi sem jön be.
• A jó ágon: hol kell nagyobb hely, ha összejön.

Háztartás és vállalkozás ugyanazon a mintán
Ugyanaz a három pálya. A kérdés mindig: meddig bírod, nem a „garantált” kimenet.

Működés közben is
Ha változik a környezet, a friss számokkal azonnal látod, hol kell nyúlni. 0 hónap = elfogyott a levegő: először a kasszát kell megfogni, nem új vágyat nyitni.`;

export const PRO_CHART_FAQ = {
  q: "Hogyan értelmezzük a pesszimista, realista és optimista grafikont?",
  a: "Nem a valóságot és nem jóslatot látsz. Ugyanaz a múlt, három számolás. A rossz ágon: hány hónapig bírja a kassza. 0 hónap = elfogyott a levegő: először a kasszát kell megfogni, nem új vágyat nyitni.",
} as const;

export const WHY_FAQ = {
  q: "Miért hívják Szcenáriónak — ez több, mint egy jó és egy rossz év?",
  a: "Igen. A „jó/rossz év” két szám a táblázat alján. Itt látod, melyik hónapban fogy el a levegő. A számolás a gépeden fut.",
} as const;

/** Funnel / pricing GYIK — fogalomhierarchia (Case / Slot / három jövőkép / Seat / Guest). */
export const CONCEPT_FAQ_ITEMS = CONCEPT_FAQ_HU.items.map((item) => ({
  q: item.question,
  a: item.answer.replace(/\*\*/g, ""),
}));
