import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { useI18n } from "@/i18n";
import { enterpriseInquirySubject } from "@/lib/enterpriseSchedule";
import { supportPricingHref } from "@/lib/support";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EnterpriseInquiryDialog({ open, onOpenChange }: Props) {
  const { t, locale } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg tracking-tight">{t("pricing.enterpriseInquiryTitle")}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t("pricing.enterpriseInquiryLead")}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <SupportTicketForm compact defaultSubject={enterpriseInquirySubject(locale)} />
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("pricing.close")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <a href={supportPricingHref("enterprise")}>{t("pricing.moreInfo")}</a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
