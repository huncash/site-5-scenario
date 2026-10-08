import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function SimLegalDisclaimer({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <aside
      role="note"
      className={cn(
        "rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-foreground",
        className,
      )}
    >
      {t("legal.simDisclaimer")}
    </aside>
  );
}
