import { describe, expect, it } from "vitest";

import { JIT_ADDON_PRICES, PLANS_CONFIG } from "@/config/plans";
import {
  addSku,
  applyRecommendedPack,
  cartIdForOwner,
  checkoutHrefFromCart,
  emptyCart,
  GUEST_CART_ID,
  mergeCarts,
  parseCheckoutAddons,
  quoteCart,
  setPlan,
} from "@/lib/salesCart";

describe("salesCart", () => {
  it("keeps guest and licence carts apart, then merges without dropping lines", () => {
    expect(cartIdForOwner(null)).toBe(GUEST_CART_ID);
    expect(cartIdForOwner("SZC-1")).toBe("cart:SZC-1");
    const guest = addSku(emptyCart(), "case_plus_1");
    const owned = setPlan(emptyCart("cart:SZC-1"), "pro");
    const merged = mergeCarts(owned, guest);
    expect(merged.lines.map((l) => l.sku)).toEqual(["pro", "case_plus_1"]);
  });

  it("quotes one-time pack + module fees and never a subscription line", () => {
    const cart = addSku(applyRecommendedPack(emptyCart(), "starter"), "slot_plus_1");
    const q = quoteCart(cart);
    expect(q.totalHuf).toBe(PLANS_CONFIG.starter.priceHuf + JIT_ADDON_PRICES.slot_plus_1);
    expect(q.lines.every((l) => l.oneTime)).toBe(true);
    expect(JSON.stringify(q)).not.toMatch(/előfizetés|subscription|lifetime membership|élethosszig/i);
    expect(checkoutHrefFromCart(cart)).toContain("tier=starter");
    expect(checkoutHrefFromCart(cart)).toContain("addon=slot_plus_1");
    expect(checkoutHrefFromCart(emptyCart())).toBe("");
  });

  it("repeats addon ids so quantity survives the billing origin", () => {
    const cart = addSku(addSku(applyRecommendedPack(emptyCart(), "pro"), "case_plus_1"), "case_plus_1");
    expect(decodeURIComponent(checkoutHrefFromCart(cart))).toContain("addon=case_plus_1,case_plus_1");
  });

  it("does not put coming-soon Edge into the cart", () => {
    const cart = addSku(emptyCart(), "edge_sensor");
    expect(cart.lines).toEqual([]);
    expect(quoteCart(addSku(applyRecommendedPack(emptyCart(), "pro"), "edge_sensor")).addons).not.toContain(
      "edge_sensor",
    );
  });

  it("parses comma-separated checkout addons", () => {
    expect(parseCheckoutAddons("case_plus_1,seat_plus_1", "edge_sensor")).toEqual([
      "case_plus_1",
      "seat_plus_1",
      "edge_sensor",
    ]);
  });
});
