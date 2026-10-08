import { OPL_LESSONS } from "@/lib/opl";

/** Support aloldalak — kanonikus slug + alias. App és support SPA közös SSOT. */

export const SUPPORT_STATIC_SLUGS = ["home", "pricing", "tippek", "gyik", "ticket"] as const;
export type SupportStaticSlug = (typeof SUPPORT_STATIC_SLUGS)[number];

export type SupportLessonGroup = "guide" | "dash" | "motor" | "theory";

export type SupportLessonIndex = {
  id: string;
  path: string;
  aliases: string[];
  group: SupportLessonGroup;
  titleHu: string;
  titleEn: string;
  summaryHu: string;
  summaryEn: string;
  keywords: string[];
  kbId?: string;
};

const SUPPORT_CORE_LESSON_INDEX: SupportLessonIndex[] = [
  {
    id: "lecke-01",
    path: "lecke-1-mintahelyzet",
    aliases: ["lecke-01", "lecke-1"],
    group: "guide",
    titleHu: "Mintahelyzet",
    titleEn: "Sample case",
    summaryHu: "Előre betöltött példa. Nem banki kivonat — a számok a böngészőben készülnek.",
    summaryEn: "A preloaded example. Not a bank extract — the numbers are made in the browser.",
    keywords: ["demo", "minta", "kezdés", "onboarding"],
  },
  {
    id: "lecke-02",
    path: "lecke-1-dashboard-kezeles",
    aliases: ["lecke-02", "lecke-2-dashboard", "dashboard-kezeles"],
    group: "guide",
    titleHu: "Dashboard kezelés",
    titleEn: "Dashboard handling",
    summaryHu: "Előbb a fül, aztán a lombik. A modulok a fán vannak — a főasztal a döntésé.",
    summaryEn: "Tab first, then the flask. Modules live on the tree — the desk is for the decision.",
    keywords: ["dashboard", "kpi", "what-if", "pro", "lombik", "dev tree", "laboratórium"],
  },
  {
    id: "lecke-want",
    path: "lecke-2-szukseglet-vagy-befektetes",
    aliases: ["szukseglet-vagy-befektetes", "need-vs-invest", "want"],
    group: "guide",
    titleHu: "Szükséglet vagy befektetés",
    titleEn: "Need or investment",
    summaryHu: "NEED, WANT és INVESTMENT — mi viszi a cashflow-t, és mit zárolhatsz.",
    summaryEn: "NEED, WANT and INVESTMENT — what hits cashflow, and what you can lock.",
    keywords: ["need", "want", "investment", "szükséglet", "befektetés"],
  },
  {
    id: "lecke-cashflow",
    path: "lecke-cashflow-logika",
    aliases: ["cashflow", "lecke-cashflow"],
    group: "guide",
    titleHu: "Cashflow logika",
    titleEn: "Cashflow logic",
    summaryHu: "Mi jön be, mi megy ki, mi van zárolva — a mozgás, nem a fénykép.",
    summaryEn: "What comes in, what goes out, what is locked — movement, not a snapshot.",
    keywords: ["cashflow", "áfa", "holtpénz", "jit", "runway"],
  },
  {
    id: "lecke-03",
    path: "lecke-3-pdca",
    aliases: ["lecke-03", "lecke-3", "pdca"],
    group: "guide",
    titleHu: "PDCA",
    titleEn: "PDCA",
    summaryHu: "PLAN → DO → CHECK → ACT. A tárcsa a következő fázispárra fordít.",
    summaryEn: "PLAN → DO → CHECK → ACT. The dial turns to the next phase pair.",
    keywords: ["pdca", "plan", "do", "check", "act", "master baseline"],
  },
  {
    id: "lecke-04",
    path: "lecke-4-gyorsbillentyuk",
    aliases: ["lecke-04", "lecke-4"],
    group: "guide",
    titleHu: "Gyorsbillentyűk",
    titleEn: "Shortcuts",
    summaryHu: "A billentyűzet-ikon a lista. Mentés: Ctrl/Cmd+S.",
    summaryEn: "The keyboard icon opens the list. Save: Ctrl/Cmd+S.",
    keywords: ["shortcut", "billentyű", "mentés"],
  },
  {
    id: "lecke-05",
    path: "lecke-5-slot-munkaterek",
    aliases: ["lecke-05", "lecke-5", "slot", "munkater"],
    group: "guide",
    titleHu: "Slot / Munkaterek",
    titleEn: "Slots",
    summaryHu: "Egy Case-en belül Magán, Vállalkozás és Projekt külön Slot. A Szumma összegez.",
    summaryEn: "Inside one Case, Personal, Business and Project are separate Slots. Szumma adds them up.",
    keywords: ["slot", "case", "szumma", "munkatér", "workspace"],
  },
  {
    id: "lecke-06",
    path: "lecke-6-fomenu",
    aliases: ["lecke-06", "lecke-6"],
    group: "guide",
    titleHu: "Főmenü",
    titleEn: "Main menu",
    summaryHu: "Mentés, GYIK és kilépés a három vonal mögött. Nincs telefonos ügyintézés.",
    summaryEn: "Save, FAQ and sign-out sit behind the three lines. No phone desk.",
    keywords: ["menü", "gyik", "kilépés"],
  },
  {
    id: "kozossegi-civil-valsagkezeles",
    path: "kozossegi-civil-valsagkezeles",
    aliases: ["lesson-community"],
    group: "theory",
    titleHu: "Kisközösségi válságkezelés",
    titleEn: "Community crisis",
    summaryHu: "Lajtoskocsi, offline LoRa és téli melegedő.",
    summaryEn: "Tanker, offline LoRa and a winter warm room.",
    keywords: ["lora", "közösség", "víz"],
    kbId: "lesson-community",
  },
  {
    id: "maganszemely-infrastruktura-korlatozas",
    path: "maganszemely-infrastruktura-korlatozas",
    aliases: ["lesson-household"],
    group: "theory",
    titleHu: "Magánemberként a kiesésben",
    titleEn: "A person in an outage",
    summaryHu: "72 órás blackout, víz és mobilnet.",
    summaryEn: "72-hour blackout, water and mobile net.",
    keywords: ["blackout", "háztartás", "72"],
    kbId: "lesson-household",
  },
  {
    id: "vallalati-bcp-folytonossag",
    path: "vallalati-bcp-folytonossag",
    aliases: ["lesson-bcp"],
    group: "theory",
    titleHu: "Vállalati BCP",
    titleEn: "Corporate BCP",
    summaryHu: "SaaS-kiesés, WMS, dokk és kulcsmunkatárs-hiány.",
    summaryEn: "SaaS outage, WMS, dock and key-person gap.",
    keywords: ["bcp", "wms", "dokk", "saas"],
    kbId: "lesson-bcp",
  },
  {
    id: "demografiai-implozio-tfr-matrix",
    path: "demografiai-implozio-tfr-matrix",
    aliases: ["lesson-demography"],
    group: "theory",
    titleHu: "Demográfiai implózió",
    titleEn: "Demographic implosion",
    summaryHu: "TFR-mátrix Koreától Magyarországig.",
    summaryEn: "TFR matrix from Korea to Hungary.",
    keywords: ["tfr", "demográfia"],
    kbId: "lesson-demography",
  },
  {
    id: "oktatasi-campus-valsaghelyzet",
    path: "oktatasi-campus-valsaghelyzet",
    aliases: ["lesson-campus"],
    group: "theory",
    titleHu: "Oktatási válsághelyzetek",
    titleEn: "Campus emergencies",
    summaryHu: "Kiber, hősziget és helyi körforgás.",
    summaryEn: "Cyber, heat island and local loop.",
    keywords: ["campus", "oktatás"],
    kbId: "lesson-campus",
  },
  {
    id: "kahn-strategiai-elagazas",
    path: "kahn-strategiai-elagazas",
    aliases: ["lesson-kahn", "kahn"],
    group: "theory",
    titleHu: "Herman Kahn döntési elágazás",
    titleEn: "Herman Kahn decision fork",
    summaryHu: "Három pálya: rossz, közepes, jó. Runway: hány hónapig bírja a kassza. Stop-loss: hol vágsz.",
    summaryEn: "Three paths: bad, mid, good. Runway: how many months the till lasts. Stop-loss: where you cut.",
    keywords: ["kahn", "runway", "stop-loss", "kötbér", "burn", "core"],
    kbId: "lesson-kahn",
  },
];

function slugEn(titleEn: string): string {
  return titleEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function withEnglishAliases(lesson: SupportLessonIndex): SupportLessonIndex {
  const slug = slugEn(lesson.titleEn);
  const shortId = lesson.id.replace(/^lecke-/, "");
  const extra = [`lesson-${shortId}`, slug, `lesson-${slug}`].filter(Boolean);
  return { ...lesson, aliases: [...new Set([...lesson.aliases, ...extra])] };
}

function oplIndexExtras(): SupportLessonIndex[] {
  return OPL_LESSONS.filter(
    (o) => !SUPPORT_CORE_LESSON_INDEX.some((c) => c.path === o.path || c.id === o.id),
  ).map((o) => ({
    id: o.id,
    path: o.path,
    aliases: o.path.startsWith("lecke-motor-")
      ? [o.path.replace("lecke-motor-", "motor-")]
      : o.path.startsWith("lecke-dash-")
        ? [o.path.replace("lecke-dash-", "dash-")]
        : [],
    group: o.path.startsWith("lecke-motor-") ? "motor" : "dash",
    titleHu: o.titleHu,
    titleEn: o.titleEn,
    summaryHu: o.whyHu,
    summaryEn: o.whyEn,
    keywords: o.keywords,
    kbId: o.kbId,
  }));
}

export const SUPPORT_LESSON_INDEX: SupportLessonIndex[] = [
  ...SUPPORT_CORE_LESSON_INDEX,
  ...oplIndexExtras(),
].map(withEnglishAliases);

const STATIC = new Set<string>(SUPPORT_STATIC_SLUGS);

function normalizeSlug(raw: string): string {
  return raw.replace(/^\/+/, "").replace(/\/+$/, "").replace(/^kb\//, "").replace(/^embed\//, "");
}

export function supportLessonByRef(ref: string): SupportLessonIndex | null {
  const key = normalizeSlug(ref);
  if (!key) return null;
  return (
    SUPPORT_LESSON_INDEX.find(
      (l) => l.path === key || l.id === key || l.kbId === key || l.aliases.includes(key),
    ) ?? null
  );
}

export function canonicalizeSupportSlug(raw: string): string {
  const key = normalizeSlug(raw);
  if (!key || key === "home") return "home";
  if (STATIC.has(key)) return key;
  return supportLessonByRef(key)?.path ?? key;
}

export type SupportRouteKind = "home" | "static" | "lesson" | "unknown";

export type SupportRoute = {
  slug: string;
  canonical: string;
  kind: SupportRouteKind;
  lesson: SupportLessonIndex | null;
};

export function resolveSupportSlug(raw: string): SupportRoute {
  const slug = normalizeSlug(raw);
  if (!slug || slug === "home") {
    return { slug: "home", canonical: "home", kind: "home", lesson: null };
  }
  if (STATIC.has(slug)) {
    return { slug, canonical: slug, kind: "static", lesson: null };
  }
  const lesson = supportLessonByRef(slug);
  if (lesson) {
    return { slug, canonical: lesson.path, kind: "lesson", lesson };
  }
  return { slug, canonical: slug, kind: "unknown", lesson: null };
}

export function supportSlugForKb(kbId: string): string | null {
  return SUPPORT_LESSON_INDEX.find((l) => l.kbId === kbId)?.path ?? null;
}

export function searchSupportLessons(
  query: string,
  locale: "hu" | "en" = "hu",
): SupportLessonIndex[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return SUPPORT_LESSON_INDEX;
  return SUPPORT_LESSON_INDEX.filter((l) => {
    const title = locale === "en" ? l.titleEn : l.titleHu;
    const summary = locale === "en" ? l.summaryEn : l.summaryHu;
    const body = OPL_LESSONS.find((o) => o.path === l.path || o.id === l.id);
    const hay = [
      l.path,
      l.id,
      title,
      summary,
      ...l.aliases,
      ...l.keywords,
      l.kbId ?? "",
      body?.whyHu ?? "",
      body?.whyEn ?? "",
      body?.deepDiveHu ?? "",
      body?.deepDiveEn ?? "",
      ...(body?.jargon ?? []),
      ...(body?.steps.flatMap((s) => [
        s.titleHu,
        s.actionHu,
        s.image?.captionHu ?? "",
        s.titleEn,
        s.actionEn,
        s.image?.captionEn ?? "",
      ]) ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}
