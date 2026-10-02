import { billEnv } from "./env.ts";
import { formatHuf, tierLabel } from "./catalog.ts";
import type { Order } from "./store.ts";

function xmlEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function splitAddress(address: string): { irsz: string; telepules: string; cim: string } {
  const m = address.match(/^(\d{4})\s+([^,]+),?\s*(.*)$/);
  if (m) return { irsz: m[1], telepules: m[2].trim(), cim: m[3].trim() || m[2].trim() };
  return { irsz: "0000", telepules: "—", cim: address };
}

export function buildSzamlazzXml(order: Order): string {
  const a = splitAddress(order.buyer.address);
  const vat = billEnv.szamlazzVat;
  const netto = vat > 0 ? Math.round(order.amountHuf / (1 + vat / 100)) : order.amountHuf;
  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla">
  <beallitasok>
    <szamlaagentkulcs>${xmlEscape(billEnv.szamlazzAgentKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>false</szamlaLetoltes>
  </beallitasok>
  <fejlec>
    <keltDatum>${today()}</keltDatum>
    <teljesitesDatum>${today()}</teljesitesDatum>
    <fizetesiHataridoDatum>${today()}</fizetesiHataridoDatum>
    <fizmod>${order.payMethod === "hu_transfer" ? "Átutalás" : "Bankkártya"}</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${xmlEscape(`Szcenárió ${tierLabel(order.tier)} · ${order.id}`)}</megjegyzes>
    <rendelesSzam>${xmlEscape(order.id)}</rendelesSzam>
  </fejlec>
  <elado>
    <bank>${xmlEscape(billEnv.transferBank)}</bank>
    <bankszamlaszam>${xmlEscape(billEnv.transferIban)}</bankszamlaszam>
  </elado>
  <vevo>
    <nev>${xmlEscape(order.buyer.name)}</nev>
    <irsz>${xmlEscape(a.irsz)}</irsz>
    <telepules>${xmlEscape(a.telepules)}</telepules>
    <cim>${xmlEscape(a.cim)}</cim>
    <email>${xmlEscape(order.buyer.email)}</email>
    <sendEmail>true</sendEmail>
    <adoszam>${xmlEscape(order.buyer.taxId)}</adoszam>
  </vevo>
  <tetelek>
    <tetel>
      <megnevezes>${xmlEscape(`Szcenárió — ${tierLabel(order.tier)}`)}</megnevezes>
      <mennyiseg>1</mennyiseg>
      <mennyisegiEgyseg>db</mennyisegiEgyseg>
      <nettoEgysegar>${netto}</nettoEgysegar>
      <afakulcs>${vat}</afakulcs>
      <nettoErtek>${netto}</nettoErtek>
      <afaErtek>${order.amountHuf - netto}</afaErtek>
      <bruttoErtek>${order.amountHuf}</bruttoErtek>
      <megjegyzes>${xmlEscape(formatHuf(order.amountHuf))}</megjegyzes>
    </tetel>
  </tetelek>
</xmlszamla>
`;
}

export async function issueSzamlazzInvoice(order: Order): Promise<{ number?: string; error?: string }> {
  if (!billEnv.szamlazzAgentKey) return { error: "Számlázz.hu Agent kulcs hiányzik." };
  const xml = buildSzamlazzXml(order);
  const form = new FormData();
  form.set("action-xmlagentxmlfile", new Blob([xml], { type: "text/xml" }), "szamla.xml");
  const res = await fetch("https://www.szamlazz.hu/szamla/", { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) return { error: `Számlázz.hu ${res.status}` };
  const num = text.match(/<szamlaszam>([^<]+)<\/szamlaszam>/i)?.[1];
  if (text.includes("<hibakod>") || text.toLowerCase().includes("hiba")) {
    const hiba = text.match(/<hibauzenet>([^<]+)<\/hibauzenet>/i)?.[1] ?? "Számlázz.hu hiba";
    return { error: hiba };
  }
  return { number: num || "issued" };
}
