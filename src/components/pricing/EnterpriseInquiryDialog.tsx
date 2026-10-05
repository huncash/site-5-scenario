import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { enterpriseInquiryMailto } from "@/lib/enterpriseSchedule";
import { supportPricingHref } from "@/lib/support";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EnterpriseInquiryDialog({ open, onOpenChange }: Props) {
  const { t, locale } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = enterpriseInquiryMailto({ locale, name, email, message });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card text-foreground sm:rounded-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg tracking-tight">{t("pricing.enterpriseInquiryTitle")}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t("pricing.enterpriseInquiryLead")}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            {t("support.name")}
            <Input value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="name" required />
          </label>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            {t("support.email")}
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-1 text-[12px] text-muted-foreground">
            {t("support.message")}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              rows={4}
              className="min-h-[6rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("pricing.close")}
            </Button>
            <Button type="button" variant="outline" asChild>
              <a href={supportPricingHref("enterprise")}>{t("pricing.moreInfo")}</a>
            </Button>
            <Button type="submit" className="btn-cta">
              {t("pricing.enterpriseCta")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
