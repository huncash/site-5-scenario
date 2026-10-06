"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { readSupportTicketSearch } from "@/lib/support";

export function SupportTicketForm({
  compact = false,
  defaultSubject = "",
}: {
  compact?: boolean;
  defaultSubject?: string;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (defaultSubject) {
      setSubject(defaultSubject);
      return;
    }
    const fromUrl = readSupportTicketSearch(typeof window === "undefined" ? "" : window.location.search).subject;
    if (fromUrl) setSubject(fromUrl);
  }, [defaultSubject]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return <p className="text-sm leading-relaxed text-foreground">{t("support.ticketSent")}</p>;
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <p className="text-[12px] leading-snug text-slate-300">{t("support.sla")}</p>
      <label className="grid gap-1 text-[12px] text-slate-300">
        {t("support.name")}
        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="name" required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        {t("support.email")}
        <Input type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} autoComplete="email" required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        {t("support.subject")}
        <Input value={subject} onChange={(e) => setSubject(e.currentTarget.value)} required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        {t("support.message")}
        <textarea
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          required
          rows={compact ? 4 : 6}
          className="min-h-[6rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <Button type="submit" className="h-9">
        {t("support.send")}
      </Button>
    </form>
  );
}
