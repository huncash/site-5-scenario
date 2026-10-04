/** PRO-görbék: Pesszimista / Realista / Optimista — fix hex (szöveg + stroke + swatch azonos). */

export const PRO_PESS_HEX = "#EF4444";
export const PRO_REAL_HEX = "#3B82F6";
export const PRO_OPT_HEX = "#40916C";

/** Stroke / fill érték a chart SVG-hez (nem CSS var — a11y-sárga nem írja felül). */
export const PRO_PESS = PRO_PESS_HEX;
export const PRO_REAL = PRO_REAL_HEX;
export const PRO_OPT = PRO_OPT_HEX;

export type ProTone = "pess" | "real" | "opt";

export const PRO_LINE_CLASS: Record<ProTone, string> = {
  pess: "pro-line-pess",
  real: "pro-line-real",
  opt: "pro-line-opt",
};

export const PRO_SWATCH_CLASS: Record<ProTone, string> = {
  pess: "pro-swatch-pess",
  real: "pro-swatch-real",
  opt: "pro-swatch-opt",
};

export const PRO_HEX: Record<ProTone, string> = {
  pess: PRO_PESS_HEX,
  real: PRO_REAL_HEX,
  opt: PRO_OPT_HEX,
};

export function proToneFromSeriesId(id: string): ProTone | null {
  if (id === "opt") return "opt";
  if (id === "pess") return "pess";
  if (id === "real") return "real";
  return null;
}
