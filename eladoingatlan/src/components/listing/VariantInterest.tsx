import Link from "next/link";

import { EnquiryForm } from "@/components/listing/EnquiryForm";
import { ListingPhoneProvider, ListingSellerCard } from "@/components/listing/ListingContact";
import { LISTING_LOGO, VARIANT_OFFER, type ListingVariant } from "@/lib/listing";

export function VariantInterest({ variant }: { variant: ListingVariant }) {
  const selected = VARIANT_OFFER[variant];
  const other: ListingVariant = variant === "a" ? "b" : "a";
  const otherOffer = VARIANT_OFFER[other];

  return (
    <ListingPhoneProvider>
      <div className="min-h-screen bg-[#efe8db] text-[#241f18]">
        <header className="border-b border-[#d4c9b5] bg-[#efe8db]/95">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link
              href="/#teteje"
              className="inline-flex min-w-0 items-center gap-2.5 text-sm font-semibold tracking-wide text-[#0f2e1f] hover:opacity-90"
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
            </Link>
            <Link href="/#azaras" className="text-sm hover:underline">
              Vissza a hirdetéshez
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-sm uppercase tracking-[0.16em] text-[#6b6154]">Érdeklődés · {selected.optionLabel}</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-medium sm:text-4xl">{selected.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a5146] sm:text-base">
            Ugyanaz a telek ({VARIANT_OFFER.plotSqm} m²) és ugyanaz a felépítmény. Közvetlenül tőlem, 1/1 tulajdonostól —
            jutalék nélkül. Az árak fixek.
          </p>

          <section className="mt-10 grid gap-4 lg:grid-cols-3">
            <article className="rounded-lg border border-[#d4c9b5] border-l-4 border-l-[#e8b84a] bg-[#f7f1e6] p-5 lg:col-span-2">
              <h2 className="text-xl font-medium">Ajánlat — {selected.short}</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#6b6154]">Vételár</dt>
                  <dd className="mt-1 text-2xl font-medium text-[#d4a017]">{selected.listPrice}</dd>
                  <dd className="mt-1 text-xs text-[#6b6154]">{selected.bandNote}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[#6b6154]">Foglaló / ütemezés</dt>
                  <dd className="mt-1 text-sm font-medium leading-snug text-[#241f18]">{selected.deposit}</dd>
                  <dd className="mt-2 text-xs uppercase tracking-wide text-[#6b6154]">Birtokbaadás</dd>
                  <dd className="mt-1 text-sm text-[#5a5146]">{selected.possession}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs uppercase tracking-wide text-[#6b6154]">Telek</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[#5a5146]">
                    {VARIANT_OFFER.plotSqm} m² belterületi Lke-4 telek (belül 3 autó); előtte kb. 150 m² használati sáv
                    még 1 autónak.
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-sm leading-relaxed text-[#5a5146]">{selected.summary}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#5a5146]">{VARIANT_OFFER.fixturesNote}.</p>
            </article>

            <article className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5">
              <h2 className="text-lg font-medium">Rövid adatok</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#5a5146]">
                <li>Belterület · Lke-4 · max. 30% · max. 4,5 m</li>
                <li>Változtatási tilalom alól mentes (8/2025.)</li>
                <li>Zárt szennyvíztároló · villany · cserépkályha</li>
                <li>Azonnal használható / kiadható felépítmény</li>
                <li>Fix ár · nincs jutalék · 1/1 tulajdonos</li>
              </ul>
            </article>
          </section>

          <section className="mt-8 overflow-hidden rounded-lg border border-[#d4c9b5] bg-[#f7f1e6]">
            <div className="border-b border-[#d4c9b5] px-5 py-4">
              <h2 className="text-xl font-medium">A két ár</h2>
              <p className="mt-1 text-sm text-[#5a5146]">{VARIANT_OFFER.premiumNote}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-[#efe8db] text-xs uppercase tracking-wide text-[#6b6154]">
                  <tr>
                    <th className="px-5 py-3 font-medium">Opció</th>
                    <th className="px-5 py-3 font-medium">Vételár</th>
                    <th className="px-5 py-3 font-medium">Megjegyzés</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={variant === "a" ? "bg-[#f5edd4]" : ""}>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 font-medium">
                      Kétütemű novemberi kedvezmény{variant === "a" ? " · ezt nézed" : ""}
                    </td>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 font-medium text-[#d4a017]">
                      {VARIANT_OFFER.a.listPrice}
                    </td>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 text-[#5a5146]">
                      −{VARIANT_OFFER.discountAmount} az alapárból
                    </td>
                  </tr>
                  <tr className={variant === "b" ? "bg-[#f5edd4]" : ""}>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 font-medium">
                      Alapár{variant === "b" ? " · ezt nézed" : ""}
                    </td>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 font-medium text-[#d4a017]">
                      {VARIANT_OFFER.b.listPrice}
                    </td>
                    <td className="border-t border-[#d4c9b5] px-5 py-3 text-[#5a5146]">
                      {VARIANT_OFFER.b.possession}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-4 text-sm text-[#5a5146]">
            A másik opció:{" "}
            <Link href={`/erdeklodes/${other}`} className="font-semibold underline">
              {otherOffer.title}
            </Link>
          </p>

          <section className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-2xl font-medium">Kapcsolatfelvétel</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5a5146] sm:text-base">
                Az űrlap a {selected.optionLabel} ({selected.listPrice}) érdeklődést jelöli. Közvetlen telefon és email
                az adatkezelés elfogadása után érhető el; üzenetet ide is tudsz küldeni.
              </p>
              <ListingSellerCard />
            </div>
            <div className="rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] p-5 sm:p-6">
              <EnquiryForm
                variant={variant}
                defaultMessage={`Érdeklődöm a ${selected.optionLabel} konstrukcióra (vételár ${selected.listPrice}).`}
              />
            </div>
          </section>
        </main>

        <footer className="border-t border-[#d4c9b5] px-4 py-8">
          <div className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[#6b6154]">
            <p>Az oldalon szereplő adatok tájékoztató jellegűek, a hivatalos dokumentumok az irányadók.</p>
          </div>
        </footer>
      </div>
    </ListingPhoneProvider>
  );
}
