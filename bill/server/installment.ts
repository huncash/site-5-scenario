import {
  addDaysIso,
  INSTALLMENT2_DUE_DAYS,
  installment2ArrearsActive,
  installmentAllowed,
  splitEqualParts,
} from "../../src/lib/installmentPlan.ts";
import { invoicePackageName, type BillInterval, type BillTier } from "./catalog.ts";
import { splitVat } from "./vat.ts";
import type { InvoiceLine, Order, OrderInstallment } from "./store.ts";

export {
  addDaysIso,
  INSTALLMENT2_CHECK_FROM_DAYS,
  INSTALLMENT2_CHECK_UNTIL_DAYS,
  INSTALLMENT2_DUE_DAYS,
  INSTALLMENT_COUNT,
  installment2ArrearsActive,
  installmentAllowed,
  splitEqualParts,
} from "../../src/lib/installmentPlan.ts";

export function isPayPlan(v: unknown): v is "full" | "installment2" {
  return v === "full" || v === "installment2";
}

export function installment2Paid(order: Pick<Order, "installments">): boolean {
  const second = order.installments?.find((i) => i.n === 2);
  return second?.status === "paid" || second?.status === "invoiced";
}

export function buildInstallments(input: {
  dueNet: number;
  vatRate: number;
  dueGross: number;
  createdAt?: Date;
  transferCodes: [string, string];
}): OrderInstallment[] {
  const created = input.createdAt ?? new Date();
  const nets = splitEqualParts(input.dueNet);
  const first = splitVat(nets[0] ?? 0, input.vatRate);
  const second = splitVat(nets[1] ?? 0, input.vatRate);
  const drift = input.dueGross - first.gross - second.gross;
  second.gross += drift;
  return [
    {
      n: 1,
      netHuf: first.net,
      amountHuf: first.gross,
      status: "awaiting_transfer",
      dueAt: created.toISOString(),
      transferCode: input.transferCodes[0],
    },
    {
      n: 2,
      netHuf: second.net,
      amountHuf: second.gross,
      status: "awaiting_transfer",
      dueAt: addDaysIso(created, INSTALLMENT2_DUE_DAYS),
      transferCode: input.transferCodes[1],
    },
  ];
}

export function installmentLineName(tier: BillTier, interval: BillInterval, n: 1 | 2): string {
  return `${invoicePackageName(tier, interval)} — ${n}. részlet (2-ből)`;
}

export function orderForInstallment(order: Order, inst: OrderInstallment): Order {
  const lines: InvoiceLine[] = [
    {
      name: installmentLineName(order.tier, order.interval, inst.n),
      quantity: 1,
      unit: "db",
      netUnitPrice: inst.netHuf,
      vat: order.vatCode ?? order.vatRate ?? 27,
    },
  ];
  return {
    ...order,
    id: `${order.id}-i${inst.n}`,
    amountHuf: inst.amountHuf,
    netHuf: inst.netHuf,
    transferCode: inst.transferCode,
    proformaNumber: inst.proformaNumber,
    invoiceNumber: inst.invoiceNumber,
    lines,
  };
}

export function installmentNByTransferCode(order: Order, code: string): 1 | 2 | null {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const hit = order.installments?.find((i) => (i.transferCode ?? "").toUpperCase() === c);
  if (hit) return hit.n;
  if ((order.transferCode ?? "").toUpperCase() === c) return order.installments?.[0]?.n ?? null;
  return null;
}
