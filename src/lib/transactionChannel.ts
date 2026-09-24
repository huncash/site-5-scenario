import type { TxnType } from "@/lib/finance";

export type TransactionChannel = "card" | "transfer" | "cash" | "bank";

function foldHu(input: string) {
  return String(input ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(h: string, needles: string[]) {
  return needles.some((n) => h.includes(n));
}

export function detectTransactionChannel(text: string): TransactionChannel {
  const h = foldHu(text).replace(/\s+/g, " ").trim();
  if (!h) return "bank";

  // CASH first (ATM/KP)
  if (includesAny(h, [" atm", "atm ", "keszpenz", "keszpen", "kp ", " kp", "bankjegy", "befizetes"])) {
    return "cash";
  }

  // CARD (POS / kártya / masked digits)
  const hasMaskedDigits = /\*{2,}\s*\d{4}\b/.test(h);
  const hasCardKw = includesAny(h, ["pos", "kartya", "kartyafoglalas", "mastercard", "visa"]);
  const has4Digits = /\b\d{4}\b/.test(h);
  if (hasMaskedDigits || hasCardKw || (has4Digits && includesAny(h, ["kartya", "pos", "mastercard", "visa"]))) {
    return "card";
  }

  // TRANSFER
  if (
    includesAny(h, [
      "atutalas",
      "atutas",
      "netbank",
      "belfoldi ft atut",
      "sepa",
      "giro",
      "terheles",
      "jovairas",
      "utalas",
    ])
  ) {
    return "transfer";
  }

  return "bank";
}

export function channelLabel(ch: TransactionChannel, txnType?: TxnType): string {
  if (ch === "card") return "💳 Kártya";
  if (ch === "cash") return "💵 KP";
  if (ch === "transfer") {
    if (txnType === "income") return "↙️ Utalás";
    if (txnType === "expense") return "↗️ Utalás";
    return "↔️ Utalás";
  }
  return "🏛️ Bank";
}

export function channelBadgeClass(ch: TransactionChannel): string {
  if (ch === "card") return "border-violet-500/30 bg-violet-500/10 text-violet-200";
  if (ch === "cash") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (ch === "transfer") return "border-sky-500/30 bg-sky-500/10 text-sky-200";
  return "border-slate-500/30 bg-slate-500/10 text-slate-200";
}

