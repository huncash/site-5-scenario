/** Akadálymentes diagram-minták. Alapmódban a class-ok hatástalanok. */

export const A11Y_PATTERN_IDS = [
  "pattern-diagonal-stripe",
  "pattern-checker",
  "pattern-dots",
  "pattern-h-stripe",
  "pattern-v-stripe",
] as const;

export type A11yPatternId = (typeof A11Y_PATTERN_IDS)[number];

export const A11Y_PATTERN_CLASS: Record<A11yPatternId, string> = {
  "pattern-diagonal-stripe": "a11y-pat-diagonal",
  "pattern-checker": "a11y-pat-checker",
  "pattern-dots": "a11y-pat-dots",
  "pattern-h-stripe": "a11y-pat-h-stripe",
  "pattern-v-stripe": "a11y-pat-v-stripe",
};

export function a11yPatternFill(id: A11yPatternId): string {
  return `url(#${id})`;
}

export function a11yPatternClassAt(index: number): string {
  const id = A11Y_PATTERN_IDS[((index % A11Y_PATTERN_IDS.length) + A11Y_PATTERN_IDS.length) % A11Y_PATTERN_IDS.length];
  return A11Y_PATTERN_CLASS[id];
}

/** Színjelölés → minta, hogy a jelmagyarázat egyezzen a sávokkal. */
export function a11yPatternClassForColor(color: string): string {
  const c = color.toLowerCase();
  if (c.includes("fb7185") || c.includes("chart-5") || c.includes("chart-7") || c.includes("rose") || c.includes("down")) {
    return A11Y_PATTERN_CLASS["pattern-checker"];
  }
  if (c.includes("94a3b8") || c.includes("chart-4") || c.includes("muted") || c.includes("slate")) {
    return A11Y_PATTERN_CLASS["pattern-h-stripe"];
  }
  if (
    c.includes("accent") ||
    c.includes("chart-1") ||
    c.includes("06b6d4") ||
    c.includes("38bdf8") ||
    c.includes("cyan") ||
    c.includes("sky")
  ) {
    return A11Y_PATTERN_CLASS["pattern-dots"];
  }
  if (
    c.includes("34d399") ||
    c.includes("10b981") ||
    c.includes("40916c") ||
    c.includes("2d6a4f") ||
    c.includes("1b4332") ||
    c.includes("chart-2") ||
    c.includes("emerald") ||
    c.includes("green")
  ) {
    return A11Y_PATTERN_CLASS["pattern-diagonal-stripe"];
  }
  return A11Y_PATTERN_CLASS["pattern-v-stripe"];
}
