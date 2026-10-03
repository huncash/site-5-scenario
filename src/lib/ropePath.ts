/** Balról jobbra tartó kötél: hullám + hurok + csomó, feszítés-progresszióval (0 = gubanc, 1 = egyenes). */

export type RopeSegmentKind = "wave" | "loop" | "knot";

export type RopeSegment = {
  kind: RopeSegmentKind;
  d: string;
  length: number;
};

export type RopeBlueprint = {
  viewBox: { w: number; h: number };
  spine: string;
  segments: RopeSegment[];
  crossings: Array<{ x: number; y: number; angleDeg: number; opacity: number }>;
  /** Mintapontok (morph / hosszbecslés). */
  samples: Array<{ x: number; y: number }>;
  /** Jobb vég (fix / vagon-csatlakozó). */
  end: { x: number; y: number };
  /** Bal (görgőhöz csatlakozó) vég. */
  start: { x: number; y: number };
  /** 0…1 kiegyenesítés (1. fázis). */
  tension: number;
  /** 0…1 vagon-behúzás (2. fázis). */
  haul: number;
};

/** Behúzandó kötél vízszintes hossza (−30% a korábbi 1500-hoz képest). */
const ROPE_SPAN = 1050;
export const ROPE_MID_Y = 210;

/** Oldalnézetes kísérleti vagon a kötél jobb végén. */
export const ROPE_WAGON = {
  w: 176,
  h: 70,
  wheelR: 13,
  hitchLen: 22,
} as const;

/** Föld / sín Y — a vagon kerekei alatt (görgőtől a kép jobb széléig). */
export function ropeGroundY(): number {
  const { h, wheelR } = ROPE_WAGON;
  const bodyH = h - 10;
  const bodyY = ROPE_MID_Y - bodyH * 0.62;
  const platformBottom = bodyY + bodyH + 10;
  const wheelCy = platformBottom + wheelR * 0.92;
  return wheelCy + wheelR + 3;
}

/** Tekercselő dob: további −20% a 36-os sugárhoz (→ 28.8); alja a földvonalon. */
const ROLLER_R = 36 * 0.8;
const ROLLER_STROKE = 3; // TangledRopeSvg körvonal — a külső él érinti a földet
/** cx: a „Szcenárió” felirat „ó” törzsének közepe (a dob takarja; az ékezet a betűé). */
export const ROPE_ROLLER = {
  cx: 740,
  cy: ropeGroundY() - ROLLER_R - ROLLER_STROKE / 2,
  r: ROLLER_R,
} as const;
/**
 * Kötél magassága = a dob felső pontja (ott tekeredik fel; vízszintes érintő).
 * X: a tetőponttól indul jobbra — nincs merőleges leereszkedés a dob oldalára.
 */
export const ROPE_LINE_Y = ROPE_ROLLER.cy - ROPE_ROLLER.r;
export const ROPE_ROPE_START = ROPE_ROLLER.cx;
/** Jobb oldali kiinduló (fix) vég — kiegyenesítés után innen indul a behúzás. */
export const ROPE_FIXED_X = ROPE_ROPE_START + ROPE_SPAN;
/**
 * Behúzás vége: a görgő és a vagon között maradó rés (~1 m + 10% a pálya léptékén).
 * Megereszkedve ez rajzolja ki az írott „o” kis kacsáját.
 */
export const ROPE_O_KACSA_GAP = 22 * 1.1 * 1.15;
/** Függőleges megereszkedés szorzó (1 = eredeti; 0.5 = fele). */
export const ROPE_O_KACSA_SAG = 0.5;
/** A vagon-csatlakozó X-e a behúzás végén (nem ér a görgőig). */
export const ROPE_HAUL_REST_X = ROPE_ROPE_START + ROPE_O_KACSA_GAP;
/** Képkeret: görgő-cx + SPAN + jobb margó (felirat balra fér). */
export const ROPE_VB = { w: 1828, h: 420 } as const;

/** @deprecated használd ROPE_ROPE_START / ROPE_FIXED_X */
export const ROPE_LEFT_X = ROPE_ROPE_START;
/** @deprecated */
export const ROPE_ANCHOR_X = ROPE_FIXED_X;

/** 1. fázis: gubanc → egyenes (lépés 0…8). */
export const ROPE_STRAIGHTEN_STEPS = 8;
/** 2. fázis: vagon behúzása a görgőig (lépés 8…16). */
export const ROPE_HAUL_STEPS = 8;
/** Teljes animáció. */
export const ROPE_TOTAL_STEPS = ROPE_STRAIGHTEN_STEPS + ROPE_HAUL_STEPS;
/** @deprecated → ROPE_TOTAL_STEPS */
export const ROPE_TENSION_STEPS = ROPE_TOTAL_STEPS;

export function phasesFromProgress(progress: number): { straighten: number; haul: number } {
  const c = Math.max(0, Math.min(1, progress));
  return {
    straighten: Math.min(1, c * 2),
    haul: Math.max(0, Math.min(1, c * 2 - 1)),
  };
}

export function progressFromStep(step: number): number {
  return Math.max(0, Math.min(1, step / ROPE_TOTAL_STEPS));
}

export function stepFromProgress(progress: number): number {
  return Math.round(Math.max(0, Math.min(1, progress)) * ROPE_TOTAL_STEPS);
}

/** A kötél jobb végének X-e a behúzás alatt (haul=0 → fix vég, haul=1 → o-kacsa rés). */
export function hitchXAtHaul(haul: number): number {
  const t = Math.max(0, Math.min(1, haul));
  const eased = 1 - Math.pow(1 - t, 1.6);
  return ROPE_FIXED_X + (ROPE_HAUL_REST_X - ROPE_FIXED_X) * eased;
}

/** Megereszkedés erőssége: a végállás közelében → 1 (írott o-kacsa). */
function oKacsaSagForEnd(endX: number): number {
  const gap = endX - ROPE_ROPE_START;
  const rest = ROPE_O_KACSA_GAP;
  if (gap <= rest + 0.5) return 1;
  if (gap >= rest * 2.8) return 0;
  return Math.max(0, Math.min(1, 1 - (gap - rest) / (rest * 1.8)));
}

/**
 * Írott kis „o” kacsája: belépő kacsa + ovális törzs (majdnem zárt o, rés felül).
 * sag=0 → egyenes; sag=1 → teljes megereszkedett o.
 */
function sampleOKacsa(u: number, x0: number, x1: number, sag: number): Pt {
  const xLine = lerp(x0, x1, u);
  const yLine = ROPE_LINE_Y;
  if (sag < 0.001) return { x: xLine, y: yLine };

  const w = Math.max(8, x1 - x0);
  const cx = (x0 + x1) / 2;
  const rx = w * 0.58;
  const ry = w * 0.62 * ROPE_O_KACSA_SAG;
  // Ovális közepe: a teteje a kötélvonalon
  const cy = yLine + ry * 0.88;

  let ox: number;
  let oy: number;
  if (u < 0.16) {
    // Belépő kacsa — kis hurok a görgő jobb oldalán (nem lóg a dob mögé)
    const t = u / 0.16;
    const kcx = x0 + w * 0.18;
    const kcy = yLine + ry * 0.28;
    const ka = lerp(-Math.PI * 0.2, Math.PI * 1.05, t);
    ox = kcx + Math.cos(ka) * rx * 0.22;
    oy = kcy + Math.sin(ka) * ry * 0.26;
  } else {
    // Fő o: bal-felső → bal → alul → jobb → jobb-felső (írott o)
    const t = (u - 0.16) / 0.84;
    const theta = lerp(Math.PI + 0.55, -0.55, t);
    ox = cx + Math.cos(theta) * rx;
    oy = cy + Math.sin(theta) * ry;
  }

  const edge = u < 0.03 ? u / 0.03 : u > 0.97 ? (1 - u) / 0.03 : 1;
  const blend = sag * edge;
  return {
    x: lerp(xLine, ox, blend),
    y: lerp(yLine, oy, blend),
  };
}

const SAMPLE_N = 144;

export type RopeAmps = {
  wave1: number;
  loop1: number;
  wave2: number;
  knot1: number;
  wave3: number;
  loop2: number;
  wave4: number;
  knot2: number;
  loop3: number;
  wave5: number;
};

const FULL_AMPS: RopeAmps = {
  wave1: 1,
  loop1: 1,
  wave2: 1,
  knot1: 1,
  wave3: 1,
  loop2: 1,
  wave4: 1,
  knot2: 1,
  loop3: 1,
  wave5: 1,
};

/** Lépésenként: a bal (görgő felőli) lazaságok tűnnek el előbb. */
export function ampsAtStep(step: number): RopeAmps {
  const s = Math.max(0, Math.min(ROPE_STRAIGHTEN_STEPS, Math.floor(step)));
  const a = { ...FULL_AMPS };
  const kill = (key: keyof RopeAmps, fromStep: number) => {
    if (s <= fromStep) return;
    const t = Math.min(1, (s - fromStep) / 1.25);
    a[key] = Math.max(0, 1 - t);
  };
  kill("wave1", 0);
  kill("loop1", 1);
  kill("knot1", 2);
  kill("wave2", 2);
  kill("wave3", 3);
  kill("loop2", 4);
  kill("wave4", 4);
  kill("knot2", 5);
  kill("loop3", 6);
  kill("wave5", 7);
  if (s >= ROPE_STRAIGHTEN_STEPS) {
    for (const k of Object.keys(a) as (keyof RopeAmps)[]) a[k] = 0;
  }
  return a;
}

export function tensionFromStep(step: number): number {
  return Math.max(0, Math.min(1, step / ROPE_STRAIGHTEN_STEPS));
}

export function haulFromStep(step: number): number {
  return Math.max(0, Math.min(1, (step - ROPE_STRAIGHTEN_STEPS) / ROPE_HAUL_STEPS));
}

/** Folyamatos kiegyenesítés 0…1 → interpolált amplitúdók. */
export function ampsAtProgress(straighten: number): RopeAmps {
  const clamped = Math.max(0, Math.min(1, straighten));
  const scaled = clamped * ROPE_STRAIGHTEN_STEPS;
  const i0 = Math.floor(scaled);
  const i1 = Math.min(ROPE_STRAIGHTEN_STEPS, i0 + 1);
  const t = scaled - i0;
  const a0 = ampsAtStep(i0);
  const a1 = ampsAtStep(i1);
  const out = { ...FULL_AMPS };
  for (const k of Object.keys(out) as (keyof RopeAmps)[]) {
    out[k] = a0[k] * (1 - t) + a1[k] * t;
  }
  return out;
}

function zeroAmps(): RopeAmps {
  const a = { ...FULL_AMPS };
  for (const k of Object.keys(a) as (keyof RopeAmps)[]) a[k] = 0;
  return a;
}

type Pt = { x: number; y: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Egy szakasz lokális mintapontjai u∈[0,1] mentén; am=0 → egyenes a baseline-on. */
function sampleWave(u: number, x0: number, x1: number, amp: number, cycles: number, ampMul: number): Pt {
  const x = lerp(x0, x1, u);
  const y = ROPE_LINE_Y + Math.sin(u * Math.PI * 2 * cycles) * amp * ampMul;
  return { x, y };
}

function sampleLoop(u: number, x0: number, span: number, r: number, side: 1 | -1, ampMul: number): Pt {
  // ampMul=0: egyenes x0→x0+span; ampMul=1: teljes hurok
  const straightX = x0 + span * u;
  const straightY = ROPE_LINE_Y;
  if (ampMul < 0.001) return { x: straightX, y: straightY };
  const ang = -side * (u * Math.PI * 2);
  const cx = x0 + span * 0.45;
  const cy = ROPE_LINE_Y - side * r * 0.15;
  const loopX = cx + Math.cos(ang - Math.PI / 2) * r * ampMul;
  const loopY = cy + Math.sin(ang - Math.PI / 2) * r * ampMul;
  // Belépés/kilépés a gerincre simul
  const edge = u < 0.12 ? u / 0.12 : u > 0.88 ? (1 - u) / 0.12 : 1;
  const blend = ampMul * edge;
  return {
    x: lerp(straightX, loopX, blend),
    y: lerp(straightY, loopY, blend),
  };
}

function sampleKnot(u: number, x0: number, span: number, s: number, ampMul: number): Pt {
  const straightX = x0 + span * u;
  const straightY = ROPE_LINE_Y;
  if (ampMul < 0.001) return { x: straightX, y: straightY };
  // Nyolcas / overhand közelítés
  const th = u * Math.PI * 2;
  const kx = x0 + span * 0.5 + Math.sin(th) * s * 0.55 * ampMul;
  const ky = ROPE_LINE_Y + Math.sin(th * 2) * s * 0.85 * ampMul;
  const edge = u < 0.1 ? u / 0.1 : u > 0.9 ? (1 - u) / 0.1 : 1;
  const blend = ampMul * Math.min(1, edge * 1.2);
  return {
    x: lerp(straightX, kx, blend),
    y: lerp(straightY, ky, blend),
  };
}

type SegDef =
  | { kind: "wave"; w: number; amp: number; cycles: number; key: keyof RopeAmps }
  | { kind: "loop"; w: number; r: number; side: 1 | -1; key: keyof RopeAmps }
  | { kind: "knot"; w: number; s: number; key: keyof RopeAmps };

/** Szakaszsúlyok ×1.5 az előző gubancos hosszhoz képest. */
const SEG_DEFS: SegDef[] = [
  { kind: "wave", w: 225, amp: 52, cycles: 1.6, key: "wave1" },
  { kind: "loop", w: 105, r: 56, side: 1, key: "loop1" },
  { kind: "wave", w: 165, amp: 40, cycles: 1.35, key: "wave2" },
  { kind: "knot", w: 135, s: 42, key: "knot1" },
  { kind: "wave", w: 255, amp: 68, cycles: 2.0, key: "wave3" },
  { kind: "loop", w: 112, r: 62, side: -1, key: "loop2" },
  { kind: "wave", w: 180, amp: 44, cycles: 1.4, key: "wave4" },
  { kind: "knot", w: 120, s: 36, key: "knot2" },
  { kind: "loop", w: 128, r: 70, side: 1, key: "loop3" },
  { kind: "wave", w: 225, amp: 48, cycles: 1.7, key: "wave5" },
];

function layoutSpans(amps: RopeAmps, endX: number): Array<{ def: SegDef; x0: number; x1: number }> {
  const weights = SEG_DEFS.map((d) => {
    const m = amps[d.key];
    return d.w * (0.72 + 0.28 * (1 - m * 0.85));
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  const total = Math.max(8, endX - ROPE_ROPE_START);
  let x = ROPE_ROPE_START;
  return SEG_DEFS.map((def, i) => {
    const span = (weights[i]! / sum) * total;
    const x0 = x;
    const x1 = x + span;
    x = x1;
    return { def, x0, x1 };
  });
}

function sampleAlong(amps: RopeAmps, endX: number): Pt[] {
  const sag = averageAmp(amps) < 0.02 ? oKacsaSagForEnd(endX) : 0;
  if (sag > 0.001) {
    const pts: Pt[] = [];
    for (let i = 0; i < SAMPLE_N; i++) {
      pts.push(sampleOKacsa(i / (SAMPLE_N - 1), ROPE_ROPE_START, endX, sag));
    }
    pts[0] = { x: ROPE_ROPE_START, y: ROPE_LINE_Y };
    pts[pts.length - 1] = { x: endX, y: ROPE_LINE_Y };
    return pts;
  }

  const layout = layoutSpans(amps, endX);
  const pts: Pt[] = [];
  for (let i = 0; i < SAMPLE_N; i++) {
    const t = i / (SAMPLE_N - 1);
    const targetX = ROPE_ROPE_START + t * (endX - ROPE_ROPE_START);
    let seg = layout[layout.length - 1]!;
    for (const L of layout) {
      if (targetX <= L.x1 + 0.01) {
        seg = L;
        break;
      }
    }
    const u = seg.x1 === seg.x0 ? 0 : (targetX - seg.x0) / (seg.x1 - seg.x0);
    const uu = Math.max(0, Math.min(1, u));
    const m = amps[seg.def.key];
    let p: Pt;
    if (seg.def.kind === "wave") {
      p = sampleWave(uu, seg.x0, seg.x1, seg.def.amp, seg.def.cycles, m);
    } else if (seg.def.kind === "loop") {
      p = sampleLoop(uu, seg.x0, seg.x1 - seg.x0, seg.def.r, seg.def.side, m);
    } else {
      p = sampleKnot(uu, seg.x0, seg.x1 - seg.x0, seg.def.s, m);
    }
    const tension = 1 - averageAmp(amps);
    p = { x: p.x, y: lerp(p.y, ROPE_LINE_Y, tension * 0.15) };
    pts.push(p);
  }
  pts[0] = { x: ROPE_ROPE_START, y: ROPE_LINE_Y };
  pts[pts.length - 1] = { x: endX, y: ROPE_LINE_Y };

  // Egyenes szakaszon a path bbox magassága 0 lenne → egyes böngészők a stroke-ot elvékonyítják.
  // Apró Y-rezgés (~0.6px) vizuálisan egyenes marad, a stroke vastagsága viszont stabil.
  const ySpan = Math.max(...pts.map((p) => p.y)) - Math.min(...pts.map((p) => p.y));
  if (ySpan < 1.5) {
    for (let i = 1; i < pts.length - 1; i++) {
      pts[i] = { x: pts[i]!.x, y: ROPE_LINE_Y + (i % 2 === 0 ? 0.6 : -0.6) };
    }
  }
  return pts;
}

function averageAmp(amps: RopeAmps): number {
  const vals = Object.values(amps);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Catmull-Rom → cubic bezier path (fix mintapontszám → morpholható). */
export function pointsToPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x.toFixed(1)} ${pts[0]!.y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function approxLength(pts: Pt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
  }
  return len;
}

function crossingsFromAmps(amps: RopeAmps, layout: Array<{ def: SegDef; x0: number; x1: number }>) {
  const out: RopeBlueprint["crossings"] = [];
  for (const L of layout) {
    if (L.def.kind !== "knot") continue;
    const m = amps[L.def.key];
    if (m < 0.08) continue;
    out.push({
      x: (L.x0 + L.x1) / 2,
      y: ROPE_LINE_Y + L.def.s * 0.05 * m,
      angleDeg: -28,
      opacity: m,
    });
  }
  return out;
}

function segmentsMeta(
  amps: RopeAmps,
  layout: Array<{ def: SegDef; x0: number; x1: number }>,
  pts: Pt[],
): RopeSegment[] {
  return layout.map((L) => {
    const mid = (L.x0 + L.x1) / 2;
    const local = pts.filter((p) => p.x >= L.x0 - 1 && p.x <= L.x1 + 1);
    const d = local.length >= 2 ? pointsToPath(local) : `M ${L.x0} ${ROPE_LINE_Y} L ${L.x1} ${ROPE_LINE_Y}`;
    return {
      kind: L.def.kind,
      d,
      length: approxLength(local.length >= 2 ? local : [{ x: L.x0, y: ROPE_LINE_Y }, { x: mid, y: ROPE_LINE_Y }]),
    };
  });
}

/**
 * Teljes progress 0…1:
 * - 0…0.5 → kiegyenesítés (gubanc → egyenes)
 * - 0.5…1 → CÉLOK-vagon behúzása a jobb szélről az o-kacsa résig
 */
export function buildRopeAtProgress(progress: number): RopeBlueprint {
  const { straighten, haul } = phasesFromProgress(progress);
  const amps = haul > 0.001 ? zeroAmps() : ampsAtProgress(straighten);
  const endX = haul > 0.001 ? hitchXAtHaul(haul) : ROPE_FIXED_X;
  const layout = layoutSpans(amps, endX);
  const samples = sampleAlong(amps, endX);
  const spine = pointsToPath(samples);
  return {
    viewBox: { w: ROPE_VB.w, h: ROPE_VB.h },
    spine,
    segments: segmentsMeta(amps, layout, samples),
    crossings: crossingsFromAmps(amps, layout),
    samples,
    start: samples[0]!,
    end: samples[samples.length - 1]!,
    tension: straighten,
    haul,
  };
}

/** Alap (gubancos) állapot — visszafelé kompatibilis. */
export function buildTangledRope(): RopeBlueprint {
  return buildRopeAtProgress(0);
}

export function ropeTotalLength(bp: RopeBlueprint): number {
  return approxLength(bp.samples);
}

/** Görgőre felcsévélődő „fölösleg” vizuális szöge (rad). */
export function rollerWindAngle(progress: number): number {
  const { straighten, haul } = phasesFromProgress(progress);
  return straighten * Math.PI * 3.2 + haul * Math.PI * 4.5;
}
