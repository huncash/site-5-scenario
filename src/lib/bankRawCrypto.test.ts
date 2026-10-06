import { describe, expect, it } from "vitest";

import { deriveKey, randomSaltB64 } from "@/lib/crypto";
import {
  envelopeHasPlainLeak,
  fromStoredBankRaw,
  isEncryptedBankRawStored,
  isLegacyPlainBankRaw,
  toStoredBankRaw,
  type BankRawPlain,
} from "@/lib/bankRawCrypto";

const sample: BankRawPlain = {
  id: "bankraw:test:1",
  profile_id: "p1",
  workspace: "personal",
  bank_account_id: "acc1",
  account_ref: "123",
  ingested_at: "2026-10-06T12:00:00.000Z",
  booking_date_iso: "2026-10-01",
  value_date_iso: "2026-10-01",
  amount_signed: -12500,
  currency: "HUF",
  booking_text: "Átutalás",
  message: "Közlemény titkos",
  partner: "Lidl",
  partner_account: "11773016",
  source_file: "kivonat.xml",
};

describe("bankRawCrypto", () => {
  it("stores partner, amount and message only inside data_enc", async () => {
    const key = await deriveKey("teszt-jelszo", randomSaltB64());
    const stored = await toStoredBankRaw(key, sample);
    expect(isEncryptedBankRawStored(stored)).toBe(true);
    expect(envelopeHasPlainLeak(stored)).toBe(false);
    expect(JSON.stringify(stored)).not.toMatch(/Lidl|12500|Közlemény titkos/);
    const back = await fromStoredBankRaw(key, stored);
    expect(back.partner).toBe("Lidl");
    expect(back.amount_signed).toBe(-12500);
    expect(back.message).toBe("Közlemény titkos");
    expect(back.workspace).toBe("personal");
  });

  it("reads legacy plaintext rows and flags them for migration", () => {
    expect(isLegacyPlainBankRaw(sample)).toBe(true);
    expect(isEncryptedBankRawStored(sample)).toBe(false);
  });
});
