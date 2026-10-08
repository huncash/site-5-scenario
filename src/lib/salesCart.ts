/**
 * Egyszeri díjas Labs-kosár — nincs előfizetés, nincs élethosszig tartó tagság.
 * Vendég: cart:guest (Mesh localStore). Belépett: cart:{token} ugyanazon a gépen.
 */
import { PLANS_CONFIG, type JitAddonId, type PublicPlanId } from "@/config/plans";
import { isComingSoonJitAddon, JIT_ADDON_BY_ID, isJitAddonId, parseCheckoutAddons } from "@/content/pricing/addons";
export { parseCheckoutAddons };
import { billCheckoutUrl } from "@/lib/billing";
import { engineFunnelHref } from "@/lib/engineView";

export const GUEST_CART_ID = "cart:guest";
export const SALES_CART_EVENT = "szcenario:sales-cart";

export type SalesPlanSku = Extract<PublicPlanId, "starter" | "pro">;
export type SalesEngineSku = "education" | "resilience";
export type SalesCartSku = SalesPlanSku | JitAddonId | SalesEngineSku;

export type SalesCartLine = {
  sku: SalesCartSku;
  qty: number;
};

export type SalesCart = {
  id: string;
  lines: SalesCartLine[];
  updatedAt: number;
};

export type SalesQuoteLine = {
  sku: SalesCartSku;
  qty: number;
  labelHu: string;
  labelEn: string;
  netHuf: number;
  oneTime: true;
  quoteOnly: boolean;
};

export type SalesQuote = {
  lines: SalesQuoteLine[];
  totalHuf: number;
  plan: SalesPlanSku | null;
  addons: JitAddonId[];
  engines: SalesEngineSku[];
};

const PLAN_LABEL: Record<SalesPlanSku, { hu: string; en: string }> = {
  starter: { hu: "Basic csomag — egyszeri szoftverlicenc (1. év)", en: "Basic pack — one-time software licence (year 1)" },
  pro: { hu: "Pro csomag — egyszeri szoftverlicenc (1. év)", en: "Pro pack — one-time software licence (year 1)" },
};

export function addonQueryFromCart(cart: SalesCart): string {
  const parts: string[] = [];
  for (const line of cart.lines) {
    if (!isJitAddonId(line.sku) || isComingSoonJitAddon(line.sku)) continue;
    for (let i = 0; i < line.qty; i += 1) parts.push(line.sku);
  }
  return parts.join(",");
}

const ENGINE_LABEL: Record<SalesEngineSku, { hu: string; en: string }> = {
  education: { hu: "Oktatási motor (egyszeri bővítő)", en: "Education engine (one-time add-on)" },
  resilience: { hu: "Vészhelyzeti motor (egyszeri bővítő)", en: "Emergency engine (one-time add-on)" },
};

export function cartIdForOwner(token?: string | null): string {
  const t = token?.trim();
  return t ? `cart:${t}` : GUEST_CART_ID;
}

export function isGuestCartId(id: string): boolean {
  return id === GUEST_CART_ID;
}

export function emptyCart(id = GUEST_CART_ID): SalesCart {
  return { id, lines: [], updatedAt: 0 };
}

export function isSalesPlanSku(v: string): v is SalesPlanSku {
  return v === "starter" || v === "pro";
}

export function isSalesEngineSku(v: string): v is SalesEngineSku {
  return v === "education" || v === "resilience";
}

export function isSalesCartSku(v: unknown): v is SalesCartSku {
  return typeof v === "string" && (isSalesPlanSku(v) || isJitAddonId(v) || isSalesEngineSku(v));
}

export function parseCart(raw: unknown, fallbackId = GUEST_CART_ID): SalesCart {
  if (!raw || typeof raw !== "object") return emptyCart(fallbackId);
  const o = raw as Partial<SalesCart>;
  const id = typeof o.id === "string" && o.id.startsWith("cart:") ? o.id : fallbackId;
  const lines: SalesCartLine[] = [];
  for (const line of o.lines ?? []) {
    if (!line || typeof line !== "object") continue;
    if (!isSalesCartSku(line.sku)) continue;
    const qty = Math.max(1, Math.min(20, Math.floor(Number(line.qty) || 1)));
    lines.push({ sku: line.sku, qty });
  }
  return { id, lines: collapseLines(lines), updatedAt: Number(o.updatedAt) || 0 };
}

function collapseLines(lines: SalesCartLine[]): SalesCartLine[] {
  const qty = new Map<SalesCartSku, number>();
  let plan: SalesPlanSku | null = null;
  for (const line of lines) {
    if (isSalesPlanSku(line.sku)) {
      plan = line.sku;
      continue;
    }
    qty.set(line.sku, (qty.get(line.sku) ?? 0) + line.qty);
  }
  const out: SalesCartLine[] = [];
  if (plan) out.push({ sku: plan, qty: 1 });
  for (const [sku, n] of qty) out.push({ sku, qty: n });
  return out;
}

export function setPlan(cart: SalesCart, plan: SalesPlanSku): SalesCart {
  return {
    ...cart,
    lines: collapseLines([{ sku: plan, qty: 1 }, ...cart.lines.filter((l) => !isSalesPlanSku(l.sku))]),
    updatedAt: Date.now(),
  };
}

export function addSku(cart: SalesCart, sku: SalesCartSku, qty = 1): SalesCart {
  if (isJitAddonId(sku) && isComingSoonJitAddon(sku)) return cart;
  if (isSalesPlanSku(sku)) return setPlan(cart, sku);
  return {
    ...cart,
    lines: collapseLines([...cart.lines, { sku, qty: Math.max(1, qty) }]),
    updatedAt: Date.now(),
  };
}

export function removeSku(cart: SalesCart, sku: SalesCartSku): SalesCart {
  return {
    ...cart,
    lines: cart.lines.filter((l) => l.sku !== sku),
    updatedAt: Date.now(),
  };
}

export function applyRecommendedPack(cart: SalesCart, pack: SalesPlanSku): SalesCart {
  return setPlan(
    { ...cart, lines: cart.lines.filter((l) => isSalesEngineSku(l.sku) || isJitAddonId(l.sku)) },
    pack,
  );
}

export function mergeCarts(into: SalesCart, from: SalesCart): SalesCart {
  return {
    id: into.id,
    lines: collapseLines([...into.lines, ...from.lines]),
    updatedAt: Math.max(into.updatedAt, from.updatedAt, Date.now()),
  };
}

export function quoteCart(cart: SalesCart): SalesQuote {
  const lines: SalesQuoteLine[] = [];
  let plan: SalesPlanSku | null = null;
  const addons: JitAddonId[] = [];
  const engines: SalesEngineSku[] = [];
  for (const line of cart.lines) {
    if (isSalesPlanSku(line.sku)) {
      plan = line.sku;
      const label = PLAN_LABEL[line.sku];
      lines.push({
        sku: line.sku,
        qty: 1,
        labelHu: label.hu,
        labelEn: label.en,
        netHuf: PLANS_CONFIG[line.sku].priceHuf,
        oneTime: true,
        quoteOnly: false,
      });
      continue;
    }
    if (isJitAddonId(line.sku)) {
      if (isComingSoonJitAddon(line.sku)) continue;
      addons.push(line.sku);
      const addon = JIT_ADDON_BY_ID[line.sku];
      lines.push({
        sku: line.sku,
        qty: line.qty,
        labelHu: `${addon.labelHu} — egyszeri szoftverlicenc`,
        labelEn: `${addon.labelEn} — one-time software licence`,
        netHuf: addon.priceHuf * line.qty,
        oneTime: true,
        quoteOnly: false,
      });
      continue;
    }
    engines.push(line.sku);
    const label = ENGINE_LABEL[line.sku];
    lines.push({
      sku: line.sku,
      qty: line.qty,
      labelHu: label.hu,
      labelEn: label.en,
      netHuf: 0,
      oneTime: true,
      quoteOnly: true,
    });
  }
  return {
    lines,
    totalHuf: lines.reduce((s, l) => s + l.netHuf, 0),
    plan,
    addons,
    engines,
  };
}

export function checkoutHrefFromCart(cart: SalesCart): string {
  const q = quoteCart(cart);
  const addon = addonQueryFromCart(cart);
  if (q.plan || q.addons.length) {
    return billCheckoutUrl({
      tier: q.plan ?? "pro",
      interval: "yearly",
      addon: addon || undefined,
    });
  }
  const engine = q.engines[0];
  if (engine) return engineFunnelHref(engine);
  return "";
}

