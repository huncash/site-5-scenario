import { billEnv } from "./env.ts";
import { tierLabel } from "./catalog.ts";
import type { InvoiceLine, Order } from "./store.ts";
import { countryLabel } from "./vat.ts";

const AGENT_URL = "https://www.szamlazz.hu/szamla/";

export type SzamlazzKind = "dijbekero" | "szamla";

export type SzamlazzResult = {
  number?: string;
  error?: string;
};

export type BuiltLine = {
  name: string;
  quantity: number;
  unit: string;
  netUnitPrice: number;
  vat: string;
  net: number;
  vatAmount: number;
  gross: number;
};

function vatXml(vat: number | string | undefined): string {
  if (typeof vat === "string" && vat.trim()) return vat.trim();
  if (typeof vat === "number" && Number.isFinite(vat)) return String(vat);
  return String(billEnv.szamlazzVat);
}

function vatPercent(vat: number | string | undefined): number {
  const code = vatXml(vat).toUpperCase();
  if (code === "F.AFA" || code === "ATK" || code === "TAM" || code === "AAM" || code === "0") return 0;
  const n = Number(code);
  return Number.isFinite(n) ? n : 0;
}

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

function addDays(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function splitAddress(address: string, zip?: string, city?: string): { irsz: string; telepules: string; cim: string } {
  if (zip && city) return { irsz: zip.trim(), telepules: city.trim(), cim: address.trim() || city.trim() };
  const m = address.match(/^(\d{4})\s+([^,]+),?\s*(.*)$/);
  if (m) return { irsz: m[1], telepules: m[2].trim(), cim: m[3].trim() || m[2].trim() };
  return { irsz: "0000", telepules: "—", cim: address };
}

export function lineAmounts(line: InvoiceLine): BuiltLine {
  const quantity = Number.isFinite(line.quantity) && line.quantity > 0 ? line.quantity : 1;
  const vat = vatXml(line.vat);
  const rate = vatPercent(line.vat);
  const netUnitPrice = Math.round(line.netUnitPrice);
  const net = Math.round(netUnitPrice * quantity);
  const vatAmount = Math.round((net * rate) / 100);
  return {
    name: line.name,
    quantity,
    unit: line.unit || "db",
    netUnitPrice,
    vat,
    net,
    vatAmount,
    gross: net + vatAmount,
  };
}

export function linesFromOrder(order: Order): BuiltLine[] {
  if (order.lines?.length) return order.lines.map(lineAmounts);
  const vat = vatXml(order.vatCode ?? billEnv.szamlazzVat);
  const rate = vatPercent(vat);
  const net = order.netHuf ?? (rate > 0 ? Math.round(order.amountHuf / (1 + rate / 100)) : order.amountHuf);
  const vatAmount = Math.round((net * rate) / 100);
  const interval = order.interval === "yearly" ? "1 év" : "1 hó";
  return [
    {
      name: `Szcenárió — ${tierLabel(order.tier)} (${interval})`,
      quantity: 1,
      unit: "db",
      netUnitPrice: net,
      vat,
      net,
      vatAmount,
      gross: net + vatAmount,
    },
  ];
}

export function grossFromLines(lines: InvoiceLine[]): number {
  return lines.map(lineAmounts).reduce((sum, l) => sum + l.gross, 0);
}

function tetelXml(line: BuiltLine): string {
  return `    <tetel>
      <megnevezes>${xmlEscape(line.name)}</megnevezes>
      <mennyiseg>${line.quantity}</mennyiseg>
      <mennyisegiEgyseg>${xmlEscape(line.unit)}</mennyisegiEgyseg>
      <nettoEgysegar>${line.netUnitPrice}</nettoEgysegar>
      <afakulcs>${line.vat}</afakulcs>
      <nettoErtek>${line.net}</nettoErtek>
      <afaErtek>${line.vatAmount}</afaErtek>
      <bruttoErtek>${line.gross}</bruttoErtek>
    </tetel>`;
}

export function buildSzamlazzXml(order: Order, kind: SzamlazzKind = "szamla"): string {
  const a = splitAddress(order.buyer.address, order.buyer.zip, order.buyer.city);
  const lines = linesFromOrder(order);
  const due = kind === "dijbekero" ? addDays(8) : today();
  const sendEmail = Boolean(order.buyer.email);
  const sellerEmail = billEnv.szamlaFeleszoEmail;
  const dijbekero = kind === "dijbekero";
  const refProforma = !dijbekero && order.proformaNumber ? order.proformaNumber : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd">
  <beallitasok>
    <szamlaagentkulcs>${xmlEscape(billEnv.szamlazzAgentKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>false</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${today()}</keltDatum>
    <teljesitesDatum>${today()}</teljesitesDatum>
    <fizetesiHataridoDatum>${due}</fizetesiHataridoDatum>
    <fizmod>${order.payMethod === "hu_transfer" ? "Átutalás" : "Bankkártya"}</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${xmlEscape(`Szcenárió ${tierLabel(order.tier)} · ${order.id}${order.transferCode ? ` · ${order.transferCode}` : ""}`)}</megjegyzes>
    <rendelesSzam>${xmlEscape(order.id)}</rendelesSzam>
    <dijbekeroSzamlaszam>${xmlEscape(refProforma)}</dijbekeroSzamlaszam>
    <elolegszamla>false</elolegszamla>
    <vegszamla>false</vegszamla>
    <helyesbitoszamla>false</helyesbitoszamla>
    <helyesbitettSzamlaszam></helyesbitettSzamlaszam>
    <dijbekero>${dijbekero ? "true" : "false"}</dijbekero>
  </fejlec>
  <elado>
    <bank>${xmlEscape(billEnv.transferBank)}</bank>
    <bankszamlaszam>${xmlEscape(billEnv.transferIban)}</bankszamlaszam>
    ${sellerEmail ? `<email>${xmlEscape(sellerEmail)}</email>` : ""}
  </elado>
  <vevo>
    <nev>${xmlEscape(order.buyer.name)}</nev>
    <irsz>${xmlEscape(a.irsz)}</irsz>
    <telepules>${xmlEscape(a.telepules)}</telepules>
    <cim>${xmlEscape(a.cim)}</cim>
    <email>${xmlEscape(order.buyer.email)}</email>
    <sendEmail>${sendEmail ? "true" : "false"}</sendEmail>
    <adoszam>${xmlEscape(order.buyer.taxId)}</adoszam>
    ${order.vatTreatment === "reverse_charge" && order.buyer.taxId ? `<adoszamEU>${xmlEscape(order.buyer.taxId)}</adoszamEU>` : ""}
    ${order.buyerCountry ? `<orszag>${xmlEscape(countryLabel(order.buyerCountry))}</orszag>` : ""}
  </vevo>
  <tetelek>
${lines.map(tetelXml).join("\n")}
  </tetelek>
</xmlszamla>
`;
}

function parseAgentReply(text: string, headers: Headers): SzamlazzResult {
  const fromHeader = headers.get("szlahu_szamlaszam")?.trim();
  const num =
    fromHeader ||
    text.match(/<szamlaszam>([^<]+)<\/szamlaszam>/i)?.[1]?.trim();
  const failed =
    /<sikeres>\s*false\s*<\/sikeres>/i.test(text) ||
    /<hibakod>/i.test(text);
  if (failed) {
    const hiba =
      text.match(/<hibauzenet>([^<]+)<\/hibauzenet>/i)?.[1] ??
      text.match(/<hiba>([^<]+)<\/hiba>/i)?.[1] ??
      "Számlázz.hu hiba";
    return { error: hiba, number: num };
  }
  if (num) return { number: num };
  return { error: "Számlázz.hu nem adott vissza bizonylatszámot." };
}

async function postAgent(xml: string): Promise<SzamlazzResult> {
  if (!billEnv.szamlazzAgentKey) return { error: "Számlázz.hu Agent kulcs hiányzik." };
  const form = new FormData();
  form.set("action-xmlagentxmlfile", new Blob([xml], { type: "text/xml" }), "szamla.xml");
  const res = await fetch(AGENT_URL, { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) return { error: `Számlázz.hu ${res.status}` };
  return parseAgentReply(text, res.headers);
}

export async function issueSzamlazzDocument(order: Order, kind: SzamlazzKind): Promise<SzamlazzResult> {
  return postAgent(buildSzamlazzXml(order, kind));
}

export async function issueSzamlazzProforma(order: Order): Promise<SzamlazzResult> {
  return issueSzamlazzDocument(order, "dijbekero");
}

export async function issueSzamlazzInvoice(order: Order): Promise<SzamlazzResult> {
  return issueSzamlazzDocument(order, "szamla");
}
