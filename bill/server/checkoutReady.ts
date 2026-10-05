import type { Buyer } from "./store.ts";
import { countryFromTaxId } from "./vat.ts";

export type CheckoutGap =
  | "name"
  | "email"
  | "address"
  | "country"
  | "taxId"
  | "consent"
  | "aszf"
  | "pay";

export type CheckoutFields = {
  name: string;
  address: string;
  email: string;
  taxId: string;
  country: string;
  partnerKind: "b2c" | "b2b";
  immediateConsent: boolean;
  aszfAccepted: boolean;
  payMethod: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function compactTaxId(taxId: string): string {
  return taxId.replace(/[\s./-]/g, "");
}

export function resolvePartnerKind(partnerKind: string, taxId: string): "b2c" | "b2b" {
  const raw = partnerKind.toLowerCase();
  if (raw === "b2b" || raw === "b2c") return raw;
  return compactTaxId(taxId).length >= 8 ? "b2b" : "b2c";
}

export function checkoutGap(fields: CheckoutFields): CheckoutGap | null {
  const name = fields.name.trim();
  const address = fields.address.trim();
  const email = fields.email.trim();
  const country = fields.country.trim();
  if (!name) return "name";
  if (!email || !EMAIL_RE.test(email)) return "email";
  if (!address) return "address";
  if (!country) return "country";
  if (fields.partnerKind === "b2b" && compactTaxId(fields.taxId).length < 8) return "taxId";
  if (fields.partnerKind === "b2c" && !fields.immediateConsent) return "consent";
  if (!fields.aszfAccepted) return "aszf";
  if (fields.payMethod !== "hu_transfer" && fields.payMethod !== "barion") return "pay";
  return null;
}

export function checkoutReady(fields: CheckoutFields): boolean {
  return checkoutGap(fields) === null;
}

export function buyerFromCheckout(body: Record<string, unknown>): Buyer | string {
  const name = String(body.name ?? "").trim();
  const address = String(body.address ?? "").trim();
  const email = String(body.email ?? "").trim();
  const taxId = String(body.taxId ?? "").trim();
  const country = String(body.country ?? "").trim() || countryFromTaxId(taxId) || undefined;
  const partnerKind = resolvePartnerKind(String(body.partnerKind ?? ""), taxId);
  const gap = checkoutGap({
    name,
    address,
    email,
    taxId,
    country: country ?? "",
    partnerKind,
    immediateConsent: body.immediateConsent === true || body.immediateConsent === "true",
    aszfAccepted: body.aszfAccepted === true || body.aszfAccepted === "true",
    payMethod: String(body.payMethod ?? "hu_transfer"),
  });
  if (gap === "name" || gap === "address") return "Név, cím és e-mail kell.";
  if (gap === "email") return email ? "Az e-mail formája hibás." : "Név, cím és e-mail kell.";
  if (gap === "country") return "Az ország kiválasztása kötelező.";
  if (gap === "taxId") return "Céges vásárláskor az adószám megadása kötelező.";
  if (gap === "consent") return "Fogyasztói vásárláskor az azonnali teljesítéshez való hozzájárulás kötelező.";
  if (gap === "aszf") return "Az ÁSZF és az adatvédelmi tájékoztató elfogadása kötelező.";
  if (gap === "pay") return "Ismeretlen fizetési mód.";
  return { name, address, email, taxId, country, partnerKind };
}
