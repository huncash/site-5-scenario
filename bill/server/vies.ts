export type CompanyLookup = {
  ok: boolean;
  source?: "vies" | "nav";
  name?: string;
  address?: string;
  vatNumber?: string;
  error?: string;
};

function parseTax(input: string): { country: string; vat: string } | null {
  const raw = input.replace(/[\s./-]/g, "").toUpperCase();
  if (!raw) return null;
  if (/^[A-Z]{2}\d/.test(raw)) {
    const country = raw.slice(0, 2);
    let vat = raw.slice(2).replace(/\D/g, "");
    if (country === "HU") vat = vat.slice(0, 8);
    return vat.length >= 8 || country !== "HU" ? { country, vat } : null;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 8) return { country: "HU", vat: digits.slice(0, 8) };
  return null;
}

async function viesLookup(country: string, vat: string): Promise<CompanyLookup> {
  const url = `https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${encodeURIComponent(country)}/vat/${encodeURIComponent(vat)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) return { ok: false, error: `VIES ${res.status}` };
    const data = (await res.json()) as {
      isValid?: boolean;
      name?: string;
      address?: string;
      vatNumber?: string;
      userError?: string;
    };
    if (!data.isValid) return { ok: false, error: data.userError || "Az adószám a VIES-ben nem érvényes." };
    return {
      ok: true,
      source: "vies",
      name: (data.name ?? "").trim() || undefined,
      address: (data.address ?? "").replace(/\s+/g, " ").trim() || undefined,
      vatNumber: `${country}${data.vatNumber ?? vat}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "VIES nem elérhető.";
    return { ok: false, error: msg };
  } finally {
    clearTimeout(t);
  }
}

async function navProxyLookup(taxId: string, proxyUrl: string): Promise<CompanyLookup> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const url = new URL(proxyUrl);
    url.searchParams.set("taxId", taxId);
    const res = await fetch(url, { signal: ctrl.signal, headers: { accept: "application/json" } });
    if (!res.ok) return { ok: false, error: `NAV proxy ${res.status}` };
    const data = (await res.json()) as { name?: string; address?: string };
    if (!data.name && !data.address) return { ok: false, error: "A NAV lekérdezés nem adott cégadatot." };
    return { ok: true, source: "nav", name: data.name, address: data.address };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "NAV lekérdezés sikertelen." };
  } finally {
    clearTimeout(t);
  }
}

export async function lookupCompany(taxId: string, navProxyUrl?: string): Promise<CompanyLookup> {
  const parsed = parseTax(taxId);
  if (!parsed) return { ok: false, error: "Adószám formája hibás (HU: 8 számjegy vagy EU ÁFA-szám)." };
  const vies = await viesLookup(parsed.country, parsed.vat);
  if (vies.ok) return vies;
  if (navProxyUrl) {
    const nav = await navProxyLookup(taxId, navProxyUrl);
    if (nav.ok) return nav;
    return { ok: false, error: `${vies.error ?? ""} ${nav.error ?? ""}`.trim() };
  }
  return vies;
}
