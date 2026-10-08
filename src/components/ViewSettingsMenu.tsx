import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Columns2, Glasses, GraduationCap, Keyboard, Moon, Palette, Sun } from "lucide-react";

import { HelpIcon } from "@/components/HelpIcon";
import { useTheme } from "@/components/ThemeProvider";
import { localeLabel, paletteName, useI18n } from "@/i18n";
import { useLeanView } from "@/lib/leanView";
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
  onShortcuts,
  highlightShortcuts = false,
}: {
  showSplit?: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  forceOpen?: boolean;
  highlightSplit?: boolean;
  onShortcuts?: () => void;
  highlightShortcuts?: boolean;
}) {
  const { theme, palette, a11y, cyclePalette, toggleTheme, toggleA11y } = useTheme();
  const { locale, toggleLocale, t } = useI18n();
  const { lean, toggle: toggleLean } = useLeanView();
  const activePalette = paletteName(locale, palette);
  const [open, setOpen] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<ViewMode>("split");
  const [fan, setFan] = useState({ top: -9999, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
    const place = () => {
      const el = triggerRef.current;
      const menu = menuRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!Number.isFinite(r.left) || !Number.isFinite(r.bottom)) return;
      const half = TRAY_WIDTH / 2;
      const cx = r.left + r.width / 2;
      const left = Math.min(window.innerWidth - half - 8, Math.max(half + 8, cx));
      const top = r.bottom - 1;
      if (menu) {
        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;
      }
      setFan((prev) => (prev.top === top && prev.left === left ? prev : { top, left }));
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
        title={t("view.split")}
        aria-label={t("view.splitAria")}
        aria-pressed={viewMode === "split"}
        aria-hidden={!showSplit}
        tabIndex={showSplit ? 0 : -1}
        data-tour-anchor="view-toggle"
        onClick={toggleSplit}
      >
        <Columns2 className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="inline-flex items-center gap-0.5">
        <button
          type="button"
          className="lang-header-btn"
          title={t("view.lang")}
          aria-label={t("view.langAria")}
          onClick={toggleLocale}
        >
          {localeLabel(locale)}
        </button>
        <HelpIcon kbId="language-persist" title={t("view.lang")} />
      </div>

      <button
        type="button"
        className={cn("lang-header-btn inline-flex items-center gap-1", lean && "is-active")}
        title={lean ? t("view.expertOn") : t("view.expertOff")}
        aria-label={lean ? t("view.expertOn") : t("view.expertOff")}
        aria-pressed={lean}
        onClick={toggleLean}
      >
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">{lean ? t("view.expert") : t("view.simple")}</span>
      </button>

      <div className={cn("view-settings-container", open && "active")}>
        <button
          type="button"
          ref={triggerRef}
          id="settingsTrigger"
          className="settings-trigger-btn"
          aria-label={t("view.settings")}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls={menuId}
          title={t("view.settings")}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
        >
          <Glasses className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <div
          ref={menuRef}
          id={menuId}
          className={cn("semicircle-menu", open && "is-open")}
          role="menu"
          aria-label={t("view.settings")}
          aria-hidden={!open}
          inert={!open ? true : undefined}
          style={{ top: fan.top, left: fan.left, width: TRAY_WIDTH, height: 86 }}
        >
          <div className="semicircle-menu-surface">
            <svg
              className="semicircle-tray-svg"
              viewBox="0 0 200 86"
              width={TRAY_WIDTH}
              height={86}
              preserveAspectRatio="xMidYMin meet"
              aria-hidden="true"
            >
              <path d="M16 0.5 A 84 84 0 0 0 184 0.5 Z" />
            </svg>

              <button
                type="button"
                className="view-settings-icon-btn menu-sector sector-1"
                role="menuitem"
                title={`${t("view.palette")} — ${activePalette}`}
                aria-label={t("view.paletteActive", { name: activePalette })}
                onClick={cyclePalette}
              >
                <Palette className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                className="view-settings-icon-btn menu-sector sector-2"
                role="menuitem"
                title={t("view.theme")}
                aria-label={isDark ? t("view.themeToLight") : t("view.themeToDark")}
                aria-pressed={!isDark}
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                className={cn("view-settings-icon-btn a11y-btn menu-sector sector-3", a11y && "is-active")}
                role="menuitemcheckbox"
                title={a11y ? t("view.a11yOn") : t("view.a11yOff")}
                aria-label={a11y ? t("view.a11yOn") : t("view.a11yOffAria")}
                aria-checked={a11y}
                onClick={toggleA11y}
              >
                <img src={A11Y_ICON_SRC} alt="" width={24} height={24} draggable={false} />
              </button>

              {onShortcuts ? (
                <button
                  type="button"
                  className={cn(
                    "view-settings-icon-btn menu-sector sector-lang",
                    highlightShortcuts && "is-tour",
                  )}
                  role="menuitem"
                  title={t("chrome.shortcuts")}
                  aria-label={t("chrome.shortcuts")}
                  onClick={() => {
                    setOpen(false);
                    onShortcuts();
                  }}
                >
                  <Keyboard className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
