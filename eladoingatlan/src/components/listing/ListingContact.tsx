"use client";

import { Phone, ShieldCheck, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { trackConversion } from "@/lib/conversion";
import { LISTING_SELLER } from "@/lib/listing";

const GDPR_STORAGE_KEY = "eladoingatlan_gdpr_v1";

const GDPR_BODY =
  "Semmihez sem gyűjtöm és nem adom át harmadik félnek a megismert adataidat. Azokat kizárólag az érdeklődésed miatti kapcsolattartásra használom a potenciális üzlet reményében. Sikeres vagy sikertelen kimenetel esetén is törlöm az érdeklődők adatait legkésőbb 30 napon belül, ahogy a hirdetésemet is törlöm.";

type PhoneLinks = {
  display: string;
  telHref: string;
};

type ConsentDecision = "accepted" | "declined" | null;

type RevealCtx = {
  hydrated: boolean;
  consent: ConsentDecision;
  acceptConsent: () => void;
  declineConsent: () => void;
  reopenConsent: () => void;
  revealed: boolean;
  reveal: (place: string) => void;
  links: PhoneLinks | null;
};

const PhoneRevealContext = createContext<RevealCtx | null>(null);

/** Számjegyek char-kódból — plain text telefonszám nincs a HTML-ben, amíg a látogató nem kattint. */
function assemblePhone(): PhoneLinks {
  const digits = String.fromCharCode(51, 54, 51, 48, 54, 54, 55, 50, 53, 49, 48);
  const display = `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  return { display, telHref: `tel:+${digits}` };
}

function track(
  event:
    | "listing_phone_click"
    | "listing_cta_click"
    | "listing_phone_reveal"
    | "listing_gdpr_accept"
    | "listing_gdpr_decline",
  place: string
) {
  trackConversion(event, { place, seller: LISTING_SELLER.name });
}

function readStoredConsent(): ConsentDecision {
  try {
    const raw = window.localStorage.getItem(GDPR_STORAGE_KEY);
    if (raw === "accepted") return "accepted";
    if (raw === "declined") return "declined";
  } catch {
    /* private mode / blocked storage */
  }
  return null;
}

function writeStoredConsent(value: ConsentDecision) {
  try {
    if (value === null) {
      window.localStorage.removeItem(GDPR_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(GDPR_STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
}

export function ListingPhoneProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<ConsentDecision>(null);
  const [revealed, setRevealed] = useState(false);
  const [links, setLinks] = useState<PhoneLinks | null>(null);

  useEffect(() => {
    setConsent(readStoredConsent());
    setHydrated(true);
  }, []);

  const acceptConsent = useCallback(() => {
    setConsent("accepted");
    writeStoredConsent("accepted");
    track("listing_gdpr_accept", "modal");
  }, []);

  const declineConsent = useCallback(() => {
    setConsent("declined");
    writeStoredConsent("declined");
    setRevealed(false);
    setLinks(null);
    track("listing_gdpr_decline", "modal");
  }, []);

  const reopenConsent = useCallback(() => {
    setConsent(null);
    writeStoredConsent(null);
  }, []);

  const reveal = useCallback((place: string) => {
    setLinks(assemblePhone());
    setRevealed(true);
    track("listing_phone_reveal", place);
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      consent,
      acceptConsent,
      declineConsent,
      reopenConsent,
      revealed,
      reveal,
      links,
    }),
    [hydrated, consent, acceptConsent, declineConsent, reopenConsent, revealed, reveal, links]
  );

  return (
    <PhoneRevealContext.Provider value={value}>
      {children}
      <ListingGdprModal />
    </PhoneRevealContext.Provider>
  );
}

function usePhoneReveal() {
  const ctx = useContext(PhoneRevealContext);
  if (!ctx) throw new Error("ListingPhoneProvider hiányzik");
  return ctx;
}

function useDirectContactAllowed() {
  const { hydrated, consent } = usePhoneReveal();
  return hydrated && consent === "accepted";
}

function RevealButton({ place, className }: { place: string; className?: string }) {
  const { reveal } = usePhoneReveal();
  return (
    <button
      type="button"
      onClick={() => reveal(place)}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-md bg-[#e8b84a] px-3 py-2 text-sm font-semibold text-[#241f18]"
      }
    >
      <ShieldCheck className="h-4 w-4" aria-hidden />
      Telefonszám megjelenítése
    </button>
  );
}

function PhoneAction({ place }: { place: string }) {
  const { links } = usePhoneReveal();
  if (!links) return null;
  return (
    <a
      href={links.telHref}
      onClick={() => track("listing_phone_click", place)}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#d4c9b5] bg-[#efe8db] px-3 py-2 text-sm font-semibold text-[#241f18]"
    >
      <Phone className="h-4 w-4 text-[#e8b84a]" aria-hidden />
      {links.display}
    </a>
  );
}

function DirectContactGate({
  place,
  dark,
  onNavigate,
}: {
  place: string;
  dark?: boolean;
  onNavigate?: () => void;
}) {
  const allowed = useDirectContactAllowed();
  const { revealed, reopenConsent } = usePhoneReveal();
  const toneDark = Boolean(dark);

  if (!allowed) {
    return (
      <div className="space-y-2">
        <p className={`text-sm leading-relaxed ${toneDark ? "text-[#f7f1e6]/90" : "text-[#5a5146]"}`}>
          A közvetlen telefon az adatkezelés elfogadása után érhető el. Addig az űrlapot használd.
        </p>
        <button
          type="button"
          onClick={() => {
            reopenConsent();
            onNavigate?.();
          }}
          className={
            toneDark
              ? "inline-flex items-center rounded-md border border-[#e8b84a]/80 bg-[#1a4530]/50 px-3 py-2 text-sm font-semibold text-[#f7f1e6]"
              : "inline-flex items-center rounded-md border border-[#d4c9b5] bg-[#efe8db] px-3 py-2 text-sm font-semibold text-[#241f18]"
          }
        >
          Adatkezelés megnyitása
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {revealed ? <PhoneAction place={place} /> : <RevealButton place={place} />}
    </div>
  );
}

function ListingGdprModal() {
  const { hydrated, consent, acceptConsent, declineConsent } = usePhoneReveal();
  const open = hydrated && consent === null;

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") declineConsent();
    }
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, declineConsent]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#0f2e1f]/72 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-gdpr-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-[#d4c9b5] bg-[#f7f1e6] shadow-[0_16px_48px_rgba(15,46,31,0.45)]">
        <div className="flex items-start justify-between gap-3 border-b border-[#d4c9b5] bg-[#0f2e1f] px-5 py-4 text-[#f7f1e6]">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[#e8b84a]">Adatvédelem</p>
            <h2 id="listing-gdpr-title" className="mt-1 text-lg font-medium">
              Kapcsolatfelvétel és adataid
            </h2>
          </div>
          <button
            type="button"
            onClick={declineConsent}
            className="rounded-md p-1.5 text-[#f7f1e6]/80 hover:bg-[#1a4530] hover:text-white"
            aria-label="Bezárás — közvetlen elérés nélkül"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5 text-sm leading-relaxed text-[#5a5146]">
          <p>{GDPR_BODY}</p>
          <p>
            Elfogadás után elérhető a védett telefonszám. Elutasítás esetén továbbra is írhatsz az űrlapon — az
            üzeneteket a szerver továbbítja, e-mail címem nem jelenik meg az oldalon.
          </p>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-[#d4c9b5] bg-[#efe8db] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={declineConsent}
            className="rounded-md border border-[#d4c9b5] bg-[#f7f1e6] px-4 py-2.5 text-sm font-semibold text-[#241f18]"
          >
            Csak az űrlap
          </button>
          <button
            type="button"
            onClick={acceptConsent}
            className="rounded-md bg-[#e8b84a] px-4 py-2.5 text-sm font-semibold text-[#241f18]"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mobilmenü alján — nem sticky, csak a nyitott hamburgerben. */
export function ListingMobileContact({ onNavigate }: { onNavigate?: () => void }) {
  const allowed = useDirectContactAllowed();
  return (
    <div className="mt-3 border-t border-[#d4c9b5] pt-3">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-[#6b6154]">{LISTING_SELLER.name}</p>
      <div className="mt-2 flex flex-col gap-2 px-3">
        <DirectContactGate place="mobile_menu" onNavigate={onNavigate} />
        <a
          href="#kapcsolat"
          onClick={() => {
            track("listing_cta_click", "mobile_menu_form");
            onNavigate?.();
          }}
          className="inline-flex items-center rounded-md px-1 py-1 text-sm font-semibold text-[#0f2e1f] underline-offset-2 hover:underline"
        >
          {allowed ? "Üzenet az űrlapon" : "Érdeklődés az űrlapon"}
        </a>
      </div>
    </div>
  );
}

/** Kapcsolati szekció — szöveg + gombok, avatar nélkül (nem a fejlécben). */
export function ListingSellerCard({ tone = "light" }: { tone?: "light" | "dark" }) {
  const allowed = useDirectContactAllowed();
  const dark = tone === "dark";
  return (
    <div
      className={`mt-6 rounded-lg border p-4 ${
        dark ? "border-[#e8b84a]/40 bg-[#1a4530]/50" : "border-[#d4c9b5] bg-[#f7f1e6]"
      }`}
    >
      <p className={`text-base font-semibold ${dark ? "text-[#f7f1e6]" : "text-[#241f18]"}`}>
        {LISTING_SELLER.name}
      </p>
      <p className={`text-sm ${dark ? "text-[#e8b84a]" : "text-[#6b6154]"}`}>{LISTING_SELLER.role}</p>
      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-[#f7f1e6]/90" : "text-[#5a5146]"}`}>
        {allowed
          ? "A telefonszám csak kattintás után jelenik meg (botvédelem). Üzenetet az űrlapon küldhetsz — a címem nincs a böngészőben."
          : "Közvetlen hívás az adatkezelés elfogadása után. Addig az űrlap a biztos út."}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <DirectContactGate place="contact_card" dark={dark} />
        {allowed ? (
          <a
            href="#kapcsolat"
            onClick={() => track("listing_cta_click", "contact_card_form")}
            className={
              dark
                ? "inline-flex w-fit items-center rounded-md px-3 py-2 text-sm font-semibold text-[#e8b84a] underline-offset-2 hover:underline"
                : "inline-flex w-fit items-center rounded-md px-3 py-2 text-sm font-semibold text-[#0f2e1f] underline-offset-2 hover:underline"
            }
          >
            Űrlap
          </a>
        ) : (
          <a
            href="#kapcsolat"
            onClick={() => track("listing_cta_click", "contact_card_form")}
            className={
              dark
                ? "inline-flex w-fit items-center rounded-md bg-[#e8b84a] px-3 py-2 text-sm font-semibold text-[#241f18]"
                : "inline-flex w-fit items-center rounded-md bg-[#e8b84a] px-3 py-2 text-sm font-semibold text-[#241f18]"
            }
          >
            Üzenet az űrlapon
          </a>
        )}
      </div>
    </div>
  );
}

export function trackListingCta(place: string) {
  track("listing_cta_click", place);
}
