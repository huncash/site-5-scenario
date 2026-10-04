import { ArrowUp } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function scrollPageToTop() {
  if (typeof document === "undefined") return;
  const door = document.querySelector(".door-page");
  if (door instanceof HTMLElement) {
    door.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const main = document.querySelector("main");
  if (main instanceof HTMLElement && main.scrollHeight > main.clientHeight) {
    main.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Diszkrét „oldal tetejére” jelölő — footerben / felette. */
export function ScrollToTopButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={scrollPageToTop}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-background/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground",
        className,
      )}
      aria-label={t("chrome.scrollTop")}
    >
      <ArrowUp className="h-3 w-3" />
      {t("chrome.scrollTop")}
    </button>
  );
}
