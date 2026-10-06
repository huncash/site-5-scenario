import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadBillEnv } from "./loadenv.ts";

loadBillEnv();

function read(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

/** Rendelés / díjbekérő fájlok. BILL_DATA_DIR a VPS shared mappa. */
export function billDataRoot(): string {
  const override = read("BILL_DATA_DIR");
  if (override) return path.resolve(override);
  return fileURLToPath(new URL("../data", import.meta.url));
}

function truthyFalse(raw: string): boolean {
  return ["0", "false", "no", "off", "live", "prod"].includes(raw.toLowerCase());
}

export function readBarionPosKey(): string {
  return read("BARION_POS_KEY") || read("BARION_POSKEY");
}

export function readSzamlazzAgentKey(): string {
  return read("SZAMLAZZ_AGENT_KEY") || read("SZAMLAKEZELO_AGENT_KEY");
}

export function readSzamlazzSandbox(): boolean {
  return !truthyFalse(read("SZAMLAZZ_SANDBOX", "false"));
}

/** Éles üzem: NODE_ENV=production vagy BARION_ENV=prod. */
export function isLiveBilling(): boolean {
  return process.env.NODE_ENV === "production" || read("BARION_ENV").toLowerCase() === "prod";
}

/** Productionban kötelező: SZAMLAZZ_AGENT_KEY, SZAMLAZZ_SANDBOX=false, BARION_POS_KEY. */
export function liveBillingMissingKeys(): string[] {
  if (!isLiveBilling()) return [];
  const missing: string[] = [];
  if (!readSzamlazzAgentKey()) missing.push("SZAMLAZZ_AGENT_KEY");
  if (readSzamlazzSandbox()) missing.push("SZAMLAZZ_SANDBOX=false");
  if (!readBarionPosKey()) missing.push("BARION_POS_KEY");
  return missing;
}

export function liveBillingError(): string | null {
  const missing = liveBillingMissingKeys();
  if (!missing.length) return null;
  return `Éles számlázási kulcsok hiányoznak: ${missing.join(", ")}.`;
}

export const billEnv = {
  port: Number(read("BILL_PORT", "5110")) || 5110,
  publicUrl: read("BILL_PUBLIC_URL", "http://localhost:5110").replace(/\/$/, ""),
  stripeSecret: read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  barionPosKey: readBarionPosKey(),
  barionPixelId: read("BARION_PIXEL_ID"),
  barionEnv: read("BARION_ENV", "test") === "prod" ? "prod" : "test",
  szamlazzAgentKey: readSzamlazzAgentKey(),
  szamlazzSandbox: readSzamlazzSandbox(),
  szamlazzVat: Number(read("SZAMLAZZ_VAT", "27")) || 27,
  szamlaFeleszoEmail: read("SZAMLA_FELESZO_EMAIL"),
  transferIban: read("TRANSFER_IBAN", "HU00 ACCT-000028 0000 0000"),
  transferName: read("TRANSFER_ACCOUNT_NAME", "Szcenárió Kft."),
  transferBank: read("TRANSFER_BANK", "Belföldi bank — placeholder"),
  navLookupUrl: read("NAV_LOOKUP_URL"),
  barionPayee: read("BARION_PAYEE"),
  transferWebhookSecret: read("BILL_TRANSFER_SECRET"),
};

export function barionApiBase(): string {
  return billEnv.barionEnv === "prod" ? "https://api.barion.com" : "https://api.test.barion.com";
}
