import { getMeshRepository } from "@/lib/mesh/meshRepository";
import type { UiPalette, UiTheme } from "@/lib/mesh/schema";

export const DEFAULT_THEME: UiTheme = "dark";
export const DEFAULT_PALETTE: UiPalette = "forest";
export const UI_PREFS_ID = "ui" as const;
export const THEME_STORAGE_KEY = "szcenario_theme";
export const PALETTE_STORAGE_KEY = "szcenario_palette";
export const LIGHT_THEME_CLASS = "light-accessible";
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

/** Runs in <head> before paint so theme/palette do not flash. Default: dark + forest. */
export const THEME_BOOT_SCRIPT = `(function(){var d=document.documentElement;var palettes=["palette-forest","palette-slate","palette-bronze"];d.classList.add("dark");d.classList.add("palette-forest");d.style.colorScheme="dark";try{var t=localStorage.getItem("szcenario_theme");if(t==="light"){d.classList.remove("dark");d.classList.add("light-accessible");d.style.colorScheme="light";}var p=localStorage.getItem("szcenario_palette");if(p==="slate"||p==="forest"||p==="bronze"){for(var i=0;i<palettes.length;i++)d.classList.remove(palettes[i]);d.classList.add("palette-"+p);}}catch(e){}})();`;

export function applyHtmlTheme(theme: UiTheme): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.classList.toggle("dark", theme === "dark");
  el.classList.toggle(LIGHT_THEME_CLASS, theme === "light");
  el.style.colorScheme = theme;
}

export function applyHtmlPalette(palette: UiPalette): void {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  for (const id of UI_PALETTES) el.classList.remove(paletteClass(id));
  el.classList.add(paletteClass(palette));
  el.removeAttribute("data-palette");
}

export function applyHtmlAppearance(theme: UiTheme, palette: UiPalette): void {
  applyHtmlTheme(theme);
  applyHtmlPalette(palette);
}

export function themeFromDocument(): UiTheme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.classList.contains(LIGHT_THEME_CLASS) ? "light" : "dark";
}

export function paletteFromDocument(): UiPalette {
  if (typeof document === "undefined") return DEFAULT_PALETTE;
  const el = document.documentElement;
  for (const id of UI_PALETTES) {
    if (el.classList.contains(paletteClass(id))) return id;
  }
  return DEFAULT_PALETTE;
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

export async function saveUiTheme(theme: UiTheme): Promise<void> {
  writeStoredTheme(theme);
  const palette = readStoredPalette() ?? DEFAULT_PALETTE;
  await getMeshRepository().save("prefs", { id: UI_PREFS_ID, theme, palette });
}

export async function saveUiPalette(palette: UiPalette): Promise<void> {
  writeStoredPalette(palette);
  const theme = readStoredTheme() ?? DEFAULT_THEME;
  await getMeshRepository().save("prefs", { id: UI_PREFS_ID, theme, palette });
}

export function cyclePalette(palette: UiPalette): UiPalette {
  return nextPalette(palette);
}
