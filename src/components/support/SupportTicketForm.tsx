"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SUPPORT_MAIL, SUPPORT_SLA } from "@/lib/support";

export function SupportTicketForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const href = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(subject.trim() || "Szcenárió jegy")}&body=${encodeURIComponent(
      `Név: ${name.trim()}\nE-mail: ${email.trim()}\n\n${body.trim()}`,
    )}`;
    window.location.href = href;
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <p className="text-[12px] leading-snug text-slate-300">{SUPPORT_SLA}</p>
      <label className="grid gap-1 text-[12px] text-slate-300">
        Név
        <Input value={name} onChange={(e) => setName(e.currentTarget.value)} autoComplete="name" required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        E-mail
        <Input type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} autoComplete="email" required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        Tárgy
        <Input value={subject} onChange={(e) => setSubject(e.currentTarget.value)} required />
      </label>
      <label className="grid gap-1 text-[12px] text-slate-300">
        Üzenet
        <textarea
          value={body}
          onChange={(e) => setBody(e.currentTarget.value)}
          required
          rows={compact ? 4 : 6}
          className="min-h-[6rem] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        />
      </label>
      <Button type="submit" className="h-9">
        Jegy küldése e-mailben
      </Button>
    </form>
  );
}
