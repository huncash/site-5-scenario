import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type LeanProof = {
  claim: string;
  why: string;
  lines: string[];
};

export function LeanProofPopover({
  proof,
  className,
  label = "Bizonyíték",
}: {
  proof: LeanProof | null | undefined;
  className?: string;
  label?: string;
}) {
  const lines = useMemo(() => (proof?.lines ?? []).filter(Boolean).slice(0, 12), [proof?.lines]);
  if (!proof) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn("h-7 px-2 text-[11px] text-slate-200 hover:bg-muted/30", className)}
          title="Forrásadatok és magyarázat"
          data-exact="Bizonyíték — mely számokból jött ez a javaslat. Helyszíni, nem külső adat."
        >
          🔍 {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={14}
        className="w-[420px] max-w-[calc(100vw-1.5rem)] border border-border bg-popover p-3 text-popover-foreground"
      >
        <div className="text-xs font-semibold">📌 Állítás</div>
        <div className="mt-1 text-xs text-slate-200">{proof.claim}</div>

        <div className="mt-3 text-xs font-semibold">🔍 Bizonyító forrásadatok</div>
        {lines.length === 0 ? (
          <div className="mt-1 text-xs text-muted-foreground">Nincs részletezhető tétel-lista ehhez a jelzéshez.</div>
        ) : (
          <ul className="mt-1 space-y-1 text-[11px] text-slate-200">
            {lines.map((l, idx) => (
              <li key={idx} className="font-mono">
                {l}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 text-xs font-semibold">💡 Miért</div>
        <div className="mt-1 text-xs text-muted-foreground">{proof.why}</div>
      </PopoverContent>
    </Popover>
  );
}

