import { decryptJSON, encryptJSON } from "@/lib/crypto";

export type BankRawPlain = {
  id: string;
  profile_id: string;
  workspace: string;
  bank_account_id?: string | null;
  account_ref?: string | null;
  ingested_at: string;
  booking_date_iso: string;
  value_date_iso: string;
  amount_signed: number;
  currency: string;
  booking_text: string;
  message: string;
  partner: string;
  partner_account: string;
  source_file?: string | null;
};

export type BankRawEnvelope = {
  id: string;
  profile_id: string;
  workspace: string;
  data_enc: string;
};

export type BankRawPayload = Omit<BankRawPlain, "id" | "profile_id">;

const PLAIN_FIELDS = [
  "booking_text",
  "message",
  "partner",
  "partner_account",
  "amount_signed",
  "account_ref",
] as const;

export function isEncryptedBankRawStored(row: unknown): row is BankRawEnvelope {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return typeof r.data_enc === "string" && r.data_enc.length > 0;
}

export function isLegacyPlainBankRaw(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  if (typeof r.data_enc === "string" && r.data_enc.length > 0) return false;
  return PLAIN_FIELDS.some((k) => r[k] != null);
}

export function envelopeHasPlainLeak(row: unknown): boolean {
  if (!row || typeof row !== "object") return false;
  const r = row as Record<string, unknown>;
  return PLAIN_FIELDS.some((k) => r[k] != null);
}

export async function toStoredBankRaw(key: CryptoKey, row: BankRawPlain): Promise<BankRawEnvelope> {
  const payload: BankRawPayload = {
    workspace: row.workspace,
    bank_account_id: row.bank_account_id ?? null,
    account_ref: row.account_ref ?? null,
    ingested_at: row.ingested_at,
    booking_date_iso: row.booking_date_iso,
    value_date_iso: row.value_date_iso,
    amount_signed: row.amount_signed,
    currency: row.currency,
    booking_text: row.booking_text,
    message: row.message,
    partner: row.partner,
    partner_account: row.partner_account,
    source_file: row.source_file ?? null,
  };
  return {
    id: row.id,
    profile_id: row.profile_id,
    workspace: row.workspace,
    data_enc: await encryptJSON(key, payload),
  };
}

export async function fromStoredBankRaw(key: CryptoKey, stored: unknown): Promise<BankRawPlain> {
  const r = stored as BankRawPlain & Partial<BankRawEnvelope>;
  if (isEncryptedBankRawStored(r)) {
    const p = await decryptJSON<BankRawPayload>(key, r.data_enc);
    return {
      id: r.id,
      profile_id: r.profile_id,
      ...p,
      workspace: p.workspace ?? r.workspace,
    };
  }
  return r as BankRawPlain;
}
