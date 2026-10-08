import { useCallback } from "react";

import { useI18n } from "@/i18n";
import { DASH_HU_EN } from "@/i18n/dashSurfaceMap";
import { SURFACE_HU_EN } from "@/i18n/surfaceMap";

const SURFACE: Record<string, string> = { ...SURFACE_HU_EN, ...DASH_HU_EN };

export function surfaceTx(locale: string, hu: string): string {
  if (locale !== "en") return hu;
  return SURFACE[hu] ?? hu;
}

export function useSurfaceTx(): (hu: string) => string {
  const { locale } = useI18n();
  return useCallback((hu: string) => surfaceTx(locale, hu), [locale]);
}
