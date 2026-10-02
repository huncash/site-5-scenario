function read(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export const billEnv = {
  port: Number(read("BILL_PORT", "5110")) || 5110,
  publicUrl: read("BILL_PUBLIC_URL", "http://localhost:5110").replace(/\/$/, ""),
  stripeSecret: read("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET"),
  barionPosKey: read("BARION_POSKEY"),
  barionEnv: read("BARION_ENV", "test") === "prod" ? "prod" : "test",
  szamlazzAgentKey: read("SZAMLAZZ_AGENT_KEY") || read("SZAMLAKEZELO_AGENT_KEY"),
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
