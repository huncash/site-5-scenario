import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Columns2, Moon, Palette, Settings, Sun } from "lucide-react";

import { useTheme } from "@/components/ThemeProvider";
import { PALETTE_LABELS } from "@/lib/theme";
import { cn } from "@/lib/utils";

const VIEW_MODE_KEY = "ui:viewMode";
const A11Y_ICON_SRC = "/blind-icon.png";
const TRAY_WIDTH = 200;

type ViewMode = "split" | "full";

function readStoredViewMode(): ViewMode {
  try {
    const v = sessionStorage.getItem(VIEW_MODE_KEY);
    if (v === "full" || v === "split") return v;
  } catch {
    /* private mode */
  }
  return "split";
}

function persistViewMode(mode: ViewMode) {
  try {
    sessionStorage.setItem(VIEW_MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent("szcenario:view_mode", { detail: mode }));
  } catch {
    /* private mode */
  }
}

export function ViewSettingsMenu({
  showSplit = false,
  viewMode: viewModeProp,
  onViewModeChange,
  forceOpen = false,
  highlightSplit = false,
}: {
  showSplit?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  forceOpen?: boolean;
  highlightSplit?: boolean;
}) {
  const { theme, palette, a11y, cyclePalette, toggleTheme, toggleA11y } = useTheme();
  const [open, setOpen] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<ViewMode>("split");
  const [fan, setFan] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const isDark = theme === "dark";
  const viewMode = viewModeProp ?? localViewMode;

  useEffect(() => {
    if (viewModeProp) return;
    setLocalViewMode(readStoredViewMode());
  }, [viewModeProp]);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const half = TRAY_WIDTH / 2;
      const left = Math.min(
        window.innerWidth - half - 8,
        Math.max(half + 8, r.left + r.width / 2),
      );
      setFan({ top: r.bottom - 1, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleSplit = () => {
    const next: ViewMode = viewMode === "split" ? "full" : "split";
    persistViewMode(next);
    if (onViewModeChange) onViewModeChange(next);
    else setLocalViewMode(next);
  };

  return (
    <div ref={rootRef} className={cn("view-settings-bar", showSplit && "is-dashboard", open && "is-open")}>
      <button
        type="button"
        className={cn("split-view-toggle-btn", viewMode === "split" && "is-active", highlightSplit && "is-tour")}
        title="Osztott nézet"
        aria-label="Osztott vagy teljes szélességű nézet"
        aria-pressed={viewMode === "split"}
        aria-hidden={!showSplit}
        tabIndex={showSplit ? 0 : -1}
        data-tour-anchor="view-toggle"
        onClick={toggleSplit}
      >
        <Columns2 className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className={cn("view-settings-container", open && "active")}>
        <button
          type="button"
          ref={triggerRef}
          id="settingsTrigger"
          className="settings-trigger-btn"
          aria-label="Nézetbeállítások"
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          title="Nézetbeállítások"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <div
          id={menuId}
          className="semicircle-menu"
          role="menu"
          aria-label="Nézetbeállítások"
          aria-hidden={!open}
          inert={!open ? true : undefined}
          style={{ top: fan.top, left: fan.left }}
        >
          <svg className="semicircle-tray-svg" viewBox="0 0 200 86" aria-hidden="true">
            <path d="M16 0.5 A 84 84 0 0 0 184 0.5 Z" />
          </svg>

          <button
            type="button"
            className="view-settings-icon-btn menu-sector sector-1"
            role="menuitem"
            title={`Színpaletta váltás — ${PALETTE_LABELS[palette]}`}
            aria-label={`Színpaletta váltás, aktív: ${PALETTE_LABELS[palette]}`}
            onClick={cyclePalette}
          >
            <Palette className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="view-settings-icon-btn menu-sector sector-2"
            role="menuitem"
            title="Világos / Sötét mód"
            aria-label={isDark ? "Váltás világos módra" : "Váltás sötét módra"}
            aria-pressed={!isDark}
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            className={cn("view-settings-icon-btn a11y-btn menu-sector sector-3", a11y && "is-active")}
            role="menuitemcheckbox"
            title={a11y ? "Akadálymentes nézet kikapcsolása" : "Akadálymentesítés"}
            aria-label={
              a11y
                ? "Akadálymentes nézet kikapcsolása"
                : "Akadálymentesítés (kormányzati kontrasztmód)"
            }
            aria-checked={a11y}
            onClick={toggleA11y}
          >
            <img src={A11Y_ICON_SRC} alt="" width={28} height={28} draggable={false} />
          </button>
        </div>
      </div>
    </div>
  );
}
