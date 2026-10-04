import { supportPublicOrigin } from "@/lib/support";

/** Árazás / mátrix alatti fogalom-lábjegyzetek — a UI-ban csak elsődleges kifejezések. */
export function PricingFootnotes(props: { className?: string }) {
  const faqHref = `${supportPublicOrigin()}/gyik#faq-slot`;
  return (
    <div
      id="pricing-footnotes"
      className={
        props.className ??
        "mt-8 space-y-1 border-t border-slate-800 pt-4 text-xs text-slate-400"
      }
    >
      <p>
        <span className="font-medium text-emerald-400">* Slot:</span> A Case-en belüli elkülönített
        adatterület (a felület felső lapfülei). Típusai: Magán, Vállalkozás, Projekt. Lásd még:{" "}
        <a href={faqHref} className="underline hover:text-emerald-300">
          Fogalmi GYIK
        </a>
        .
      </p>
      <p>
        <span className="font-medium text-emerald-400">** Case:</span> A komplett, elmentett döntési
        és szimulációs modell.
      </p>
      <p>
        <span className="font-medium text-emerald-400">*** P-R-O Szcenárió:</span> Pesszimista ·
        Realista · Optimista — a három párhuzamos görbe minden Slotban.
      </p>
      <p>
        <span className="font-medium text-emerald-400">**** Seat / Guest:</span> Seat = szerkesztői
        fiók; Guest Code Slot = anonim, egyedi vendégkód (1 aktív session / kód; nem fogyaszt Seat-et).
      </p>
    </div>
  );
}
