import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark
    ? "Váltás magas kontrasztú világos módra"
    : "Váltás sötét módra";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      suppressHydrationWarning
      className="h-8 w-8 shrink-0 border-[var(--border-color)] bg-[var(--bg-primary)] text-foreground"
      aria-label={label}
      aria-pressed={!isDark}
      title={label}
      onClick={toggleTheme}
    >
      <span className="text-base leading-none" aria-hidden="true">
        {isDark ? "☀️" : "🌙"}
      </span>
    </Button>
  );
}
