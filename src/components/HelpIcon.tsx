import { useMemo, useState, type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  glossaryCopy,
  glossarySupportHref,
  glossaryTerm,
  glossaryTooltip,
  type GlossaryTermId,
} from "@/lib/glossary";
import { kbById, kbCopy, type KnowledgeBaseArticleId } from "@/lib/knowledgeBase";
import { oplByPath } from "@/lib/opl";
import { supportPageUrl } from "@/lib/support";
import { supportSlugForKb } from "@/lib/supportRoutes";
import { useSupportEmbedOptional } from "@/components/support/SupportEmbedProvider";

/** Címke + hover (`data-exact`) + kattintható sapka. Lean / glossary fogalmakhoz. */
export function LeanTerm({
  children,
  exact,
  summary,
  className,
  title,
  termId,
}: {
  children: ReactNode;
  exact?: string;
  summary?: string;
  className?: string;
  title?: string;
  termId?: GlossaryTermId;
}) {
  const { locale } = useI18n();
  const copy = termId ? glossaryCopy(termId, locale) : null;
  const hint = termId ? glossaryTooltip(termId, locale) : exact ?? summary ?? "";
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center", className)} data-exact={hint}>
      <span className="min-w-0">{children}</span>
      <HelpIcon termId={termId} title={title ?? copy?.term} summary={summary ?? hint} kbId={termId ? glossaryTerm(termId).kbId : undefined} />
    </span>
  );
}

/** Szakmai név + kezdő sor + support-linkelt sapka. */
export function GlossaryLabel({
  id,
  className,
  showPlain = true,
}: {
  id: GlossaryTermId;
  className?: string;
  showPlain?: boolean;
}) {
  const { locale } = useI18n();
  const copy = glossaryCopy(id, locale);
  return (
    <LeanTerm termId={id} className={className} title={copy.term}>
      <span className="min-w-0">
        <span>{copy.term}</span>
        {showPlain ? (
          <span className="mt-0.5 block font-normal normal-case tracking-normal text-muted-foreground">{copy.plain}</span>
        ) : null}
      </span>
    </LeanTerm>
  );
}

export function HelpIcon({
  kbId,
  termId,
  summary,
  title,
  className,
  size = "sm",
}: {
  kbId?: KnowledgeBaseArticleId;
  termId?: GlossaryTermId;
  summary?: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const resolvedKb = termId ? (kbId ?? glossaryTerm(termId).kbId) : kbId;
  const article = useMemo(() => (resolvedKb ? kbById(resolvedKb) : null), [resolvedKb]);
  const articleCopy = article ? kbCopy(article, locale) : null;
  const kbLesson = resolvedKb ? supportSlugForKb(resolvedKb) : null;
  const localSlug = termId ? glossaryTerm(termId).supportSlug : kbLesson;
  const localOpl = localSlug ? oplByPath(localSlug) : null;
  const oplWhy = localOpl ? (locale === "en" ? localOpl.whyEn : localOpl.whyHu) : undefined;
  const oplTitle = localOpl ? (locale === "en" ? localOpl.titleEn : localOpl.titleHu) : undefined;
  const heading = articleCopy?.title ?? oplTitle ?? title ?? (termId ? glossaryCopy(termId, locale).term : undefined);
  const lead =
    articleCopy?.summary ??
    oplWhy ??
    summary ??
    (termId ? glossaryTooltip(termId, locale) : undefined) ??
    t("chrome.help");
  const supportHref = termId ? glossarySupportHref(termId) : kbLesson ? supportPageUrl(kbLesson) : null;
  const embed = useSupportEmbedOptional();

  const btnCls = size === "md" ? "h-8 w-8" : "h-6 w-6";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            btnCls,
            "ml-[1pt] shrink-0 rounded-full border border-border bg-[var(--dropdown-hover)] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white",
            className,
          )}
          data-help-icon
          data-exact-ignore
          aria-label={title ?? oplTitle ?? t("chrome.help")}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <GraduationCap className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[9999] w-80 max-w-[min(20rem,calc(100vw-2rem))] border border-border bg-[var(--dropdown-bg)] p-3 text-[12px] leading-snug text-[var(--text-main)] shadow-xl"
        align="start"
        side="bottom"
        sideOffset={14}
        collisionPadding={12}
        data-exact-ignore
        onClick={(e) => e.stopPropagation()}
      >
        {heading ? <p className="font-semibold text-[var(--text-main)]">{heading}</p> : null}
        <div className={heading ? "mt-1.5 whitespace-pre-wrap break-words text-[var(--text-main)]" : "whitespace-pre-wrap break-words"}>
          {lead}
        </div>
        {embed && localOpl ? (
          <button
            type="button"
            className="mt-2 text-[11px] text-[var(--accent-color)] underline-offset-2 hover:underline"
            onClick={() => {
              setOpen(false);
              embed.openEmbed(localOpl.path, locale === "en" ? localOpl.titleEn : localOpl.titleHu);
            }}
          >
            {t("chrome.openLessonPanel")}
          </button>
        ) : supportHref ? (
          <a
            href={supportHref}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-[11px] text-[var(--accent-color)] underline-offset-2 hover:underline"
            onClick={() => setOpen(false)}
          >
            {t("chrome.openOnSupport")}
          </a>
        ) : embed ? (
          <button
            type="button"
            className="mt-2 text-[11px] text-[var(--accent-color)] underline-offset-2 hover:underline"
            onClick={() => {
              setOpen(false);
              embed.openEmbed(resolvedKb ? `kb/${resolvedKb}` : "tippek", title ?? t("chrome.help"));
            }}
          >
            {t("chrome.openLesson")}
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
