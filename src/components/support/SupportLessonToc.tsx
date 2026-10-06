import { useMemo, useState } from "react";

import { useI18n } from "@/i18n";
import {
  searchSupportLessons,
  type SupportLessonGroup,
  type SupportLessonIndex,
} from "@/lib/supportRoutes";
import { cn } from "@/lib/utils";

export function SupportLessonToc({
  hrefFor,
  className,
  compact = false,
}: {
  hrefFor: (path: string) => string;
  className?: string;
  compact?: boolean;
}) {
  const { t, locale } = useI18n();
  const [q, setQ] = useState("");
  const hits = useMemo(
    () => searchSupportLessons(q, locale === "en" ? "en" : "hu"),
    [q, locale],
  );
  const guides = hits.filter((l) => l.group === "guide");
  const dash = hits.filter((l) => l.group === "dash");
  const motor = hits.filter((l) => l.group === "motor");
  const theory = hits.filter((l) => l.group === "theory");

  return (
    <section id="leckek" className={cn("scroll-mt-24 space-y-3", className)} data-support-toc="">
      <div>
        <h2 className={compact ? "text-sm font-semibold" : "text-lg font-semibold"}>{t("supportDoor.tocTitle")}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{t("supportDoor.tocLead")}</p>
      </div>
      <label className="block">
        <span className="sr-only">{t("supportDoor.tocSearch")}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("supportDoor.tocSearch")}
          aria-label={t("supportDoor.tocSearch")}
          className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-cyan-400/50"
        />
      </label>
      {hits.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{t("supportDoor.tocEmpty")}</p>
      ) : (
        <div className="space-y-4">
          <LessonGroup title={t("supportDoor.tocGuides")} items={guides} hrefFor={hrefFor} locale={locale} />
          <LessonGroup title={t("supportDoor.tocDash")} items={dash} hrefFor={hrefFor} locale={locale} />
          <LessonGroup title={t("supportDoor.tocMotor")} items={motor} hrefFor={hrefFor} locale={locale} />
          <LessonGroup title={t("supportDoor.tocTheory")} items={theory} hrefFor={hrefFor} locale={locale} />
        </div>
      )}
    </section>
  );
}

function LessonGroup({
  title,
  items,
  hrefFor,
  locale,
}: {
  title: string;
  items: SupportLessonIndex[];
  hrefFor: (path: string) => string;
  locale: string;
}) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {items.map((l) => (
          <li key={l.path}>
            <a
              href={hrefFor(l.path)}
              className="block rounded-xl border border-border/70 bg-card/60 p-3 text-foreground transition-colors hover:border-cyan-400/40"
            >
              <span className="block text-sm font-semibold">{locale === "en" ? l.titleEn : l.titleHu}</span>
              <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">
                {locale === "en" ? l.summaryEn : l.summaryHu}
              </span>
              <span className="mt-1.5 block font-mono text-[10px] text-muted-foreground">/{l.path}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export type { SupportLessonGroup };
