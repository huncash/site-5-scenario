import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyHtmlAppearance,
  cyclePalette as nextPalette,
  DEFAULT_PALETTE,
  DEFAULT_THEME,
  loadUiPalette,
  loadUiTheme,
  PALETTE_LABELS,
  readClientPalette,
  readClientTheme,
  saveUiPalette,
  saveUiTheme,
} from "@/lib/theme";
import type { UiPalette, UiTheme } from "@/lib/mesh/schema";

type ThemeContextValue = {
  theme: UiTheme;
  palette: UiPalette;
  paletteLabel: string;
  setTheme: (theme: UiTheme) => void;
  setPalette: (palette: UiPalette) => void;
  toggleTheme: () => void;
  cyclePalette: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>(readClientTheme);
  const [palette, setPaletteState] = useState<UiPalette>(readClientPalette);

  useLayoutEffect(() => {
    const initialTheme = readClientTheme();
    const initialPalette = readClientPalette();
    setThemeState(initialTheme);
    setPaletteState(initialPalette);
    applyHtmlAppearance(initialTheme, initialPalette);
    void saveUiPalette(initialPalette);
    void Promise.all([loadUiTheme(), loadUiPalette()]).then(([nextTheme, nextPalette]) => {
      setThemeState(nextTheme);
      setPaletteState(nextPalette);
      applyHtmlAppearance(nextTheme, nextPalette);
    });
  }, []);

  const setTheme = useCallback(
    (next: UiTheme) => {
      setThemeState(next);
      applyHtmlAppearance(next, palette);
      void saveUiTheme(next);
    },
    [palette],
  );

  const setPalette = useCallback(
    (next: UiPalette) => {
      setPaletteState(next);
      applyHtmlAppearance(theme, next);
      void saveUiPalette(next);
    },
    [theme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const cyclePalette = useCallback(() => {
    setPalette(nextPalette(palette));
  }, [palette, setPalette]);

  const value = useMemo(
    () => ({
      theme,
      palette,
      paletteLabel: PALETTE_LABELS[palette],
      setTheme,
      setPalette,
      toggleTheme,
      cyclePalette,
    }),
    [theme, palette, setTheme, setPalette, toggleTheme, cyclePalette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: DEFAULT_THEME,
      palette: DEFAULT_PALETTE,
      paletteLabel: PALETTE_LABELS[DEFAULT_PALETTE],
      setTheme: () => {},
      setPalette: () => {},
      toggleTheme: () => {},
      cyclePalette: () => {},
    };
  }
  return ctx;
}
