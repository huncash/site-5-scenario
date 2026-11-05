"use client";

import {
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  FileText,
  House,
  MapPin,
  Menu,
  Ruler,
  Thermometer,
  Trees,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";

import { EnquiryForm } from "@/components/listing/EnquiryForm";
import {
  ListingMobileContact,
  ListingPhoneProvider,
  ListingSellerCard,
  trackListingCta,
} from "@/components/listing/ListingContact";
import { ListingTopoMap } from "@/components/listing/ListingTopoMap";
import {
  COMMUTE_TIMES,
  FAQ_ITEMS,
  HERO_IMAGE,
  LISTING_LOGO,
  PHOTO_STATE,
  PHOTOS,
  PROCESS_STEPS,
  TOUR_URL,
  UTILITY_PHOTOS,
  VARIANT_OFFER,
} from "@/lib/listing";

const NAV = [
  { href: "#elhelyezkedes", label: "Elhelyezkedés & Mikroklíma" },
  { href: "#tilalom", label: "Övezeti besorolás" },
  { href: "#kozmuvek-epulet", label: "Közművek & Épület" },
  { href: "#seta", label: "3D Séta" },
  { href: "#galeria", label: "Galéria" },
  { href: "#azaras", label: "Árazás" },
  { href: "#kapcsolat", label: "Kapcsolat" },
] as const;

type Lightbox =
  | { kind: "gallery"; index: number }
  | { kind: "utility"; index: number }
  | null;

function MapFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex justify-center">
      <div className="w-full max-w-[800px] overflow-hidden rounded-lg border border-[#d4c9b5] bg-[#f7f1e6]">
        {children}
      </div>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6]">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-[#241f18] sm:text-base">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[#0f2e1f] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="border-t border-[#d4c9b5] px-5 py-4 text-sm leading-relaxed text-[#5a5146]">
          {answer}
        </div>
      ) : null}
    </div>
  );
}

export function PropertyLanding() {
  const [open, setOpen] = useState<Lightbox>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (open === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
      if (open?.kind !== "gallery") return;
      if (event.key === "ArrowRight") {
        setOpen({ kind: "gallery", index: (open.index + 1) % PHOTOS.length });
      }
      if (event.key === "ArrowLeft") {
        setOpen({ kind: "gallery", index: (open.index - 1 + PHOTOS.length) % PHOTOS.length });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const lightboxSrc =
    open?.kind === "gallery"
      ? PHOTOS[open.index]
      : open?.kind === "utility"
        ? UTILITY_PHOTOS[open.index]
        : null;

  function closeMenu() {
    setMenuOpen(false);
  }

  function scrollToTop(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenu();
  }

  return (
    <ListingPhoneProvider>
      <div id="teteje" className="overflow-x-clip bg-[#efe8db] text-[#241f18]">
        <header className="sticky top-0 z-40 border-b border-[#d4c9b5] bg-[#efe8db]/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
            <a
              href="#teteje"
              onClick={scrollToTop}
              className="inline-flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-wide text-[#0f2e1f] hover:opacity-90"
              aria-label="Vissza az oldal tetejére"
            >
              <img
                src={LISTING_LOGO.src}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 object-contain"
                decoding="async"
              />
              <span className="truncate">Kismaros · Börzsönyliget</span>
            </a>
            <nav className="hidden max-w-4xl flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm lg:flex" aria-label="Főmenü">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={
                    item.href === "#kapcsolat"
                      ? "rounded-md bg-[#e8b84a] px-3 py-1.5 font-semibold text-[#241f18]"
                      : "hover:underline"
                  }
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-[#d4c9b5] bg-[#f7f1e6] p-2 text-[#241f18] lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="listing-mobile-nav"
              aria-label={menuOpen ? "Menü bezárása" : "Menü megnyitása"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
          {menuOpen ? (
            <nav
              id="listing-mobile-nav"
              className="border-t border-[#d4c9b5] bg-[#efe8db] px-4 py-3 lg:hidden"
              aria-label="Mobilmenü"
            >
              <ul className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={closeMenu}
                      className={
                        item.href === "#kapcsolat"
                          ? "mt-1 block rounded-md bg-[#e8b84a] px-3 py-2.5 text-sm font-semibold text-[#241f18]"
                          : "block rounded-md px-3 py-2.5 text-sm hover:bg-[#f7f1e6]"
                      }
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
              <ListingMobileContact onNavigate={closeMenu} />
            </nav>
          ) : null}
        </header>

        <section className="relative min-h-[78vh] overflow-hidden bg-[#0f2e1f] text-white">
          <img
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            className="absolute inset-0 h-full w-full scale-105 object-cover object-[48%_42%]"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(15, 46, 31, 0.58)" }} aria-hidden />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(10, 33, 22, 0.92) 0%, rgba(15, 46, 31, 0.55) 45%, rgba(15, 46, 31, 0.35) 100%)",
            }}
            aria-hidden
          />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 py-12 md:min-h-[75vh] md:px-6 md:py-16 lg:min-h-[78vh]">
            <div className="max-w-3xl rounded-lg bg-[#0f2e1f]/88 p-5 shadow-[0_8px_40px_rgba(15,46,31,0.45)] md:p-7">
              <p className="inline-flex rounded-md border border-[#e8b84a]/70 bg-[#1a4530]/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#e8b84a] sm:text-sm">
                Novemberi szerződéskötési kedvezmény: −{VARIANT_OFFER.discountAmount}
              </p>
              <h1 className="mt-4 text-3xl font-medium leading-tight text-[#f7f1e6] md:text-4xl lg:text-5xl">
                Erdei faház a Börzsönyben, 1046&nbsp;m² privát telken
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[#f7f1e6]/95 sm:text-lg">
                Kismaros-Börzsönyliget, zsákutca vége, a Duna–Ipoly Nemzeti Park szélén. Csend, árnyék, nyugalom, fix
                áron, jutalék nélkül.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#f7f1e6]/85">
                Alapár: {VARIANT_OFFER.basePrice}. Novemberi szerződéskötéssel és első részlettel:{" "}
                <strong className="font-semibold text-[#e8b84a]">{VARIANT_OFFER.discountPrice}</strong>.
              </p>
              <a
                href="#kapcsolat"
                onClick={() => trackListingCta("hero_viewing")}
                className="mt-6 inline-flex rounded-md bg-[#e8b84a] px-5 py-3 text-center text-sm font-semibold text-[#241f18]"
              >
                Megtekintést kérek
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:px-6 md:py-16 lg:py-20" id="elhelyezkedes">
          <h2 className="text-3xl font-medium">Miről szól ez a hely?</h2>
          <p className="mt-2 text-sm uppercase tracking-[0.14em] text-[#6b6154]">Mikroklíma &amp; szomszédság</p>
          <div className="mt-6 max-w-3xl space-y-4 text-sm leading-relaxed text-[#5a5146] sm:text-base">
            <p>
              Itt nincs szomszéd az ablakodban, és nincs átmenő forgalom. A telek a Hörcsög utca végén áll, az erdő
              szélén. Nyáron az erdei mikroklíma átlagosan 4&nbsp;°C-kal hűvösebb, mint a Duna-parton; télen a
              cserépkályha tölti be a házat melegével.
            </p>
            <p>
              A Hörcsög utcában ezen az oldalon az elhelyezkedés ideális: az előtted lévő szomszédban állandó lakó él,
              míg a telek után lévő további két ingatlan tulajdonosai csak évente néhány alkalommal tartózkodnak kint.
              Ez biztosítja a zavartalan nyugalmat, de elkerüli az izolációt.
            </p>
            <p>
              A ház egyszerű és szerényen berendezett felvonulási épület / hétvégi ház. Azonnal használható, de nem
              kész luxuslakás: a belső hangulatot te alakítod ki a saját ízlésedre.
            </p>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-medium">Turistatérkép — telek és túraútvonalak</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
              OpenTopoMap: a telek helye és a Börzsöny sűrű túraútvonal-hálózata. A kapun kilépve 500 méteren belül
              elérhetők a völgy és a dombtető ösvényei.
            </p>
            <ListingTopoMap
              mode="local"
              caption="Hörcsög utca vége, Kismaros-Börzsönyliget. A jelölés a hirdetett telket mutatja; a környező vonalak a turistaútvonalakat."
            />
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-medium">Regionális kép — Dunakanyar &amp; Börzsöny</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
              A Duna–Ipoly Nemzeti Park és a Börzsöny összefüggő erdei védettsége (Natura 2000) keretezi a helyet. A
              megyehatárok és a folyókanyar a tágabb kontextust adják — Budapesttől északra, a Duna-parttól beljebb.
            </p>
            <ListingTopoMap
              mode="regional"
              caption="Dunakanyar–Börzsöny áttekintő: a jelölés Kismarost mutatja a nemzeti parki és erdei tájban."
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
                <h3 className="text-lg font-medium">Ipoly Erdő &amp; Nemzeti Park</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  A környéken az Ipoly Erdő Zrt. gazdálkodik; a terület a Duna–Ipoly Nemzeti Park vonzáskörzetébe
                  tartozik. Natura 2000-es ősfás tölgyerdő: igazi béke a Börzsöny kapujában.
                </p>
              </article>
              <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
                <h3 className="text-lg font-medium">Klíma-előny</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  Nyáron 4&nbsp;°C-kal hűvösebb, mint a Duna-parton; a hegyoldal naposabb foltjai mégis alkalmasak
                  napelemre és veteményesre.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="scroll-mt-24 border-t border-[#d4c9b5] bg-[#f7f1e6] py-14 md:py-16 lg:py-20" id="tilalom">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-medium">Ingatlan adatai &amp; övezeti besorolás</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
              Belterület, Lke-4, tiszta jogi státusz, parkolás, közművek és menetidők — közvetlenül tőlem, 1/1
              tulajdonostól.
            </p>

            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              <li className="rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#efe8db] p-5">
                <MapPin className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="mt-3 text-lg font-medium">Belterület &amp; besorolás</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  Kismaros <strong className="font-semibold text-[#2f4a38]">belterület</strong>, Lke-4 övezet (
                  {VARIANT_OFFER.plotSqm}&nbsp;m² saját telek, max. 30% beépíthetőség, 4,5&nbsp;m építménymagasság).
                </p>
              </li>
              <li className="rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#efe8db] p-5">
                <Car className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="mt-3 text-lg font-medium">Parkolás</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  Telken belül bőségesen <strong className="font-semibold text-[#2f4a38]">3 autó számára</strong> van
                  hely (Y-alakú beálló), plusz a telek előtt lévő kb. 150&nbsp;m²-es önkormányzati/használati sávban
                  még 1 autó kényelmesen megállhat — nem veszi el a helyet a beépíthető telekből.
                </p>
              </li>
              <li className="rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#efe8db] p-5">
                <FileText className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="mt-3 text-lg font-medium">Jogi státusz — változtatási tilalom alól mentes</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  Kismaros Önkormányzata a 8/2025. (IV. 14.) számú rendeletével elrendelt változtatási tilalom alól{" "}
                  <strong className="font-semibold text-[#2f4a38]">ez az ingatlan mentes</strong>, így tiszta jogi
                  státusszal azonnal biztonságot nyújt.
                </p>
                <a
                  href="#tilalom-terkepek"
                  className="mt-3 inline-flex text-sm font-semibold text-[#0f2e1f] underline-offset-2 hover:underline"
                >
                  Önkormányzati rendelet / térképek
                </a>
              </li>
              <li className="rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#efe8db] p-5">
                <Droplets className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="mt-3 text-lg font-medium">Közművek &amp; szolgáltatások</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                  Villany, cserépkályha fűtési infrastruktúra, HÉSZ 42. § szerinti zárt szennyvíztároló. Kommunális
                  szemétszállítás heti rendszerességgel, szelektív hulladék elvitel 2 hetente. Jó közbiztonság. 1,5
                  km-en belül 2 természetes erdei forrás is elérhető (változó vízhozammal/minőséggel).
                </p>
              </li>
            </ul>

            <div className="mt-8 rounded-lg border border-[#d4c9b5] bg-[#efe8db] p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="text-lg font-medium">Megközelíthetőség — menetidők</h3>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {COMMUTE_TIMES.map((row) => (
                  <li
                    key={row.label}
                    className="flex flex-col rounded-md border border-[#d4c9b5] bg-[#f7f1e6] px-3 py-3 text-sm"
                  >
                    <span className="text-xs uppercase tracking-wide text-[#6b6154]">{row.label}</span>
                    <span className="mt-1 font-semibold text-[#241f18]">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <article className="mt-8 rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#0f2e1f] bg-[#efe8db] p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Trees className="h-5 w-5 text-[#e8b84a]" aria-hidden />
                <h3 className="text-xl font-medium">Erdei életérzés &amp; csendkódex</h3>
              </div>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-[#5a5146] sm:text-base">
                <p>
                  Ez a hely a befelé fordulásról, a lelassulásról és a valódi elvonulásról szól. Nem való mindenkinek —
                  és ezt büszkén vállalom.
                </p>
                <p>
                  A hirdetett telek átlós alsó szomszédja én leszek (több mint 50 méter távolság van a házaink között, a
                  magánszféra teljes). Hétfőtől péntekig (07:00–19:00) természetes a háztartási és munkavégzési zaj, de
                  mivel ez a terület csaknem egy évszázadon át üdülőövezet volt — és ma is Natura 2000-es erdők veszik
                  körül —, a hétvége a pihenés szent ideje. A völgynek tiszta, egyedi akusztikája van, a szemközti oldal
                  nem beépített. Az erdei csend és a madárcsicsergés közös kincs. Tisztelettel kérem azokat, akik
                  hétvégente a kertben tábortűz körül hangos zenét keresnek, hogy válasszanak másik helyet.
                </p>
              </div>
            </article>

            <div id="tilalom-terkepek" className="scroll-mt-28 mt-12">
              <h3 className="text-2xl font-medium">Övezeti bizonyíték — rendelet &amp; térképek</h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
                A rendelet mellékletén a kékkel jelölt telkek esnek a tilalom alá.{" "}
                <strong className="font-semibold text-[#241f18]">Ez az Lke-4 ingatlan nincs a listán</strong> (sárga
                jelölés).
              </p>
              <ul className="mt-6 flex flex-wrap gap-3 text-sm" aria-label="Térkép jelmagyarázat">
                <li className="inline-flex items-center gap-2 rounded-md border border-[#d4c9b5] bg-[#efe8db] px-3 py-2">
                  <span className="h-3.5 w-3.5 rounded-sm bg-[#3b6ea5]" aria-hidden />
                  <span>Kék: változtatási tilalom alá eső övezet</span>
                </li>
                <li className="inline-flex items-center gap-2 rounded-md border border-[#d4c9b5] bg-[#efe8db] px-3 py-2">
                  <span className="h-3.5 w-3.5 rounded-sm bg-[#e6c84a]" aria-hidden />
                  <span>Sárga: a hirdetett telek (tilalmon kívül)</span>
                </li>
              </ul>
              <MapFrame>
                <figure>
                  <img
                    src="/hirdetes/tilalom-reszlet.jpg"
                    alt="A melléklet kinagyított része. A sárga telek a kékkel jelölt tömbök mellett, azokon kívül látszik."
                    className="mx-auto max-h-[450px] w-full bg-white object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="border-t border-[#d4c9b5] px-4 py-3 text-sm leading-relaxed text-[#5a5146]">
                    Kinagyított részlet: a sárga telek a kék tömbökön kívül áll — tiszta jogi státusz.
                  </figcaption>
                </figure>
              </MapFrame>
              <MapFrame>
                <figure>
                  <img
                    src="/hirdetes/tilalom.jpg"
                    alt="Az önkormányzati rendelet 1. számú melléklete. A sárga jelölés a hirdetett telek."
                    className="mx-auto max-h-[450px] w-full bg-white object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="border-t border-[#d4c9b5] px-4 py-3 text-sm leading-relaxed text-[#5a5146]">
                    8/2025. rendelet 1. számú melléklete. A sárga a hirdetett telek, a kék területen kívül.
                  </figcaption>
                </figure>
              </MapFrame>
              <MapFrame>
                <figure>
                  <img
                    src="/hirdetes/szabalyozas.jpg"
                    alt="Kismaros szabályozási térképe, belterület 2705, Lke-4."
                    className="mx-auto max-h-[450px] w-full bg-white object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="border-t border-[#d4c9b5] px-4 py-3 text-sm leading-relaxed text-[#5a5146]">
                    Szabályozási térkép: belterület 2705, Hörcsög utca, Lke-4.
                  </figcaption>
                </figure>
              </MapFrame>
              <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#5a5146]">
                Az övezeti adatok tájékoztató jellegűek; a hivatalos dokumentumok az irányadók. Tulajdoni lapot
                megtekintéskor átnézzük.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 md:px-6 md:py-16" id="kozmuvek-epulet">
          <h2 className="text-3xl font-medium">Őszintén az állapotról</h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
            A belső terek egyszerűek és eklektikusak. A ház azonnal használható és lakható, sőt, a jelenlegi piaci
            helyzetben eklektikus berendezése ellenére is azonnal kiadható hosszú távú albérlőnek — így elkerülheted az
            üresjáratot. Nem kész luxusházat kínálok, hanem tiszta jogi hátterű, kivételes adottságú erdei alapot.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
              <House className="h-5 w-5 text-[#e8b84a]" aria-hidden />
              <h3 className="mt-3 text-lg font-medium">Felépítmény</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                Azonnal használható felvonulási épület / hétvégi ház (kb. 1980), az ingatlan-nyilvántartásban
                feltüntetve. Mellékhelyiség átalakítva — már nem a konyhából nyílik.
              </p>
            </article>
            <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
              <Thermometer className="h-5 w-5 text-[#e8b84a]" aria-hidden />
              <h3 className="mt-3 text-lg font-medium">Fűtés</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                Cserépkályha; a fűtési infrastruktúra szakemberrel előkészítve. A belső burkolás és berendezés tiszta
                lap, ha saját hangulatot szeretnél.
              </p>
            </article>
            <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
              <Ruler className="h-5 w-5 text-[#e8b84a]" aria-hidden />
              <h3 className="mt-3 text-lg font-medium">Közműfotók</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">
                Villany, víz, fürdő — kattintásra nagyítódnak. Galéria alapállapot: {PHOTO_STATE}
              </p>
            </article>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UTILITY_PHOTOS.map((photo, index) => (
              <li key={photo.src} className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
                <button
                  type="button"
                  onClick={() => setOpen({ kind: "utility", index })}
                  className="flex w-full items-start gap-4 text-left"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-16 w-16 shrink-0 rounded-md border border-[#d4c9b5] bg-[#efe8db] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <span className="block text-xs uppercase tracking-wide text-[#6b6154]">{photo.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-[#5a5146]">{photo.caption}</span>
                    <span className="mt-2 block text-xs font-medium text-[#d4a017]">Nagyítás</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="scroll-mt-24 border-t border-[#d4c9b5] bg-[#f7f1e6] py-14 md:py-16" id="seta">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-medium">Bejárható 3D fotózás</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
              Járd körbe az ingatlant és a felépítményt a böngésződből — így előre látod, mire kérsz megtekintést.
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-[#d4c9b5] bg-[#0f2e1f]">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  title="Bejárható 3D fotózás"
                  src={TOUR_URL}
                  className="absolute inset-0 h-full w-full"
                  allow="fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="scroll-mt-24 bg-[#0f2e1f] py-14 text-white md:py-16" id="galeria">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-medium text-[#f7f1e6]">Képgaléria</h2>
            <p className="mt-3 max-w-2xl text-sm text-[#f7f1e6]/90">
              Külső és belső felvételek a {PHOTO_STATE.replace(/\.$/, "")}-i alapállapotról. Kattintásra nagyobb
              méretben nyílnak meg.
            </p>
            <ul className="mt-8 columns-2 gap-3 md:columns-3 lg:columns-4">
              {PHOTOS.map((photo, index) => (
                <li key={photo.src} className="mb-3 break-inside-avoid">
                  <button
                    type="button"
                    onClick={() => setOpen({ kind: "gallery", index })}
                    className="block w-full overflow-hidden rounded-md"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      className={`w-full object-cover ${photo.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="scroll-mt-24 border-t border-[#d4c9b5] bg-[#f7f1e6] py-14 md:py-16" id="azaras">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-medium">Árazás</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
              {VARIANT_OFFER.premiumNote}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="flex flex-col rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#efe8db] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6b6154]">{VARIANT_OFFER.a.optionLabel}</p>
                <p className="mt-2 text-3xl font-medium text-[#d4a017]">{VARIANT_OFFER.a.listPrice}</p>
                <p className="mt-1 text-xs text-[#6b6154]">{VARIANT_OFFER.a.bandNote}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">{VARIANT_OFFER.a.summary}</p>
                <Link
                  href="/erdeklodes/a"
                  onClick={() => trackListingCta("variant_a")}
                  className="mt-6 inline-flex justify-center rounded-md bg-[#e8b84a] px-5 py-3 text-center text-sm font-semibold text-[#241f18]"
                >
                  Érdeklődöm a novemberi kedvezményre
                </Link>
              </article>
              <article className="flex flex-col rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#d4a017] bg-[#efe8db] p-5 md:p-6">
                <p className="text-xs uppercase tracking-[0.14em] text-[#6b6154]">{VARIANT_OFFER.b.optionLabel}</p>
                <p className="mt-2 text-3xl font-medium text-[#d4a017]">{VARIANT_OFFER.b.listPrice}</p>
                <p className="mt-1 text-xs text-[#6b6154]">{VARIANT_OFFER.b.bandNote}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">{VARIANT_OFFER.b.summary}</p>
                <Link
                  href="/erdeklodes/b"
                  onClick={() => trackListingCta("variant_b")}
                  className="mt-6 inline-flex justify-center rounded-md bg-[#d4a017] px-5 py-3 text-center text-sm font-semibold text-[#241f18]"
                >
                  Érdeklődöm az alapárra
                </Link>
              </article>
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[#5a5146]">{VARIANT_OFFER.marketNote}</p>
            <p className="mt-2 text-sm text-[#5a5146]">{VARIANT_OFFER.fixturesNote}.</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16" id="folyamat">
          <h2 className="text-3xl font-medium">Hogyan zajlik a folyamat?</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#d4a017]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-lg font-medium">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146]">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="scroll-mt-24 border-t border-[#d4c9b5] bg-[#f7f1e6] py-14 md:py-16" id="kinek">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-3xl font-medium">Kinek szól — és kinek nem?</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-[#d4c9b5] border-t-4 border-t-[#e8b84a] bg-[#efe8db] p-6">
                <h3 className="text-xl font-medium">Neked szól</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146] sm:text-base">
                  Ha erdei nyugalmat szeretnél korrekt, fix áron, örülsz a saját ízlésedre alakítható belső tereknek,
                  fontos a tiszta jogi háttér, és értékeld a transzparens, 1/1 tulajdonosi felállást.
                </p>
              </article>
              <article className="rounded-lg border border-[#d4c9b5] border-t-4 border-t-[#6b6154] bg-[#efe8db] p-6">
                <h3 className="text-xl font-medium">Nem neked szól</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5a5146] sm:text-base">
                  Ha kulcsrakész luxusingatlant vársz, vagy az alku a fő szempontod — az árak fixek, nincs alkupuffer. A
                  hétvégi hangos zenés tábortűz sem ide való (lásd a csendkódexet).
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16" id="gyik">
          <h2 className="text-3xl font-medium">Gyakori kérdések</h2>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        <section className="scroll-mt-24 bg-[#0f2e1f] py-14 text-white md:py-16" id="kapcsolat">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:gap-10 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-medium text-[#f7f1e6]">Kapcsolatfelvétel</h2>
              <p className="mt-3 text-lg font-medium text-[#e8b84a]">Írj nekem — megtekintést egyeztetünk.</p>
              <p className="mt-3 text-sm leading-relaxed text-[#f7f1e6]/90 sm:text-base">
                Használd az űrlapot, vagy — adatkezelés elfogadása után — hívd a védett számot, illetve írj közvetlen
                emailt. Ha a novemberi kedvezmény érdekel, jelezd az üzenetben.
              </p>
              <ListingSellerCard tone="dark" />
            </div>
            <div className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5 text-[#241f18] sm:p-6">
              <EnquiryForm />
            </div>
          </div>
        </section>

        <footer className="border-t border-[#d4c9b5] px-4 py-8">
          <div className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[#6b6154]">
            <p>Az oldalon szereplő adatok tájékoztató jellegűek, a hivatalos dokumentumok az irányadók.</p>
          </div>
        </footer>

        {lightboxSrc ? (
          <div
            className="fixed inset-0 z-[70] flex flex-col bg-[#0f2e1f]"
            role="dialog"
            aria-modal="true"
            aria-label="Nagyított képnézet"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e8b84a]/35 px-3 py-3 md:px-5">
              <p className="truncate text-sm font-medium text-[#f7f1e6]/90">
                {open?.kind === "gallery" ? `${(open.index ?? 0) + 1} / ${PHOTOS.length}` : lightboxSrc.alt}
              </p>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className="inline-flex items-center gap-2 rounded-md border-2 border-[#e8b84a] bg-[#e8b84a] px-3 py-2 text-sm font-semibold text-[#241f18] shadow-[0_2px_12px_rgba(0,0,0,0.35)] hover:bg-[#f0c45c]"
                aria-label="Kilépés a nagyított nézetből"
              >
                <X className="h-5 w-5" aria-hidden />
                Bezárás
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center gap-1 px-1 py-3 sm:gap-2 sm:px-3 md:px-4">
              {open?.kind === "gallery" ? (
                <button
                  type="button"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#e8b84a] bg-[#1a4530] text-[#e8b84a] shadow-[0_2px_14px_rgba(0,0,0,0.4)] hover:bg-[#243f30] md:h-12 md:w-12"
                  onClick={() =>
                    setOpen({ kind: "gallery", index: (open.index - 1 + PHOTOS.length) % PHOTOS.length })
                  }
                  aria-label="Előző kép"
                >
                  <ChevronLeft className="h-7 w-7" aria-hidden />
                </button>
              ) : (
                <span className="w-11 shrink-0 md:w-12" aria-hidden />
              )}
              <img
                src={lightboxSrc.src}
                alt={lightboxSrc.alt}
                className="max-h-[calc(100dvh-7.5rem)] max-w-[min(100%,calc(100vw-6.5rem))] object-contain md:max-w-[min(100%,calc(100vw-8rem))]"
              />
              {open?.kind === "gallery" ? (
                <button
                  type="button"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#e8b84a] bg-[#1a4530] text-[#e8b84a] shadow-[0_2px_14px_rgba(0,0,0,0.4)] hover:bg-[#243f30] md:h-12 md:w-12"
                  onClick={() => setOpen({ kind: "gallery", index: (open.index + 1) % PHOTOS.length })}
                  aria-label="Következő kép"
                >
                  <ChevronRight className="h-7 w-7" aria-hidden />
                </button>
              ) : (
                <span className="w-11 shrink-0 md:w-12" aria-hidden />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </ListingPhoneProvider>
  );
}
