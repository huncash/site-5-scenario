import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function LabActiveDot({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500", className)}
      aria-hidden
    />
  );
}

export function LabActiveMark({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
      <LabActiveDot />
      {label ?? t("labs.active")}
    </span>
  );
}
