import { persistViewPrefs } from "@/lib/viewPrefs";
import { getMeshRepository } from "@/lib/mesh/meshRepository";
import type { UiPalette, UiTheme } from "@/lib/mesh/schema";

export const DEFAULT_THEME: UiTheme = "dark";
export const DEFAULT_PALETTE: UiPalette = "forest";
export const DEFAULT_A11Y = false;
export const UI_PREFS_ID = "ui" as const;
export const THEME_STORAGE_KEY = "szcenario_theme";
export const PALETTE_STORAGE_KEY = "szcenario_palette";
export const A11Y_STORAGE_KEY = "szcenario_a11y";
export const LIGHT_THEME_CLASS = "light";
export const LIGHT_MODE_CLASS = "light-mode";
export const A11Y_CLASS = "a11y-vision";
export const A11Y_MODE_CLASS = "accessibility-mode";
export const A11Y_DATA_ATTR = "data-accessibility";
export const PALETTE_CLASS_PREFIX = "palette-";

export const UI_PALETTES = ["forest", "slate", "bronze"] as const;

export const PALETTE_LABELS: Record<UiPalette, string> = {
  forest: "Erdei zöld",
  slate: "Acélkék",
  bronze: "Bronz-grafit",
};

export function isUiPalette(value: unknown): value is UiPalette {
  return value === "slate" || value === "forest" || value === "bronze";
}

export function nextPalette(palette: UiPalette): UiPalette {
  const i = UI_PALETTES.indexOf(palette);
  return UI_PALETTES[(i + 1) % UI_PALETTES.length];
}

export function paletteClass(palette: UiPalette): string {
  return `${PALETTE_CLASS_PREFIX}${palette}`;
}

/** Runs in <head> before paint so theme/palette/a11y do not flash. Default: dark + forest. */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;var palettes=["palette-forest","palette-slate","palette-bronze"];d.classList.add("dark");d.classList.add("palette-forest");d.setAttribute("data-theme","dark-forest");d.style.colorScheme="dark";try{var t=localStorage.getItem("szcenario_theme");var p=localStorage.getItem("szcenario_palette");if(p!=="slate"&&p!=="forest"&&p!=="bronze")p="forest";for(var i=0;i<palettes.length;i++)d.classList.remove(palettes[i]);d.classList.add("palette-"+p);if(t==="light"){d.classList.remove("dark");d.classList.add("light");d.classList.add("light-mode");d.style.colorScheme="light";d.setAttribute("data-theme","light-"+p);}else{d.setAttribute("data-theme","dark-"+p);}if(localStorage.getItem("szcenario_a11y")==="1"){d.classList.add("a11y-vision");d.classList.add("accessibility-mode");d.setAttribute("data-accessibility","active");}}catch(e){}})();`;

export function applyHtmlTheme(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle("dark", theme === "dark");
  el.classList.toggle(LIGHT_THEME_CLASS, theme === "light");
  el.classList.toggle(LIGHT_MODE_CLASS, theme === "light");
  el.classList.remove("light-accessible");
  el.style.colorScheme = theme;
}

export function themeDataAttr(theme: UiTheme, palette: UiPalette): string {
  return `${theme}-${palette}`;
}

export function applyHtmlPalette(palette: UiPalette): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  for (const id of UI_PALETTES) el.classList.remove(paletteClass(id));
  el.classList.add(paletteClass(palette));
}

export function applyHtmlA11y(enabled: boolean): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle(A11Y_CLASS, enabled);
  el.classList.toggle(A11Y_MODE_CLASS, enabled);
  if (enabled) el.setAttribute(A11Y_DATA_ATTR, "active");
  else el.removeAttribute(A11Y_DATA_ATTR);
}

export function applyHtmlAppearance(theme: UiTheme, palette: UiPalette, a11y = DEFAULT_A11Y): void {
  applyHtmlTheme(theme);
  applyHtmlPalette(palette);
  applyHtmlA11y(a11y);
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeDataAttr(theme, palette));
}

export function themeFromDocument(): UiTheme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const el = document.documentElement;
  if (
    el.classList.contains(LIGHT_THEME_CLASS) ||
    el.classList.contains(LIGHT_MODE_CLASS) ||
    el.classList.contains("light-accessible")
  ) {
    return "light";
  }
  return "dark";
}

export function paletteFromDocument(): UiPalette {
  if (typeof document === "undefined") return DEFAULT_PALETTE;
  const el = document.documentElement;
  for (const id of UI_PALETTES) {
    if (el.classList.contains(paletteClass(id))) return id;
  }
  return DEFAULT_PALETTE;
}

export function a11yFromDocument(): boolean {
  if (typeof document === "undefined") return DEFAULT_A11Y;
  const el = document.documentElement;
  return (
    el.classList.contains(A11Y_CLASS) ||
    el.classList.contains(A11Y_MODE_CLASS) ||
    el.getAttribute(A11Y_DATA_ATTR) === "active"
  );
}

export function readClientTheme(): UiTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* private mode */
  }
  return themeFromDocument();
}

export function readClientPalette(): UiPalette {
  if (typeof window === "undefined") return DEFAULT_PALETTE;
  try {
    const raw = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (isUiPalette(raw)) return raw;
  } catch {
    /* private mode */
  }
  return DEFAULT_PALETTE;
}

export function readClientA11y(): boolean {
  if (typeof window === "undefined") return DEFAULT_A11Y;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* private mode */
  }
  return a11yFromDocument();
}

function readStoredTheme(): UiTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* private mode */
  }
  return null;
}

function readStoredPalette(): UiPalette | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PALETTE_STORAGE_KEY);
    if (isUiPalette(raw)) return raw;
  } catch {
    /* private mode */
  }
  return null;
}

function readStoredA11y(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(A11Y_STORAGE_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* private mode */
  }
  return null;
}

function writeStoredTheme(theme: UiTheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode */
  }
}

function writeStoredPalette(palette: UiPalette): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PALETTE_STORAGE_KEY, palette);
  } catch {
    /* private mode */
  }
}

function writeStoredA11y(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(A11Y_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode */
  }
}

async function persistPrefs(partial: { theme?: UiTheme; palette?: UiPalette; a11y?: boolean }): Promise<void> {
  const theme = partial.theme ?? readStoredTheme() ?? DEFAULT_THEME;
  const palette = partial.palette ?? readStoredPalette() ?? DEFAULT_PALETTE;
  const a11y = partial.a11y ?? readStoredA11y() ?? DEFAULT_A11Y;
  await getMeshRepository().save("prefs", { id: UI_PREFS_ID, theme, palette, a11y });
}

export async function loadUiTheme(): Promise<UiTheme> {
  const stored = readStoredTheme();
  if (stored) return stored;
  return DEFAULT_THEME;
}

export async function loadUiPalette(): Promise<UiPalette> {
  const stored = readStoredPalette();
  if (stored) return stored;
  return DEFAULT_PALETTE;
}

export async function loadUiA11y(): Promise<boolean> {
  const stored = readStoredA11y();
  if (stored !== null) return stored;
  return DEFAULT_A11Y;
}

export async function saveUiTheme(theme: UiTheme): Promise<void> {
  writeStoredTheme(theme);
  await persistPrefs({ theme });
}

export async function saveUiPalette(palette: UiPalette): Promise<void> {
  writeStoredPalette(palette);
  await persistPrefs({ palette });
}

export async function saveUiA11y(a11y: boolean): Promise<void> {
  writeStoredA11y(a11y);
  await persistPrefs({ a11y });
}

export function cyclePalette(palette: UiPalette): UiPalette {
  return nextPalette(palette);
}
