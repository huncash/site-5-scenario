import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Construction } from "lucide-react";

import { NotifyLaunchButton } from "@/components/legal/NotifyLaunchButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planUpgradeHref } from "@/lib/planGate";

export type ComingSoonPayload = {
  /** Rövid funkciónév a címsorban */
  title: string;
  /** Várható cél / üzleti érték */
  purpose: string;
  /** Stabil azonosító a későbbi modulcseréhez */
  featureId?: string;
  /** upgrade = csomaghatár; soon = még nincs kész a belépési pont. */
  kind?: "soon" | "upgrade";
};

type Ctx = {
  openComingSoon: (payload: ComingSoonPayload) => void;
  closeComingSoon: () => void;
};

const FeatureComingSoonContext = createContext<Ctx | null>(null);

export function FeatureComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<ComingSoonPayload | null>(null);

  const openComingSoon = useCallback((next: ComingSoonPayload) => {
    setPayload(next);
    setOpen(true);
  }, []);

  const closeComingSoon = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openComingSoon, closeComingSoon }),
    [openComingSoon, closeComingSoon],
  );

  return (
    <FeatureComingSoonContext.Provider value={value}>
      {children}
      <FeatureComingSoonDialog
        open={open}
        onOpenChange={setOpen}
        title={payload?.title ?? "Funkció"}
        purpose={payload?.purpose ?? "Ez a funkció előkészítés alatt áll."}
        featureId={payload?.featureId}
        kind={payload?.kind ?? (payload?.featureId?.startsWith("plan.") ? "upgrade" : "soon")}
      />
    </FeatureComingSoonContext.Provider>
  );
}

export function useFeatureComingSoon(): Ctx {
  const ctx = useContext(FeatureComingSoonContext);
  if (!ctx) {
    // Fallback: soha ne dobjon hibát — toast nélküli no-op helyett konzol + alert elkerülése
    return {
      openComingSoon: (p) => {
        console.info("[FeatureComingSoon]", p.title, p.purpose);
      },
      closeComingSoon: () => {},
    };
  }
  return ctx;
}

/** Kontrollált modal — használható provider nélkül is. */
export function FeatureComingSoonDialog({
  open,
  onOpenChange,
  title,
  purpose,
  featureId,
  kind = "soon",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  purpose: string;
  featureId?: string;
  kind?: "soon" | "upgrade";
}) {
  const upgrade = kind === "upgrade";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300">
            <Construction className="h-5 w-5" aria-hidden />
          </div>
          <DialogTitle className="text-lg tracking-tight">
            {upgrade ? "Ez a Pro csomagban él" : "Funkció előkészítés alatt"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{title}</span>
            <span className="mt-2 block leading-relaxed">{purpose}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-dashed border-border bg-[var(--dropdown-hover)] px-4 py-5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {upgrade
              ? "A számok a gépeden maradnak. A Basic a magánvagyon, a kézi rögzítés és a fájl-import asztala. A Pro a vállalkozás, a projekt, a figyelt mappa és a saját szabály."
              : "A belépési pont megvan. A modul a saját eszközödön, a böngészőben / helyi tárhelyen fog futni. A fizetés, a számlázás és a support adatai a jogszabályok szerint kezeltek."}
          </p>
          {upgrade ? (
            <a
              href={planUpgradeHref()}
              className="mt-3 inline-flex text-xs font-medium text-cyan-300 underline-offset-2 hover:underline"
            >
              Support: Pro keret
            </a>
          ) : null}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Megértettem / Bezárás
          </Button>
          {upgrade ? null : (
            <NotifyLaunchButton
              featureId={featureId ? `soon:${featureId}` : `soon:${title}`}
              onSaved={() => onOpenChange(false)}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
