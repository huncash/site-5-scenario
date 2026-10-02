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
  DEFAULT_A11Y,
  DEFAULT_PALETTE,
  DEFAULT_THEME,
  loadUiA11y,
  loadUiPalette,
  loadUiTheme,
  PALETTE_LABELS,
  readClientA11y,
  readClientPalette,
  readClientTheme,
  saveUiA11y,
  saveUiPalette,
  saveUiTheme,
} from "@/lib/theme";
import type { UiPalette, UiTheme } from "@/lib/mesh/schema";

type ThemeContextValue = {
  theme: UiTheme;
  palette: UiPalette;
  paletteLabel: string;
  a11y: boolean;
  setTheme: (theme: UiTheme) => void;
  setPalette: (palette: UiPalette) => void;
  setA11y: (enabled: boolean) => void;
  toggleTheme: () => void;
  toggleA11y: () => void;
  cyclePalette: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>(readClientTheme);
  const [palette, setPaletteState] = useState<UiPalette>(readClientPalette);
  const [a11y, setA11yState] = useState<boolean>(readClientA11y);

  useLayoutEffect(() => {
    const initialTheme = readClientTheme();
    const initialPalette = readClientPalette();
    const initialA11y = readClientA11y();
    setThemeState(initialTheme);
    setPaletteState(initialPalette);
    setA11yState(initialA11y);
    applyHtmlAppearance(initialTheme, initialPalette, initialA11y);
    void saveUiPalette(initialPalette);
    void Promise.all([loadUiTheme(), loadUiPalette(), loadUiA11y()]).then(
      ([nextTheme, nextPalette, nextA11y]) => {
        setThemeState(nextTheme);
        setPaletteState(nextPalette);
        setA11yState(nextA11y);
        applyHtmlAppearance(nextTheme, nextPalette, nextA11y);
      },
    );
  }, []);

  const setTheme = useCallback(
    (next: UiTheme) => {
      setThemeState(next);
      applyHtmlAppearance(next, palette, a11y);
      void saveUiTheme(next);
    },
    [palette, a11y],
  );

  const setPalette = useCallback(
    (next: UiPalette) => {
      setPaletteState(next);
      applyHtmlAppearance(theme, next, a11y);
      void saveUiPalette(next);
    },
    [theme, a11y],
  );

  const setA11y = useCallback(
    (next: boolean) => {
      setA11yState(next);
      applyHtmlAppearance(theme, palette, next);
      void saveUiA11y(next);
    },
    [theme, palette],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const toggleA11y = useCallback(() => {
    setA11y(!a11y);
  }, [a11y, setA11y]);

  const cyclePalette = useCallback(() => {
    setPalette(nextPalette(palette));
  }, [palette, setPalette]);

  const value = useMemo(
    () => ({
      theme,
      palette,
      paletteLabel: PALETTE_LABELS[palette],
      a11y,
      setTheme,
      setPalette,
      setA11y,
      toggleTheme,
      toggleA11y,
      cyclePalette,
    }),
    [theme, palette, a11y, setTheme, setPalette, setA11y, toggleTheme, toggleA11y, cyclePalette],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

const idleTheme: ThemeContextValue = {
  theme: DEFAULT_THEME,
  palette: DEFAULT_PALETTE,
  paletteLabel: PALETTE_LABELS[DEFAULT_PALETTE],
  a11y: DEFAULT_A11Y,
  setTheme: () => {},
  setPalette: () => {},
  setA11y: () => {},
  toggleTheme: () => {},
  toggleA11y: () => {},
  cyclePalette: () => {},
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return ctx ?? idleTheme;
}
