function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function hsl(h: number, s: number, l: number, a: number) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${clamp(a, 0, 1).toFixed(3)})`;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export type WorkspaceTintGroup = "personal" | "business" | "project";

export type WorkspaceTint = {
  idx: number;
  tabCount: number;
  stepPct: number;
  alpha: number; // 1..min
  group: WorkspaceTintGroup;
  hue: number;
  sat: number;
  light: number;
  tabBgIdle: string;
  tabBgActive: string;
  tabBorder: string;
  tabTop: string;
  pageBg: string;
  canvasBg: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
};

/**
 * Workspace folder palette (category-based):
 * - personal: dark green → light green
 * - business: dark gray → light gray
 * - project: dark brown → light brown
 *
 * Step logic: step = 100 / tabCount; alpha = (100 - idx*step)%.
 */
export function computeWorkspaceTint(
  ids: string[],
  groupForId: (id: string) => WorkspaceTintGroup = (id) => {
    if (id === "personal") return "personal";
    if (String(id).toLowerCase().startsWith("projekt")) return "project";
    return "business";
  },
) {
  const uniq = Array.from(new Set(ids.filter(Boolean)));
  const n = Math.max(1, uniq.length);
  const stepPct = 100 / n;

  const groupIds: Record<WorkspaceTintGroup, string[]> = {
    personal: [],
    business: [],
    project: [],
  };
  for (const id of uniq) groupIds[groupForId(id)].push(id);

  const map = new Map<string, WorkspaceTint>();
  for (let i = 0; i < uniq.length; i++) {
    const id = uniq[i];
    const group = groupForId(id);
    const within = groupIds[group];
    const gi = Math.max(0, within.indexOf(id));
    const gtRaw = within.length <= 1 ? 0 : gi / (within.length - 1);
    const gt =
      (group === "business" || group === "project") && within.length <= 3
        ? gi === 0
          ? 0
          : 1
        : gtRaw;

    // Global “fade” step (left→right): Magán strongest, last tab palest.
    const alpha = clamp((100 - i * stepPct) / 100, 0.22, 1);

    // Base theme color per category (dark workspace)
    // personal: warm beige/olive
    // business: steel/graphite (not dead gray)
    // project: caramel/sand
    let hue = 42;
    let sat = 22;
    let light = 56;
    if (group === "personal") {
      hue = lerp(44, 110, gt); // beige -> olive
      sat = lerp(26, 22, gt);
      light = lerp(62, 58, gt);
    } else if (group === "business") {
      hue = 210; // steel-blue gray
      sat = lerp(20, 12, gt);
      light = lerp(58, 70, gt);
    } else {
      hue = lerp(28, 38, gt); // caramel -> sand
      sat = lerp(42, 30, gt);
      light = lerp(56, 72, gt);
    }

    const accentS = clamp(sat + 18, 18, 78);
    const accentL = clamp(light, 46, 78);

    const accent = hsl(hue, accentS, accentL, 1);
    const accentBorder = hsl(hue, clamp(accentS + 6, 18, 86), clamp(accentL - 8, 32, 74), clamp(0.35 + alpha * 0.45, 0.35, 0.85));
    const accentBg = hsl(hue, clamp(accentS, 18, 80), clamp(accentL - 34, 18, 46), clamp(0.16 + alpha * 0.22, 0.16, 0.42));
    const accentText = hsl(hue, clamp(accentS, 10, 90), clamp(accentL + 18, 70, 88), 1);
    const canvasBg = hsl(hue, clamp(accentS, 12, 70), 10, clamp(0.28 + alpha * 0.18, 0.28, 0.46));

    map.set(uniq[i], {
      idx: i,
      tabCount: n,
      stepPct,
      alpha,
      group,
      hue,
      sat,
      light,
      // Inactive tabs must be dark glass (no white / no dead gray)
      tabBgIdle: "rgba(15, 23, 42, 0.50)", // slate-900/50
      tabBgActive: accentBg,
      tabBorder: "rgba(30, 41, 59, 0.85)", // slate-800
      tabTop: accentBorder,
      // Workspace canvas is fixed dark (no light canvas)
      pageBg: "#0b0f19",
      canvasBg,
      accent,
      accentBg,
      accentBorder,
      accentText,
    });
  }

  return { map, ids: uniq, stepPct };
}

