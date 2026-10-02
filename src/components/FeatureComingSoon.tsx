import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Construction } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type ComingSoonPayload = {
  /** Rövid funkciónév a címsorban */
  title: string;
  /** Várható cél / üzleti érték */
  purpose: string;
  /** Stabil azonosító a későbbi modulcseréhez */
  featureId?: string;
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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  purpose: string;
  featureId?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300">
            <Construction className="h-5 w-5" aria-hidden />
          </div>
          <DialogTitle className="text-lg tracking-tight">Funkció előkészítés alatt</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{title}</span>
            <span className="mt-2 block leading-relaxed">{purpose}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-dashed border-border bg-[var(--dropdown-hover)] px-4 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/90">
            [Szerkeszthető Tartalom Helye - PLACEHOLDER]
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Ide kerül az éles modul UI-ja (panel, tábla, varázsló vagy AI tanácsadó). A gomb már
            bekötött belépési pont — cseréld le ezt a blokkot a kész implementációra.
          </p>
          {featureId ? (
            <p className="mt-3 font-mono text-[10px] text-slate-500">featureId: {featureId}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Megértettem / Bezárás
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
