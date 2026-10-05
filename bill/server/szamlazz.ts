import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { billEnv } from "./env.ts";
import { invoicePackageName, tierLabel } from "./catalog.ts";
import type { InvoiceLine, Order } from "./store.ts";
import { countryLabel } from "./vat.ts";

const AGENT_URL = "https://www.szamlazz.hu/szamla/";

export type SzamlazzKind = "dijbekero" | "szamla";

export type SzamlazzResult = {
  number?: string;
  error?: string;
  pdfBase64?: string;
  pdfUrl?: string;
  buyerAccountUrl?: string;
  sandbox?: boolean;
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
  return [
    {
      name: invoicePackageName(order.tier, order.interval),
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
  const sendEmail = Boolean(order.buyer.email) && !billEnv.szamlazzSandbox;
  const sellerEmail = billEnv.szamlaFeleszoEmail;
  const dijbekero = kind === "dijbekero";
  const refProforma = !dijbekero && order.proformaNumber ? order.proformaNumber : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<xmlszamla xmlns="http://www.szamlazz.hu/xmlszamla" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.szamlazz.hu/xmlszamla https://www.szamlazz.hu/szamla/docs/xsds/agent/xmlszamla.xsd">
  <beallitasok>
    <szamlaagentkulcs>${xmlEscape(billEnv.szamlazzAgentKey)}</szamlaagentkulcs>
    <eszamla>true</eszamla>
    <szamlaLetoltes>true</szamlaLetoltes>
    <valaszVerzio>2</valaszVerzio>
  </beallitasok>
  <fejlec>
    <keltDatum>${today()}</keltDatum>
    <teljesitesDatum>${today()}</teljesitesDatum>
    <fizetesiHataridoDatum>${due}</fizetesiHataridoDatum>
    <fizmod>${order.payMethod === "hu_transfer" ? "Átutalás" : "Bankkártya"}</fizmod>
    <penznem>HUF</penznem>
    <szamlaNyelve>hu</szamlaNyelve>
    <megjegyzes>${xmlEscape(`Szcenárió ${tierLabel(order.tier)} · ${order.id}${order.transferCode ? ` · ${order.transferCode}` : ""}${billEnv.szamlazzSandbox ? " · SANDBOX" : ""}`)}</megjegyzes>
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

function decodeXmlText(raw: string): string {
  return raw
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .trim();
}

function headerText(headers: Headers, name: string): string {
  const raw = headers.get(name);
  if (!raw) return "";
  try {
    return decodeURIComponent(raw.replace(/\+/g, " ")).trim();
  } catch {
    return raw.trim();
  }
}

function xmlTag(text: string, tag: string): string {
  const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeXmlText(m[1]) : "";
}

export function parseAgentReply(text: string, headers: Headers = new Headers()): SzamlazzResult {
  const headerErr = headerText(headers, "szlahu_error");
  const headerCode = headerText(headers, "szlahu_error_code");
  const num =
    headerText(headers, "szlahu_szamlaszam") ||
    xmlTag(text, "szamlaszam") ||
    text.match(/xmlagentresponse=DONE;([^\s;<]+)/i)?.[1]?.trim();
  const pdfMatch = text.match(/<pdf>([\s\S]*?)<\/pdf>/i)?.[1]?.replace(/\s+/g, "") || undefined;
  const buyerAccountUrl =
    headerText(headers, "szlahu_vevoifiokurl") ||
    xmlTag(text, "vevoifiokurl") ||
    xmlTag(text, "szamlanetolink") ||
    undefined;
  const failedXml = /<sikeres>\s*false\s*<\/sikeres>/i.test(text);
  const errBody = text.match(/\[ERR\]\s*([^\r\n]+)/)?.[1]?.trim();
  if (failedXml || headerCode || headerErr || errBody) {
    const hiba =
      headerErr ||
      xmlTag(text, "hibauzenet") ||
      xmlTag(text, "hiba") ||
      errBody ||
      "Számlázz.hu hiba";
    return { error: hiba, number: num, pdfBase64: pdfMatch, pdfUrl: buyerAccountUrl, buyerAccountUrl };
  }
  if (num) return { number: num, pdfBase64: pdfMatch, pdfUrl: buyerAccountUrl, buyerAccountUrl };
  if (text.includes("<html") || text.includes("<!DOCTYPE")) {
    return { error: "Számlázz.hu HTML választ adott (Agent-kulcs / jogosultság)." };
  }
  return { error: "Számlázz.hu nem adott vissza bizonylatszámot." };
}

const PROFORMA_DIR = fileURLToPath(new URL("../data/proformas", import.meta.url));

export function proformaPdfPath(orderId: string): string {
  return path.join(PROFORMA_DIR, `${orderId}.pdf`);
}

export async function saveProformaPdf(orderId: string, pdfBase64: string): Promise<string | undefined> {
  const buf = Buffer.from(pdfBase64.replace(/\s+/g, ""), "base64");
  if (buf.length < 5 || buf.subarray(0, 4).toString("latin1") !== "%PDF") return undefined;
  await mkdir(PROFORMA_DIR, { recursive: true });
  await writeFile(proformaPdfPath(orderId), buf);
  return `/api/billing/proforma/${encodeURIComponent(orderId)}`;
}

async function postAgent(xml: string): Promise<SzamlazzResult> {
  const form = new FormData();
  form.set("action-xmlagentxmlfile", new Blob([xml], { type: "text/xml" }), "xmlszamla.xml");
  const res = await fetch(AGENT_URL, { method: "POST", body: form });
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("utf8");
  const ct = res.headers.get("content-type") ?? "";
  if (!res.ok) {
    const parsed = parseAgentReply(text, res.headers);
    return { error: parsed.error || `Számlázz.hu ${res.status}` };
  }
  if (ct.includes("pdf") || text.startsWith("%PDF")) {
    const parsed = parseAgentReply(text, res.headers);
    const number = parsed.number || res.headers.get("szlahu_szamlaszam")?.trim();
    if (!number) return { error: "Számlázz.hu nem adott vissza bizonylatszámot." };
    return {
      number,
      pdfBase64: buf.toString("base64"),
      pdfUrl: parsed.buyerAccountUrl,
      buyerAccountUrl: parsed.buyerAccountUrl,
    };
  }
  return parseAgentReply(text, res.headers);
}

function mockProforma(order: Order): SzamlazzResult {
  const token = order.id.replace(/-/g, "").slice(0, 10).toUpperCase();
  return {
    number: `DB-TEST-${token}`,
    sandbox: true,
  };
}

export async function issueSzamlazzDocument(order: Order, kind: SzamlazzKind): Promise<SzamlazzResult> {
  if (!billEnv.szamlazzAgentKey) {
    if (billEnv.szamlazzSandbox) return mockProforma(order);
    return { error: "Számlázz.hu Agent kulcs hiányzik (SZAMLAZZ_AGENT_KEY)." };
  }
  const issued = await postAgent(buildSzamlazzXml(order, kind));
  if (issued.pdfBase64) {
    const local = await saveProformaPdf(order.id, issued.pdfBase64);
    if (local && !issued.pdfUrl) issued.pdfUrl = local;
  }
  if (billEnv.szamlazzSandbox) return { ...issued, sandbox: true };
  return issued;
}

export async function issueSzamlazzProforma(order: Order): Promise<SzamlazzResult> {
  return issueSzamlazzDocument(order, "dijbekero");
}

export async function issueSzamlazzInvoice(order: Order): Promise<SzamlazzResult> {
  return issueSzamlazzDocument(order, "szamla");
}
