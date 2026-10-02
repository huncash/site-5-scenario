import { useState, type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportEmbedFrame } from "@/components/support/SupportEmbedModal";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { SUPPORT_LAYER_SLUG, SUPPORT_SLA, type SupportLayer } from "@/lib/support";

const LAYERS: Array<{ id: SupportLayer; label: string; title: string }> = [
  { id: "tippek", label: "1 · Tippek", title: "GYIK tippek" },
  { id: "gyik", label: "2 · GYIK", title: "Tudásbázis / GYIK" },
  { id: "ticket", label: "3 · Írásban", title: "Írásos ügyintézés" },
];

export function KnowledgeBaseModal({
  open,
  onOpenChange,
  trigger,
  initialLayer = "gyik",
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  trigger?: ReactNode;
  initialLayer?: SupportLayer;
}) {
  const [openState, setOpenState] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? Boolean(open) : openState;
  const setOpen = (o: boolean) => {
    if (!isControlled) setOpenState(o);
    onOpenChange?.(o);
  };
  const [layer, setLayer] = useState<SupportLayer>(initialLayer);
  const active = LAYERS.find((l) => l.id === layer) ?? LAYERS[1];

  return (
    <>
      {trigger ? (
        <span
          onClick={() => setOpen(true)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setOpen(true) : null)}
          role="button"
          tabIndex={0}
        >
          {trigger}
        </span>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-3 sm:max-w-4xl">
          <DialogHeader className="px-1">
            <DialogTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-slate-200" />
              Súgó — {active.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5">
            {LAYERS.map((l) => (
              <Button
                key={l.id}
                type="button"
                size="sm"
                variant={layer === l.id ? "secondary" : "outline"}
                className={cn("h-7", layer === l.id && "border-cyan-400/40")}
                onClick={() => setLayer(l.id)}
              >
                {l.label}
              </Button>
            ))}
          </div>

          {layer === "ticket" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <SupportEmbedFrame
                slug={SUPPORT_LAYER_SLUG.ticket}
                title="Jegy"
                fallback={<SupportTicketForm compact />}
              />
              <div className="rounded-md border border-slate-700/60 bg-slate-950/40 p-3">
                <p className="text-[12px] leading-snug text-slate-300">{SUPPORT_SLA}</p>
                <SupportTicketForm compact />
              </div>
            </div>
          ) : (
            <SupportEmbedFrame
              slug={SUPPORT_LAYER_SLUG[layer]}
              title={active.title}
              fallback={
                <p className="text-sm text-slate-300">
                  {layer === "tippek"
                    ? "A tippek a support oldalon nyílnak. Offline a helyi súgóikonok továbbra is működnek."
                    : "A GYIK a support oldalon nyílik. A helyi tudásbázis cikkek a súgóikonokból elérhetők."}
                </p>
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
