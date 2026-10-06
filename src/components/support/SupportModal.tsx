import { useEffect, useRef, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function SupportModal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => {
      const el = contentRef.current;
      if (!el) return;
      el.scrollTop = 0;
      el.scrollTo({ top: 0, behavior: "instant" });
      el.querySelector<HTMLInputElement>("[data-support-search]")?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay className="z-[80] bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            contentRef.current?.querySelector<HTMLInputElement>("[data-support-search]")?.focus();
          }}
          className={cn(
            "fixed left-1/2 top-1/2 z-[80] flex h-[88vh] w-[92vw] max-h-[900px] max-w-7xl",
            "-translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border",
            "bg-background p-0 text-foreground shadow-2xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        >
          <DialogTitle className="sr-only">{t("chrome.knowledge")}</DialogTitle>
          <DialogDescription className="sr-only">{t("supportDoor.lead")}</DialogDescription>
          <DialogPrimitive.Close
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-50 rounded-full bg-muted/80 p-2 text-foreground shadow-md transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={t("chrome.close")}
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
          <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
