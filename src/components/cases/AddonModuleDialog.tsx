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
import { useI18n } from "@/i18n";
import { supportPricingHref } from "@/lib/support";

type Props = {
  open: boolean;
  title: string;
  notifyId?: string;
  onOpenChange: (open: boolean) => void;
};

export function AddonModuleDialog({ open, title, notifyId, onOpenChange }: Props) {
  const { t } = useI18n();
  const featureId = notifyId || title;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg tracking-tight">{t("door.addonModalTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{title}</span>
            <span className="mt-2 block leading-relaxed">{t("door.addonModalLead")}</span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("door.addonCtaClose")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={supportPricingHref("desktop-engines")}>{t("door.addonCtaSupport")}</a>
          </Button>
          <NotifyLaunchButton featureId={`soon:${featureId}`} onSaved={() => onOpenChange(false)} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
