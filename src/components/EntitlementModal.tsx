import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EntitlementOffer } from "@/lib/entitlement";
import { ENTITLEMENT_CONVERSION_BODY } from "@/lib/entitlement";

export const EntitlementOfferContext = createContext<{
  offer: (next: EntitlementOffer) => void;
  close: () => void;
} | null>(null);

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<EntitlementOffer | null>(null);

  const offer = useCallback((next: EntitlementOffer) => {
    setPayload(next);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ offer, close }), [close, offer]);

  return (
    <EntitlementOfferContext.Provider value={value}>
      {children}
      <EntitlementModal
        open={open}
        onOpenChange={setOpen}
        body={payload?.body ?? ENTITLEMENT_CONVERSION_BODY}
        checkoutHref={payload?.checkoutHref ?? ""}
        checkoutLabel={payload?.checkoutLabel ?? ""}
      />
    </EntitlementOfferContext.Provider>
  );
}

export function EntitlementModal({
  open,
  onOpenChange,
  body,
  checkoutHref,
  checkoutLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  body: string;
  checkoutHref: string;
  checkoutLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg tracking-tight">Licencroster</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {body}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Mégse
          </Button>
          {checkoutHref ? (
            <Button type="button" className="btn-cta" asChild>
              <a href={checkoutHref}>{checkoutLabel}</a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
