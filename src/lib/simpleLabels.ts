export type ExpenseKind = "FIX_NEED" | "VARIABLE_NEED" | "WANT" | "INVESTMENT";

const SIMPLE: Record<ExpenseKind, { hu: string; en: string }> = {
  FIX_NEED: { hu: "Fix kiadás", en: "Fixed spend" },
  VARIABLE_NEED: { hu: "Változó szükséglet", en: "Variable need" },
  WANT: { hu: "Rugalmas kiadás", en: "Flexible spend" },
  INVESTMENT: { hu: "Befektetés", en: "Investment" },
};

const EXPERT: Record<ExpenseKind, { hu: string; en: string }> = {
  FIX_NEED: { hu: "FIX NEED", en: "FIX NEED" },
  VARIABLE_NEED: { hu: "VARIABLE NEED", en: "VARIABLE NEED" },
  WANT: { hu: "WANT", en: "WANT" },
  INVESTMENT: { hu: "INVESTMENT", en: "INVESTMENT" },
};

export function expenseTypeLabel(
  type: ExpenseKind | string | null | undefined,
  lean: boolean,
  locale: "hu" | "en" = "hu",
): string {
  if (type !== "FIX_NEED" && type !== "VARIABLE_NEED" && type !== "WANT" && type !== "INVESTMENT") {
    return "";
  }
  const row = lean ? EXPERT[type] : SIMPLE[type];
  return locale === "en" ? row.en : row.hu;
}

export function wasteLabel(lean: boolean, locale: "hu" | "en" = "hu"): string {
  if (lean) return "MUDA";
  return locale === "en" ? "Waste" : "Pazarlás";
}

export function cycleLabel(lean: boolean, locale: "hu" | "en" = "hu"): string {
  if (lean) return "PDCA";
  return locale === "en" ? "Cycle" : "Ciklus";
}

export function penaltyLabel(lean: boolean, locale: "hu" | "en" = "hu"): string {
  if (lean) return locale === "en" ? "Penalty" : "Kötbér";
  return locale === "en" ? "Exit fee" : "Kilépés díja";
}
