import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { PALETTE_LABELS } from "@/lib/theme";

export function PaletteToggle() {
  const { palette, cyclePalette } = useTheme();
  const label = `${PALETTE_LABELS[palette]} paletta (Aktív)`;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      suppressHydrationWarning
      className="h-8 w-8 shrink-0 border-[var(--border-color)] bg-[var(--bg-primary)] text-foreground"
      aria-label={label}
      title={label}
      onClick={cyclePalette}
    >
      <span className="text-base leading-none" aria-hidden="true">
        🎨
      </span>
    </Button>
  );
}
