import { useState, type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportEmbedFrame } from "@/components/support/SupportEmbedModal";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { KahnInfobonbon } from "@/components/support/KahnInfobonbon";
import { SUPPORT_LAYER_SLUG, SUPPORT_SLA, type SupportLayer } from "@/lib/support";
import { useI18n, type MessageKey } from "@/i18n";

const LAYER_COPY: Array<{ id: SupportLayer; labelKey: MessageKey; titleKey: MessageKey }> = [
  { id: "tippek", labelKey: "support.layerTips", titleKey: "support.tipsTitle" },
  { id: "gyik", labelKey: "support.layerFaq", titleKey: "support.faqTitle" },
  { id: "ticket", labelKey: "support.layerWrite", titleKey: "support.writeTitle" },
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
  const { t } = useI18n();
  const [layer, setLayer] = useState<SupportLayer>(initialLayer);
  const active = LAYER_COPY.find((l) => l.id === layer) ?? LAYER_COPY[1];

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
              {t("support.help")} — {t(active.titleKey)}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-1.5">
            {LAYER_COPY.map((l) => (
              <Button
                key={l.id}
                type="button"
                size="sm"
                variant={layer === l.id ? "secondary" : "outline"}
                className={cn("h-7", layer === l.id && "border-cyan-400/40")}
                onClick={() => setLayer(l.id)}
              >
                {t(l.labelKey)}
              </Button>
            ))}
          </div>

          {layer === "ticket" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <SupportEmbedFrame
                slug={SUPPORT_LAYER_SLUG.ticket}
                title={t("support.ticket")}
                fallback={<SupportTicketForm compact />}
              />
              <div className="rounded-md border border-slate-700/60 bg-slate-950/40 p-3">
                <p className="text-[12px] leading-snug text-slate-300">{SUPPORT_SLA}</p>
                <SupportTicketForm compact />
              </div>
            </div>
          ) : (
            <div className="grid max-h-[min(70vh,36rem)] gap-3 overflow-y-auto">
              {layer === "gyik" ? <KahnInfobonbon compact /> : null}
              <SupportEmbedFrame
                slug={SUPPORT_LAYER_SLUG[layer]}
                title={t(active.titleKey)}
                fallback={<p className="text-sm text-muted-foreground">{t("support.embedFail")}</p>}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
