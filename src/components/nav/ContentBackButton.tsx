import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { useI18n } from "@/i18n";
import { keepLang } from "@/lib/langSearch";
import { cn } from "@/lib/utils";

/** Tartalom feletti egységes „Vissza” — nem header/footer. */
export function ContentBackButton({
  fallbackTo = "/",
  className,
  label,
}: {
  fallbackTo?: string;
  className?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const text = label ?? t("chrome.backPrev");

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
          return;
        }
        void navigate({ to: fallbackTo, search: keepLang });
      }}
      className={cn(
        "mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      aria-label={text}
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      {text}
    </button>
  );
}
