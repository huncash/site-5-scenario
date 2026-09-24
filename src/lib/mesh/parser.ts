import type { Transaction, TxnType } from "@/lib/mesh/transaction";

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseAmount(raw: string): number | null {
  const s = raw.trim().replace(/\s+/g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseDateToIso(raw: string): string | null {
  const s = raw.trim();
  const ymd = /^(\d{4})[-./](\d{2})[-./](\d{2})$/.exec(s);
  if (ymd) {
    const [, y, m, d] = ymd;
    return new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
  }
  const dmy = /^(\d{2})[./-](\d{2})[./-](\d{4})$/.exec(s);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
  }
  return null;
}

/**
 * TODO: Állítsd be a bankod TXT formátumához.
 * - Ha szeparátoros (tab/;), itt célszerű split-elni és pozíció alapján map-elni.
 * - Ha fix szélességű / regex-es, itt add meg a mezőket:
 *   date | description | amount (előjellel)
 */
const STATEMENT_LINE_RE =
  /^(?<date>\d{4}[-./]\d{2}[-./]\d{2}|\d{2}[./-]\d{2}[./-]\d{4})\s+(?<desc>.+?)\s+(?<amount>[+-]?\d[\d\s]*[.,]\d{2})\s*$/;

export function parseBankStatement(content: string): Transaction[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out: Transaction[] = [];

  for (const line of lines) {
    const m = STATEMENT_LINE_RE.exec(line);
    if (!m?.groups) continue;

    const occurred_at = parseDateToIso(m.groups.date) ?? new Date().toISOString();
    const signed = parseAmount(m.groups.amount);
    if (signed === null) continue;

    const type: TxnType = signed < 0 ? "expense" : "income";
    const amount = Math.abs(signed);
    const desc = m.groups.desc.trim();

    out.push({
      id: newId(),
      type,
      occurred_at,
      amount,
      category: "bank-import",
      note: desc || null,
    });
  }

  return out;
}

