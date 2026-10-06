import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { BillInterval, BillTier } from "./catalog.ts";
import { billDataRoot } from "./env.ts";

export type PayMethod = "stripe" | "barion" | "hu_transfer";
export type OrderStatus = "pending" | "awaiting_transfer" | "paid" | "invoiced" | "failed";
export type PayPlan = "full" | "installment2";
export type InstallmentStatus = "awaiting_transfer" | "paid" | "invoiced";

export type OrderInstallment = {
  n: 1 | 2;
  netHuf: number;
  amountHuf: number;
  status: InstallmentStatus;
  dueAt: string;
  transferCode?: string;
  proformaNumber?: string;
  invoiceNumber?: string;
  pdfUrl?: string;
  paidAt?: string;
};

export type PartnerKind = "b2c" | "b2b";

export type Buyer = {
  name: string;
  lastName?: string;
  firstName?: string;
  address: string;
  zip?: string;
  city?: string;
  country?: string;
  taxId: string;
  email: string;
  /** Fogyasztó (b2c) vs vállalkozás (b2b) — elállási jog besorolás. */
  partnerKind?: PartnerKind;
  /** Opcionális NIP-05 vagy npub a licenchez. */
  nostr?: string;
};

export type InvoiceLine = {
  name: string;
  quantity: number;
  unit: string;
  netUnitPrice: number;
  vat: number | string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  tier: BillTier;
  interval: BillInterval;
  ref?: string;
  amountHuf: number;
  netHuf?: number;
  vatRate?: number;
  vatCode?: string;
  vatTreatment?: string;
  buyerCountry?: string;
  payMethod: PayMethod;
  transferCode?: string;
  buyer: Buyer;
  providerRef?: string;
  invoiceNumber?: string;
  proformaNumber?: string;
  pdfUrl?: string;
  addon?: string;
  lines?: InvoiceLine[];
  /** Saját ajánlói kód (ezt mások használják). */
  referralCode?: string;
  /** A vásárláskor megadott ajánló kód. */
  referredBy?: string;
  /**
   * Ajánlói ajándék slot linkek (peer order).
   * Aktív csak amíg mindkét fél paid/invoiced — cap 25.
   */
  referralGifts?: Array<{ peerOrderId: string; at: string }>;
  /** Számított / legacy aktív ajándék slot szám (license API). */
  permanentSlots?: number;
  referralAwarded?: boolean;
  referralRejectedReason?: string;
  /** Stripe payment_method fingerprint vagy egyéb kártya-ujjlenyomat. */
  cardFingerprint?: string;
  /** Slot bővítő pack (nem campus). */
  slotPack?: string;
  /** Egy összeg vagy két egyenlő 1. évi részlet. */
  payPlan?: PayPlan;
  fullAmountHuf?: number;
  fullNetHuf?: number;
  installments?: OrderInstallment[];
};

const dir = billDataRoot();
const file = path.join(dir, "orders.json");

let cache: Order[] | null = null;

async function load(): Promise<Order[]> {
  if (cache) return cache;
  try {
    const raw = await readFile(file, "utf8");
    cache = JSON.parse(raw) as Order[];
  } catch {
    cache = [];
  }
  return cache;
}

async function save(orders: Order[]): Promise<void> {
  cache = orders;
  await mkdir(dir, { recursive: true });
  await writeFile(file, JSON.stringify(orders, null, 2), "utf8");
}

export async function createOrder(input: Omit<Order, "id" | "createdAt"> & { id?: string }): Promise<Order> {
  const orders = await load();
  const id = input.id?.trim() || crypto.randomUUID();
  if (orders.some((o) => o.id === id)) {
    throw new Error(`Már létező rendelés: ${id}`);
  }
  const order: Order = {
    ...input,
    id,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await save(orders);
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await load();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByTransferCode(code: string): Promise<Order | null> {
  const c = code.trim().toUpperCase();
  if (!c) return null;
  const orders = await load();
  return (
    orders.find((o) => {
      if ((o.transferCode ?? "").toUpperCase() === c) return true;
      return Boolean(o.installments?.some((i) => (i.transferCode ?? "").toUpperCase() === c));
    }) ?? null
  );
}

export async function getOrderByProviderRef(ref: string): Promise<Order | null> {
  const orders = await load();
  return orders.find((o) => o.providerRef === ref) ?? null;
}

export async function getOrderByLicenseToken(token: string): Promise<Order | null> {
  const t = token.trim();
  if (!t) return null;
  const orders = await load();
  const upper = t.toUpperCase();
  return (
    orders.find((o) => o.id === t) ??
    orders.find((o) => o.transferCode && o.transferCode.toUpperCase() === upper) ??
    orders.find((o) => o.installments?.some((i) => (i.transferCode ?? "").toUpperCase() === upper)) ??
    null
  );
}

export async function listOrdersByReferralCode(code: string): Promise<Order[]> {
  const c = code.trim().toUpperCase();
  if (!c) return [];
  const orders = await load();
  return orders.filter((o) => (o.referralCode ?? "").toUpperCase() === c);
}

export async function updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
  const orders = await load();
  const i = orders.findIndex((o) => o.id === id);
  if (i < 0) return null;
  orders[i] = { ...orders[i], ...patch, id: orders[i].id };
  await save(orders);
  return orders[i];
}

export function newTransferCode(): string {
  const n = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SZC-${n}`;
}
