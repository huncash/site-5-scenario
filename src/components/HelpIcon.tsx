import { useMemo, useState, type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { kbById, type KnowledgeBaseArticleId } from "@/lib/knowledgeBase";
import { useSupportEmbedOptional } from "@/components/support/SupportEmbedProvider";

/** Címke + hover (`data-exact`) + kattintható sapka. Lean fogalmakhoz. */
export function LeanTerm({
  children,
  exact,
  summary,
  className,
  title,
}: {
  children: ReactNode;
  exact: string;
  summary?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center", className)} data-exact={exact}>
      <span className="min-w-0">{children}</span>
      <HelpIcon title={title} summary={summary ?? exact} />
    </span>
  );
}

export function HelpIcon({
  kbId,
  summary,
  title,
  className,
  size = "sm",
}: {
  kbId?: KnowledgeBaseArticleId;
  summary?: string;
  title?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const article = useMemo(() => (kbId ? kbById(kbId) : null), [kbId]);
  const tooltipText = summary ?? article?.summary ?? "Súgó";
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
          aria-label={title ?? article?.title ?? "Súgó"}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <GraduationCap className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 max-w-[min(16rem,calc(100vw-2rem))] border border-border bg-[var(--dropdown-bg)] p-2.5 text-[12px] leading-snug text-[var(--text-main)] shadow-xl"
        align="start"
        side="bottom"
        sideOffset={14}
        collisionPadding={12}
        data-exact-ignore
        onClick={(e) => e.stopPropagation()}
      >
        <div className="whitespace-pre-wrap break-words">{tooltipText}</div>
        {embed ? (
          <button
            type="button"
            className="mt-2 text-[11px] text-[var(--accent-color)] underline-offset-2 hover:underline"
            onClick={() => {
              setOpen(false);
              embed.openEmbed(kbId ? `kb/${kbId}` : "tippek", article?.title ?? title ?? "Súgó");
            }}
          >
            Lecke megnyitása
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
