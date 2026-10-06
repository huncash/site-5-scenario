import { splitAddress } from "./address.ts";
import type { Buyer } from "./store.ts";
import { countryFromTaxId } from "./vat.ts";

export type CheckoutGap =
  | "name"
  | "email"
  | "address"
  | "zip"
  | "city"
  | "country"
  | "taxId"
  | "nostr"
  | "consent"
  | "aszf"
  | "pay";

export type CheckoutFields = {
  name: string;
  lastName?: string;
  firstName?: string;
  companyName?: string;
  address: string;
  zip?: string;
  city?: string;
  email: string;
  taxId: string;
  country: string;
  nostr?: string;
  partnerKind: "b2c" | "b2b";
  immediateConsent: boolean;
  aszfAccepted: boolean;
  payMethod: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOSTR_NPUB = /^npub1[02-9ac-hj-np-z]{50,}$/i;
const NOSTR_NPROFILE = /^nprofile1[02-9ac-hj-np-z]{20,}$/i;
const NOSTR_NIP05 = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function compactTaxId(taxId: string): string {
  return taxId.replace(/[\s./-]/g, "");
}

export function resolvePartnerKind(partnerKind: string, _taxId = ""): "b2c" | "b2b" {
  const raw = partnerKind.toLowerCase();
  if (raw === "b2b" || raw === "b2c") return raw;
  return "b2c";
}

export function composeBuyerName(fields: {
  partnerKind: "b2c" | "b2b";
  lastName?: string;
  firstName?: string;
  companyName?: string;
  name?: string;
}): string {
  if (fields.partnerKind === "b2b") {
    return (fields.companyName || fields.name || "").trim();
  }
  const last = (fields.lastName ?? "").trim();
  const first = (fields.firstName ?? "").trim();
  if (last || first) return [last, first].filter(Boolean).join(" ");
  return (fields.name ?? "").trim();
}

export function zipLooksValid(zip: string, country: string): boolean {
  const z = zip.trim();
  if (!z) return false;
  if (country.toUpperCase() === "HU") return /^\d{4}$/.test(z);
  return /^[A-Z0-9][A-Z0-9\s-]{1,11}$/i.test(z);
}

export function nostrLooksValid(value: string): boolean {
  const s = value.trim();
  if (!s) return true;
  return NOSTR_NPUB.test(s) || NOSTR_NPROFILE.test(s) || NOSTR_NIP05.test(s);
}

export function ingestAddress(input: { address?: string; zip?: string; city?: string }): {
  address: string;
  zip: string;
  city: string;
} {
  let zip = (input.zip ?? "").trim();
  let city = (input.city ?? "").trim();
  let street = (input.address ?? "").trim();
  if (!street) return { address: "", zip, city };
  const parsed = splitAddress(street, zip || undefined, city || undefined);
  if (!zip && parsed.irsz !== "0000") zip = parsed.irsz;
  if (!city && parsed.telepules !== "—") city = parsed.telepules;
  if (parsed.cim && parsed.cim !== parsed.telepules) street = parsed.cim;
  return { address: street, zip, city };
}

export function checkoutGap(fields: CheckoutFields): CheckoutGap | null {
  const name = composeBuyerName(fields);
  const loc = ingestAddress(fields);
  const email = fields.email.trim();
  const country = fields.country.trim();
  if (!name) return "name";
  if (fields.partnerKind === "b2c") {
    const last = (fields.lastName ?? "").trim();
    const first = (fields.firstName ?? "").trim();
    if ((last || first) && (!last || !first)) return "name";
  }
  if (!email || !EMAIL_RE.test(email)) return "email";
  if (!zipLooksValid(loc.zip, country || "HU")) return "zip";
  if (!loc.city) return "city";
  if (!loc.address) return "address";
  if (!country) return "country";
  if (fields.partnerKind === "b2b" && compactTaxId(fields.taxId).length < 8) return "taxId";
  if (!nostrLooksValid(fields.nostr ?? "")) return "nostr";
  if (fields.partnerKind === "b2c" && !fields.immediateConsent) return "consent";
  if (!fields.aszfAccepted) return "aszf";
  if (fields.payMethod !== "hu_transfer" && fields.payMethod !== "barion") return "pay";
  return null;
}

export function checkoutReady(fields: CheckoutFields): boolean {
  return checkoutGap(fields) === null;
}

export function buyerFromCheckout(body: Record<string, unknown>): Buyer | string {
  const partnerKind = resolvePartnerKind(String(body.partnerKind ?? body.buyerKind ?? ""));
  const lastName = String(body.lastName ?? "").trim();
  const firstName = String(body.firstName ?? "").trim();
  const companyName = String(body.companyName ?? "").trim();
  const name = composeBuyerName({
    partnerKind,
    lastName,
    firstName,
    companyName,
    name: String(body.name ?? "").trim(),
  });
  const loc = ingestAddress({
    address: String(body.address ?? "").trim(),
    zip: String(body.zip ?? "").trim(),
    city: String(body.city ?? "").trim(),
  });
  const email = String(body.email ?? "").trim();
  const taxId = String(body.taxId ?? "").trim();
  const nostr = String(body.nostr ?? "").trim();
  const country = String(body.country ?? "").trim() || countryFromTaxId(taxId) || undefined;
  const gap = checkoutGap({
    name,
    lastName,
    firstName,
    companyName,
    address: loc.address,
    zip: loc.zip,
    city: loc.city,
    email,
    taxId,
    country: country ?? "",
    nostr,
    partnerKind,
    immediateConsent: body.immediateConsent === true || body.immediateConsent === "true",
    aszfAccepted: body.aszfAccepted === true || body.aszfAccepted === "true",
    payMethod: String(body.payMethod ?? "hu_transfer"),
  });
  if (gap === "name" || gap === "address") return "Név, cím és e-mail kell.";
  if (gap === "email") return email ? "Az e-mail formája hibás." : "Név, cím és e-mail kell.";
  if (gap === "zip") return "Az irányítószám megadása kötelező (NAV-kompatibilis számla).";
  if (gap === "city") return "A település megadása kötelező.";
  if (gap === "country") return "Az ország kiválasztása kötelező.";
  if (gap === "taxId") return "Céges vásárláskor az adószám megadása kötelező.";
  if (gap === "nostr") return "A Nostr cím formája hibás (NIP-05 vagy npub).";
  if (gap === "consent") return "Fogyasztói vásárláskor az azonnali teljesítéshez való hozzájárulás kötelező.";
  if (gap === "aszf") return "Az ÁSZF és az adatvédelmi tájékoztató elfogadása kötelező.";
  if (gap === "pay") return "Ismeretlen fizetési mód.";
  return {
    name,
    lastName: partnerKind === "b2c" ? lastName || undefined : undefined,
    firstName: partnerKind === "b2c" ? firstName || undefined : undefined,
    address: loc.address,
    zip: loc.zip,
    city: loc.city,
    email,
    taxId,
    country,
    partnerKind,
    nostr: nostr || undefined,
  };
}
