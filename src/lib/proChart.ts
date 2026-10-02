/** PRO-görbék: pesszimista / realista / optimista. Palettától független, magas kontraszt. */

export const PRO_PESS = "var(--pro-pess)";
export const PRO_REAL = "var(--pro-real)";
export const PRO_OPT = "var(--pro-opt)";

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

export function proToneFromSeriesId(id: string): ProTone | null {
  if (id === "opt") return "opt";
  if (id === "pess") return "pess";
  if (id === "real") return "real";
  return null;
}
