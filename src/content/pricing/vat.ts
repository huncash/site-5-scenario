/** Local-first EU VAT table. No network. Rates are standard (normal) VAT. */

export const SELLER_COUNTRY = "HU";

export type VatTreatment = "domestic" | "reverse_charge" | "eu_distance" | "export";

export type VatDecision = {
  country: string;
  rate: number;
  vatCode: string;
  treatment: VatTreatment;
  labelHu: string;
  labelEn: string;
};

export const EU_STANDARD_VAT: Record<string, number> = {
  AT: 20,
  BE: 21,
  BG: 20,
  CY: 19,
  CZ: 21,
  DE: 19,
  DK: 25,
  EE: 22,
  ES: 21,
  FI: 25.5,
  FR: 20,
  GR: 24,
  HR: 25,
  HU: 27,
  IE: 23,
  IT: 22,
  LT: 21,
  LU: 17,
  LV: 21,
  MT: 18,
  NL: 21,
  PL: 23,
  PT: 23,
  RO: 19,
  SE: 25,
  SI: 22,
  SK: 23,
};

const COUNTRY_HU: Record<string, string> = {
  AT: "Ausztria",
  BE: "Belgium",
  BG: "Bulgária",
  CY: "Ciprus",
  CZ: "Csehország",
  DE: "Németország",
  DK: "Dánia",
  EE: "Észtország",
  ES: "Spanyolország",
  FI: "Finnország",
  FR: "Franciaország",
  GR: "Görögország",
  HR: "Horvátország",
  HU: "Magyarország",
  IE: "Írország",
  IT: "Olaszország",
  LT: "Litvánia",
  LU: "Luxemburg",
  LV: "Lettország",
  MT: "Málta",
  NL: "Hollandia",
  PL: "Lengyelország",
  PT: "Portugália",
  RO: "Románia",
  SE: "Svédország",
  SI: "Szlovénia",
  SK: "Szlovákia",
  XX: "EU-n kívül",
};

const COUNTRY_EN: Record<string, string> = {
  AT: "Austria",
  BE: "Belgium",
  BG: "Bulgaria",
  CY: "Cyprus",
  CZ: "Czechia",
  DE: "Germany",
  DK: "Denmark",
  EE: "Estonia",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GR: "Greece",
  HR: "Croatia",
  HU: "Hungary",
  IE: "Ireland",
  IT: "Italy",
  LT: "Lithuania",
  LU: "Luxembourg",
  LV: "Latvia",
  MT: "Malta",
  NL: "Netherlands",
  PL: "Poland",
  PT: "Portugal",
  RO: "Romania",
  SE: "Sweden",
  SI: "Slovenia",
  SK: "Slovakia",
  XX: "Outside the EU",
};

const VAT_PREFIX_ISO: Record<string, string> = { EL: "GR" };

export const VAT_COUNTRIES = [
  "HU",
  ...Object.keys(EU_STANDARD_VAT).filter((c) => c !== "HU").sort(),
  "XX",
];

export function countryLabel(code: string, lang: "hu" | "en" = "hu"): string {
  const map = lang === "en" ? COUNTRY_EN : COUNTRY_HU;
  return map[code] ?? code;
}

export function isEuCountry(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(EU_STANDARD_VAT, code);
}

export function countryFromTaxId(taxId: string): string | null {
  const raw = taxId.replace(/[\s./-]/g, "").toUpperCase();
  if (/^[A-Z]{2}[A-Z0-9]/.test(raw)) {
    const prefix = raw.slice(0, 2);
    return VAT_PREFIX_ISO[prefix] ?? prefix;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) return "HU";
  return null;
}

function looksLikeVatId(taxId: string): boolean {
  const raw = taxId.replace(/[\s./-]/g, "").toUpperCase();
  if (/^[A-Z]{2}[A-Z0-9]{2,12}$/.test(raw)) return true;
  return raw.replace(/\D/g, "").length >= 8;
}

export function resolveVat(input: { country?: string; taxId?: string }): VatDecision {
  const fromTax = input.taxId ? countryFromTaxId(input.taxId) : null;
  const country = (input.country || fromTax || SELLER_COUNTRY).toUpperCase();
  const iso = VAT_PREFIX_ISO[country] ?? country;
  const nameHu = countryLabel(iso);
  const nameEn = countryLabel(iso, "en");

  if (!isEuCountry(iso)) {
    return {
      country: iso,
      rate: 0,
      vatCode: "0",
      treatment: "export",
      labelHu: `0% ÁFA · export (${nameHu})`,
      labelEn: `0% VAT · export (${nameEn})`,
    };
  }

  const taxIso = fromTax ? VAT_PREFIX_ISO[fromTax] ?? fromTax : null;
  if (iso !== SELLER_COUNTRY && taxIso && taxIso !== SELLER_COUNTRY && input.taxId && looksLikeVatId(input.taxId)) {
    return {
      country: iso,
      rate: 0,
      vatCode: "F.AFA",
      treatment: "reverse_charge",
      labelHu: `0% ÁFA · fordított adózás (${nameHu})`,
      labelEn: `0% VAT · reverse charge (${nameEn})`,
    };
  }

  const rate = EU_STANDARD_VAT[iso] ?? 27;
  if (iso === SELLER_COUNTRY) {
    return {
      country: iso,
      rate,
      vatCode: String(rate),
      treatment: "domestic",
      labelHu: `${rate}% ÁFA · ${nameHu}`,
      labelEn: `${rate}% VAT · ${nameEn}`,
    };
  }

  return {
    country: iso,
    rate,
    vatCode: String(rate),
    treatment: "eu_distance",
    labelHu: `${rate}% ÁFA · ${nameHu}`,
    labelEn: `${rate}% VAT · ${nameEn}`,
  };
}

export function splitVat(net: number, rate: number): { net: number; vat: number; gross: number } {
  const n = Math.round(net);
  const vat = Math.round((n * rate) / 100);
  return { net: n, vat, gross: n + vat };
}

/**
 * Publikus bruttó megjelenítés: legközelebbi 10 Ft-ra kerekítve
 * (4900→6223→6220, 2900→3683→3680, 6900→8763→8760, 1200→1524→1520).
 */
export function roundCommercialGrossHuf(gross: number): number {
  if (!Number.isFinite(gross)) return 0;
  return Math.round(gross / 10) * 10;
}

/** Nettó → kerekített publikus bruttó (ÁFA-val). */
export function publicGrossFromNet(net: number, rate: number): number {
  return roundCommercialGrossHuf(splitVat(net, rate).gross);
}
