"use client";

import { useState, type FormEvent } from "react";

import { trackConversion } from "@/lib/conversion";
import type { ListingVariant } from "@/lib/listing";

const fieldClass =
  "mt-1 w-full rounded-md border border-[#d4c9b5] bg-[#fffdf8] px-3 py-2.5 text-sm text-[#241f18] outline-none focus:border-[#e8b84a]";

type EnquiryFormProps = {
  variant?: ListingVariant;
  defaultMessage?: string;
};

export function EnquiryForm({ variant, defaultMessage = "" }: EnquiryFormProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedContact = contact.trim();
    const looksEmail = trimmedContact.includes("@");
    if (!name.trim() || !trimmedContact || !message.trim()) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch("/api/erdeklodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: looksEmail ? trimmedContact : "",
          phone: looksEmail ? "" : trimmedContact,
          message,
          company,
          website,
          consent: true,
          variant: variant ?? null,
        }),
      });
      if (!response.ok) {
        setStatus("error");
        trackConversion("listing_enquiry_submit_error", { variant: variant ?? "general" });
        return;
      }
      setStatus("sent");
      trackConversion("listing_enquiry_submit_success", { variant: variant ?? "general" });
      setName("");
      setContact("");
      setMessage(defaultMessage);
    } catch {
      setStatus("error");
      trackConversion("listing_enquiry_submit_error", { variant: variant ?? "general" });
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-md border border-[#d4c9b5] bg-[#f7f1e6] px-5 py-6 text-sm leading-relaxed">
        Megkaptuk az érdeklődést
        {variant ? ` (${variant === "a" ? "kétütemű novemberi kedvezmény" : "alapár"})` : ""}. Hamarosan jelentkezem a
        megadott elérhetőségen.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {variant ? (
        <p className="rounded-md border border-[#d4c9b5] bg-[#f7f1e6] px-3 py-2 text-sm">
          Érdeklődés:{" "}
          <span className="font-semibold">
            {variant === "a"
              ? "Kétütemű novemberi kedvezmény — 30.700.000 Ft"
              : "Alapár — 31.500.000 Ft (legkorábban nov. 10.)"}
          </span>
        </p>
      ) : null}
      <label className="block text-sm">
        Név
        <input required value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} autoComplete="name" />
      </label>
      <label className="block text-sm">
        Telefon vagy e-mail
        <input
          required
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          className={fieldClass}
          autoComplete="tel"
          inputMode="email"
          placeholder="+36 … vagy nev@pelda.hu"
        />
      </label>
      <label className="block text-sm">
        Üzenet
        <textarea required rows={4} value={message} onChange={(event) => setMessage(event.target.value)} className={fieldClass} />
      </label>
      {/* Rejtett honeypot — nem kérünk céget / weboldalt a látogatótól */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Cég
          <input tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
        </label>
        <label>
          Weboldal
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </label>
      </div>
      <p className="text-xs leading-relaxed text-[#6b6154]">
        Beküldéssel elfogadod, hogy az adataidat csak az érdeklődés miatti kapcsolattartásra használom, és legkésőbb 30
        napon belül törlöm.
      </p>
      {status === "invalid" ? <p className="text-sm text-[#8a3a1a]">Kérlek, töltsd ki a nevet, az elérhetőséget és az üzenetet.</p> : null}
      {status === "error" ? (
        <p className="text-sm text-[#8a3a1a]">
          Az üzenetet most nem sikerült elküldeni. Próbáld meg később, vagy hívd a megjelenített telefonszámot.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-[#e8b84a] px-5 py-3 text-sm font-semibold text-[#241f18] disabled:opacity-60"
      >
        {status === "sending" ? "Küldés…" : "Érdeklődöm"}
      </button>
    </form>
  );
}
