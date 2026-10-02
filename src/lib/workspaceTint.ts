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
    // personal: emerald
    // business: steel/graphite
    // project: caramel/sand
    let hue = 42;
    let sat = 22;
    let light = 56;
    if (group === "personal") {
      hue = lerp(160, 152, gt);
      sat = lerp(48, 36, gt);
      light = lerp(48, 58, gt);
    } else if (group === "business") {
      hue = 215;
      sat = lerp(16, 10, gt);
      light = lerp(58, 70, gt);
    } else {
      hue = lerp(28, 38, gt);
      sat = lerp(42, 30, gt);
      light = lerp(56, 72, gt);
    }

    const accentS = clamp(sat + 18, 18, 78);
    const accentL = clamp(light, 46, 78);

    const accent = hsl(hue, accentS, accentL, 1);
    const accentBorder = `color-mix(in srgb, ${accent} 48%, var(--card-border))`;
    const accentBg = `color-mix(in srgb, ${accent} 26%, var(--dropdown-hover))`;
    const accentText = "var(--text-main)";

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
      tabBgIdle: "color-mix(in srgb, var(--card-bg) 72%, transparent)",
      tabBgActive: accentBg,
      tabBorder: "var(--card-border)",
      tabTop: accentBorder,
      pageBg: "var(--app-bg)",
      canvasBg: "var(--app-bg)",
      accent,
      accentBg,
      accentBorder,
      accentText,
    });
  }

  return { map, ids: uniq, stepPct };
}

