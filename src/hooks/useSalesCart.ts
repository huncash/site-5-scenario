import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LICENSE_CHANGE_EVENT } from "@/lib/license";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import {
  addSku,
  applyRecommendedPack,
  checkoutHrefFromCart,
  emptyCart,
  quoteCart,
  removeSku,
  SALES_CART_EVENT,
  type SalesCartSku,
  type SalesPlanSku,
} from "@/lib/salesCart";
import { readSalesCart, salesCartQueryKey, writeSalesCart } from "@/lib/salesCartStore";

export function useSalesCart() {
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const key = salesCartQueryKey();

  const q = useQuery({
    queryKey: key,
    queryFn: () => readSalesCart(repo),
    placeholderData: emptyCart(),
  });

  useEffect(() => {
    const sync = () => {
      void qc.invalidateQueries({ queryKey: key });
    };
    window.addEventListener(SALES_CART_EVENT, sync);
    window.addEventListener(LICENSE_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SALES_CART_EVENT, sync);
      window.removeEventListener(LICENSE_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [qc, key]);

  const persist = useMutation({
    mutationFn: (next: Parameters<typeof writeSalesCart>[1]) => writeSalesCart(repo, next),
    onSuccess: (saved) => qc.setQueryData(key, saved),
  });

  const cart = q.data ?? emptyCart();
  const quote = quoteCart(cart);

  const add = useCallback(
    (sku: SalesCartSku, qty = 1) => persist.mutateAsync(addSku(cart, sku, qty)),
    [cart, persist],
  );
  const remove = useCallback(
    (sku: SalesCartSku) => persist.mutateAsync(removeSku(cart, sku)),
    [cart, persist],
  );
  const pickPack = useCallback(
    (pack: SalesPlanSku) => persist.mutateAsync(applyRecommendedPack(cart, pack)),
    [cart, persist],
  );

  return {
    cart,
    quote,
    add,
    remove,
    pickPack,
    checkoutHref: checkoutHrefFromCart(cart),
    pending: persist.isPending,
  };
}
