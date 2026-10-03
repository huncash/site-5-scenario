"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n";
import { SUPPORT_MAIL } from "@/lib/support";

export function SupportTicketForm({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const href = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(subject.trim() || t("support.mailSubject"))}&body=${encodeURIComponent(
      `${t("support.mailName")}: ${name.trim()}\nE-mail: ${email.trim()}\n\n${body.trim()}`,
    )}`;
    window.location.href = href;
  };

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
