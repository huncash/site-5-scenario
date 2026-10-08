import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { formatCurrency, useI18n } from "@/i18n";
import {
  compareAnonSeries,
  forumNotesQueryKey,
  importForumNote,
  readForumNotes,
  studyFromNoteContent,
} from "@/lib/forumNotes";
import { useMeshRepository } from "@/lib/mesh/meshRepository";

export function AnonForumPanel() {
  const { t } = useI18n();
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const [pickA, setPickA] = useState("");
  const [pickB, setPickB] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const notes = useQuery({
    queryKey: forumNotesQueryKey(),
    queryFn: () => readForumNotes(repo),
  });

  const importMut = useMutation({
    mutationFn: (raw: string) => importForumNote(repo, raw),
    onSuccess: (res) => {
      if (!res.ok) {
        setErr(t("school.packInvalid"));
        return;
      }
      setErr(null);
      void qc.invalidateQueries({ queryKey: forumNotesQueryKey() });
    },
    onError: () => setErr(t("school.packInvalid")),
  });

  const rows = notes.data ?? [];
  const a = rows.find((r) => r.id === pickA);
  const b = rows.find((r) => r.id === pickB);
  const cmp = useMemo(() => {
    if (!a || !b) return null;
    const sa = studyFromNoteContent(a.content);
    const sb = studyFromNoteContent(b.content);
    if (!sa || !sb) return null;
    return compareAnonSeries(sa, sb);
  }, [a, b]);

  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card/40 p-4" aria-labelledby="forum-title">
      <div>
        <h2 id="forum-title" className="text-base font-semibold text-foreground">
          {t("school.forumTitle")}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t("school.forumLead")}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{t("school.forumNoRelay")}</p>
      </div>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const raw = String(fd.get("note") ?? "");
          if (raw.trim()) importMut.mutate(raw);
        }}
      >
        <textarea
          name="note"
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder={t("school.forumPastePh")}
        />
        <Button type="submit" size="sm" disabled={importMut.isPending}>
          {t("school.forumImport")}
        </Button>
      </form>
      {err ? <p className="text-[12px] text-destructive">{err}</p> : null}
      {rows.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">{t("school.forumEmpty")}</p>
      ) : (
        <ul className="space-y-1.5 text-[12px]">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-border/50 bg-background/60 px-2 py-1.5">
              <span className="font-medium text-foreground">{row.alias}</span>
              <span className="sr-only"> · </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {formatCurrency(row.cashHuf)} · {row.runwayMonths == null ? "—" : `${row.runwayMonths.toFixed(1)} ${t("school.monthUnit")}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      {rows.length >= 2 ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-[11px] text-muted-foreground">
            {t("school.forumPickA")}
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              value={pickA}
              onChange={(e) => setPickA(e.target.value)}
            >
              <option value="">—</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.alias}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-muted-foreground">
            {t("school.forumPickB")}
            <select
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              value={pickB}
              onChange={(e) => setPickB(e.target.value)}
            >
              <option value="">—</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.alias}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {cmp ? (
        <dl className="grid grid-cols-2 gap-2 rounded-md border border-border/60 bg-background/70 p-2 text-[12px] sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">{t("school.deltaCash")}</dt>
            <dd className="font-mono tabular-nums">{formatCurrency(cmp.cashDelta)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("school.deltaRevenue")}</dt>
            <dd className="font-mono tabular-nums">{formatCurrency(cmp.revenueDelta)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("school.deltaOpex")}</dt>
            <dd className="font-mono tabular-nums">{formatCurrency(cmp.opexDelta)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("school.deltaRunway")}</dt>
            <dd className="font-mono tabular-nums">{cmp.runwayDelta.toFixed(1)} {t("school.monthUnit")}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
