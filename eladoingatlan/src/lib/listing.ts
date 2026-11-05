/**
 * Nyilvános listing — 1/1 tulajdonos, tegező egyes szám.
 * Belső padlóár / eladási kényszer / deadline soha nem szerepelhet szövegként.
 */

export const TOUR_URL = "https://my.matterport.com/show/?m=92EPXPjr6gR&ts=1";
export const PHOTO_STATE = "2026. szeptember 2.";

/** Barna faház, fehér ablakok, betonlépcső, középső beépítési szint. */
export const HERO_IMAGE = {
  src: "/hirdetes/20260902-02.jpg",
  alt: "Barna faház fehér ablakokkal, betonlépcsővel és a középső beépítési szinttel a tölgyesben",
} as const;

export const LISTING_LOGO = {
  src: "/hirdetes/logo-tolgyes.png",
  alt: "Kismaros–Börzsönyliget — ősfás tölgyes és kabin sziluett",
} as const;

export const LISTING_COORDS = {
  lat: 47.844736,
  lng: 19.000447,
} as const;

/**
 * Személyes kapcsolat — a telefonszám NEM itt van plain textben.
 * Összerakás: ListingContact (csak megjelenítés után). Nincs avatar / WhatsApp.
 */
export const LISTING_SELLER = {
  name: "Patrik",
  role: "1/1 tulajdonos · közvetlen kapcsolat",
} as const;

export type ListingVariant = "a" | "b";

/** a = novemberi kedvezmény 32,2 M · b = alapár 33 M (azonnali) */
export const VARIANT_OFFER = {
  a: {
    code: "a" as const,
    optionLabel: "Novemberi szerződéskötési kedvezmény",
    title: "Novemberi kedvezmény — 32,2 M Ft",
    short: "−800 ezer Ft",
    listPrice: "32,2 M Ft",
    deposit: "Első részlet a novemberi szerződéskötéskor (szerződés szerint)",
    possession: "Egyeztetés szerint (azonnali is lehetséges, legkorábban nov. 10.)",
    bandNote: "Alapár 33 M Ft − 800.000 Ft novemberi szerződéskötéssel és első részlettel",
    perSqm: "kb. 30,8 ezer Ft/m²",
    summary:
      "Ha novemberben kötünk szerződést és az első részlet is ekkor érkezik, a vételár 32,2 M Ft. Ugyanaz az ingatlan, közvetlenül tőlem — jutalék nélkül.",
  },
  b: {
    code: "b" as const,
    optionLabel: "Alapár",
    title: "Alapár — 33 M Ft",
    short: "33 M Ft",
    listPrice: "33 M Ft",
    deposit: "Szerződés szerint",
    possession: "Azonnali — legkorábban 2026. november 10.",
    bandNote: "Fix alapár, jutalék nélkül, közvetlenül tőlem",
    perSqm: "kb. 31,5 ezer Ft/m²",
    summary:
      "A fix alapár 33 M Ft. A ház azonnal használható; a birtokbaadás legkorábban 2026. november 10-től lehetséges.",
  },
  plotSqm: 1046,
  basePrice: "33 M Ft",
  discountPrice: "32,2 M Ft",
  discountAmount: "800.000 Ft",
  fixturesNote: "A jelenlegi egyszerű berendezés a házban marad",
  premiumNote:
    "Az árak fixek, közvetítői jutalék nincs — közvetlenül tőlem, 1/1 tulajdonostól veszed. Novemberi szerződéskötéssel és első részlettel −800.000 Ft kedvezményt adok (32,2 M Ft).",
  marketNote:
    "A foglaló és az ütemezés szabályait az adásvételi előszerződés rögzíti, ügyvéd közreműködésével.",
} as const;

export const FAQ_ITEMS = [
  {
    q: "Alkudható az ár?",
    a: "Nem, az ár fix, közvetítői jutalék nincsen — közvetlenül tőlem, 1/1 tulajdonostól veszed. Nincs mesterségesen felfújt alkupuffer.",
  },
  {
    q: "Mi marad a házban?",
    a: "A jelenlegi egyszerű berendezés a házban marad. (A tárolókból a személyes tárgyaimat elszállítom.)",
  },
  {
    q: "Mi az a novemberi kedvezmény?",
    a: "Az alapár 33 M Ft. Ha novemberben kötünk szerződést és az első részlet is ekkor érkezik, −800.000 Ft kedvezményt adok: így a vételár 32,2 M Ft.",
  },
  {
    q: "Azonnal beköltözhetek / kiadható a ház?",
    a: "Igen: a ház azonnal használható és lakható. A jelenlegi piaci helyzetben az eklektikus berendezés ellenére is azonnal kiadható hosszú távú albérlőnek — így elkerülheted az üresjáratot. Birtokbaadás legkorábban 2026. november 10-től.",
  },
  {
    q: "Hitelezhető a telek?",
    a: "Mivel belterületi építési telek, a kereskedelmi bankok lakáshitel-gyakorlata (az MNB hitelfedezeti arányokat szabályozó 32/2014. (IX. 10.) rendelete alapján) engedélyezi a telekvásárlási hitelt, de a beépítetlen jelleg miatt magasabb önerővel (jellemzően 30–50%) érdemes számolnod. Ha később lakóházat építesz rá, a telken lévő tulajdonod és annak értéke a lakóház-építési hitelnél teljes mértékben beszámítható a banki önerőbe.",
  },
  {
    q: "Van közvetítői jutalék?",
    a: "Nincs. Közvetlenül tőlem vásárolsz.",
  },
  {
    q: "Honnan tudom, hogy a jogi háttér tiszta?",
    a: "Az ingatlan Lke-4 övezeti besorolású, és a Kismaros 8/2025. önkormányzati rendelet szerinti változtatási tilalom nem érinti. Tulajdoni lapot és igazolást kérésre megmutatok, vagy a megtekintéskor átnézzük.",
  },
] as const;

export const PROCESS_STEPS = [
  {
    title: "Megtekintés",
    body: "Egyeztetett időpontban személyesen megnézed a faházat és a telket.",
  },
  {
    title: "Döntés",
    body: "Ha novemberben szerződünk (és az első részlet is ekkor érkezik), a 32,2 M Ft-os kedvezményes ár érvényes; különben a 33 M Ft-os alapár.",
  },
  {
    title: "Szerződéskötés",
    body: "Ügyvéd előtt, a választott feltételekkel — közvetlenül velem.",
  },
  {
    title: "Fizetés és birtokbaadás",
    body: "Az előszerződésben és adásvételiben rögzített ütemezés szerint (legkorábban nov. 10.).",
  },
] as const;

export const COMMUTE_TIMES = [
  { label: "Budapest XIII. kerület", value: "35–38 perc" },
  { label: "Budapest XI. kerület (csúcs)", value: "1:15–1:30 óra" },
  { label: "Budapest XI. kerület (nem csúcs)", value: "0:50–1:00 óra" },
  { label: "Vác (Nagy Lidl)", value: "15–20 perc" },
  { label: "Esztergom", value: "45 perc" },
] as const;

export const PHOTOS = [
  { src: "/hirdetes/20260902-01.jpg", alt: "A meglévő épület a tölgyesben, 2026. szeptember 2.", tall: true },
  { src: "/hirdetes/20260902-02.jpg", alt: "Lépcső a felépítményhez", tall: false },
  { src: "/hirdetes/20260902-03.jpg", alt: "Y-alakú telken belüli kavicsos parkoló és kapuk", tall: true },
  { src: "/hirdetes/20260902-04.jpg", alt: "Kőkosaras támfal és drótkerítés", tall: false },
  { src: "/hirdetes/20260902-05.jpg", alt: "Kapu a kerítésben", tall: false },
  { src: "/hirdetes/20260902-06.jpg", alt: "Kavicsos kocsibeálló a telek előtt", tall: true },
  { src: "/hirdetes/20260902-07.jpg", alt: "Ösvény a fák között", tall: false },
  { src: "/hirdetes/20260902-08.jpg", alt: "Kiskapu az erdei ösvényen", tall: false },
  { src: "/hirdetes/20260902-09.jpg", alt: "A kapu az utca felől", tall: false },
  { src: "/hirdetes/20260902-10.jpg", alt: "A kerítés és a kapu a telek felől", tall: false },
  { src: "/hirdetes/20260902-11.jpg", alt: "A beálló a kapu mellett", tall: false },
  { src: "/hirdetes/20260902-12.jpg", alt: "A nappali fa burkolattal", tall: true },
  { src: "/hirdetes/20260902-13.jpg", alt: "A cserépkályha és az átjáró a konyha felé", tall: false },
  { src: "/hirdetes/20260902-14.jpg", alt: "A szoba az ajtóból", tall: false },
  { src: "/hirdetes/20260902-15.jpg", alt: "Átnézet a konyhából", tall: false },
  { src: "/hirdetes/20260902-16.jpg", alt: "A konyha tűzhellyel és mosogatóval", tall: false },
  { src: "/hirdetes/20260902-17.jpg", alt: "Kilátás az erdőre az ablakból", tall: true },
  { src: "/hirdetes/20260902-18.jpg", alt: "A konyha sarka", tall: false },
  { src: "/hirdetes/20260902-19.jpg", alt: "A ház oldala az erdő felé", tall: false },
  { src: "/hirdetes/20260902-20.jpg", alt: "A bejárat", tall: false },
  { src: "/hirdetes/20260902-21.jpg", alt: "A felépítmény homlokzata", tall: true },
  { src: "/hirdetes/20260902-22.jpg", alt: "Kavicsos rész a fák között", tall: false },
  { src: "/hirdetes/20260902-23.jpg", alt: "Az épület a lejtőről", tall: false },
  { src: "/hirdetes/20260902-24.jpg", alt: "Az épület oldala", tall: false },
  { src: "/hirdetes/20260902-25.jpg", alt: "A telek erdős része", tall: false },
  { src: "/hirdetes/20260902-26.jpg", alt: "Melléképület a lejtőn", tall: false },
  { src: "/hirdetes/20260902-27.jpg", alt: "Kilátás a fák között a völgy felé", tall: true },
  { src: "/hirdetes/20260902-28.jpg", alt: "A lejtős telekrész", tall: false },
  { src: "/hirdetes/20260902-29.jpg", alt: "A telek a fák alatt", tall: false },
  { src: "/hirdetes/20260902-30.jpg", alt: "Ősfás rész a telken", tall: false },
] as const;

export const UTILITY_PHOTOS = [
  { src: "/hirdetes/20260902-mero.jpg", alt: "A mérőhely, felette a cserélt kismegszakítók", title: "Áram", caption: "A mérőhely. A mérő után a rendszer cserélve." },
  { src: "/hirdetes/20260902-viz.jpg", alt: "Folyó víz a konyhai csapon", title: "Víz", caption: "Folyó víz a vezetékes bekötésen." },
  {
    src: "/hirdetes/20260902-furdo.jpg",
    alt: "A csempézett fürdő. A mosdócsap fölötti tükör fölött látszik a befalazott ajtó helye.",
    title: "Csempe és vezetékes víz",
    caption:
      "A fürdő csempézve van, vezetékes vízzel. Már nem a konyhából nyílik: a mosdócsap fölötti tükör fölött látszik a befalazott ajtó helye.",
  },
] as const;
