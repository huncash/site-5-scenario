import { readLicense } from "@/lib/license";
import type { MeshRepository } from "@/lib/mesh/meshRepository";
import type { MeshSchema } from "@/lib/mesh/schema";
import {
  cartIdForOwner,
  emptyCart,
  GUEST_CART_ID,
  mergeCarts,
  parseCart,
  SALES_CART_EVENT,
  type SalesCart,
} from "@/lib/salesCart";

export function salesCartQueryKey() {
  return ["salesCart"] as const;
}

function emitCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SALES_CART_EVENT));
}

export function activeCartId(): string {
  return cartIdForOwner(readLicense()?.token);
}

export async function readSalesCart(repo: MeshRepository<MeshSchema>): Promise<SalesCart> {
  const ownedId = activeCartId();
  const owned = parseCart(await repo.get("salesCarts", ownedId), ownedId);
  if (ownedId === GUEST_CART_ID) return owned.lines.length ? owned : parseCart(await repo.get("salesCarts", GUEST_CART_ID), GUEST_CART_ID);
  const guest = parseCart(await repo.get("salesCarts", GUEST_CART_ID), GUEST_CART_ID);
  if (!guest.lines.length) return owned;
  const merged = mergeCarts({ ...owned, id: ownedId }, guest);
  await repo.save("salesCarts", merged);
  await repo.delete("salesCarts", GUEST_CART_ID);
  emitCart();
  return merged;
}

export async function writeSalesCart(
  repo: MeshRepository<MeshSchema>,
  cart: SalesCart,
): Promise<SalesCart> {
  const id = activeCartId();
  const next = { ...cart, id, updatedAt: Date.now() };
  await repo.save("salesCarts", next);
  emitCart();
  return next;
}
