import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/** Jobb felső ⚙ — a hozzáadó gomb mellett, Törzsadat-központ */
export function SectionSettingsGear({
  title = "Törzsadat / szerkezeti beállítások",
  onClick,
  className,
}: {
  title?: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-[var(--dropdown-hover)] text-[var(--text-main)] hover:bg-[var(--accent-color)] hover:text-white",
        className,
      )}
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Settings className="h-3.5 w-3.5" />
    </button>
  );
}
