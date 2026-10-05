import { localeLabel } from "@/i18n/locale";
import { useI18n } from "@/i18n";
import { useTheme } from "@/components/ThemeProvider";

/** Kompakt nézetcsík bill/support aldomainre — paletta, téma, a11y, nyelv. */
export function SiteViewPrefsBar(props: { hideLang?: boolean }) {
  const { theme, palette, a11y, cyclePalette, toggleTheme, toggleA11y } = useTheme();
  const { locale, toggleLocale, t } = useI18n();

  return (
    <div className="view-prefs-bar" role="toolbar" aria-label={t("view.settings")}>
      <button type="button" onClick={cyclePalette} title={t("view.palette")} aria-label={t("view.palette")}>
        {palette === "forest" ? "F" : palette === "slate" ? "S" : "B"}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        title={t("view.theme")}
        aria-label={theme === "dark" ? t("view.themeToLight") : t("view.themeToDark")}
      >
        {theme === "dark" ? "Aa" : "A"}
      </button>
      <button
        type="button"
        className={a11y ? "is-active" : undefined}
        onClick={toggleA11y}
        title={a11y ? t("view.a11yOn") : t("view.a11yOff")}
        aria-pressed={a11y}
      >
        A11y
      </button>
      {props.hideLang ? null : (
        <button type="button" onClick={toggleLocale} title={t("view.lang")} aria-label={t("view.langAria")}>
          {localeLabel(locale)}
        </button>
      )}
    </div>
  );
}
