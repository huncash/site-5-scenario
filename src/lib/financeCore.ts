import type { Transaction } from "@/lib/finance";
import { computeVatSplit } from "@/lib/finance";

export function netHufAny(t: Transaction): number {
  const huf = Number(t.amount ?? 0);
  const eur = Number(t.eur_amount ?? 0);
  const rate = Number(t.eur_rate ?? 0);
  const eurHuf = eur > 0 && rate > 0 ? eur * rate : 0;
  return huf + eurHuf;
}

export function isMemberLoanInternalTransfer(t: Transaction): boolean {
  return t.internal_transfer_kind === "member_loan_out" || t.internal_transfer_kind === "member_loan_repay";
}

export function computeBusinessNetResultNet(txns: Transaction[]): number {
  return txns.reduce((acc, t) => {
    if (t.type === "saving") return acc;
    if (isMemberLoanInternalTransfer(t)) return acc;
    const net = netHufAny(t);
    return acc + (t.type === "income" ? net : -net);
  }, 0);
}

export function computeQuarterLockedVat(txns: Transaction[], now = new Date()): {
  start: Date;
  end: Date;
  outVat: number;
  inVat: number;
  lockedVat: number;
} {
  const q = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), q * 3, 1);
  const end = new Date(now.getFullYear(), q * 3 + 3, 1);
  let outVat = 0;
  let inVat = 0;
  for (const t of txns) {
    if (t.type === "saving") continue;
    if (isMemberLoanInternalTransfer(t)) continue;
    const d = new Date(t.occurred_at);
    if (d < start || d >= end) continue;
    const treatment = t.vat_treatment ?? "hu_gross";
    if (treatment === "no_vat" || treatment === "foreign") continue;
    const net = netHufAny(t);
    const rate = t.vat_rate ?? 27;
    const vat = computeVatSplit(net, rate, "net").vat;
    if (treatment === "reverse_charge") {
      // reverse charge is payable, but offset/deduct is handled elsewhere; in liquidity we treat it as locked
      outVat += vat;
      continue;
    }
    if (t.type === "income") outVat += vat;
    else inVat += vat;
  }
  const lockedVat = Math.max(0, outVat - inVat);
  return { start, end, outVat, inVat, lockedVat };
}

export function computeFreeBudget(bankBalanceGross: number, lockedVat: number, piggies: number): number {
  return bankBalanceGross - lockedVat - piggies;
}

export function isTransportTransaction(t: Transaction): boolean {
  const cat = String((t as any).category ?? "").toLowerCase().trim();
  if (cat === "transport" || cat === "szállítás" || cat === "szallitas") return true;

  const blob = `${String((t as any).party ?? "")} ${String((t as any).note ?? "")} ${String((t as any).title ?? "")}`
    .toLowerCase()
    .trim();
  if (!blob) return false;

  return /(?:fuvar|szállítás|szallitas|gls|dpd|posta|fut[aá]r|shipping)/i.test(blob);
}

