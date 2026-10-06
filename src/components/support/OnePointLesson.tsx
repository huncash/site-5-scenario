import { useEffect, useState } from "react";

import { LeanTerm } from "@/components/HelpIcon";
import { useI18n } from "@/i18n";
import { glossaryCopy } from "@/lib/glossary";
import { OPL_FRAME, type OplImageSlot, type OplLesson, type OplStep } from "@/lib/opl";
import { resolveOplFrame, type OplFrameKind } from "@/lib/oplStorage";

const UI = {
  hu: {
    why: "Miért fontos?",
    steps: "Lépések",
    figure: "Ábra helye",
    frame: "320 × 180",
    step: "Lépés",
    deep: "Nem szakembereknek",
    jargon: "Kapcsolódó szakzsargon",
  },
  en: {
    why: "Why it matters",
    steps: "Steps",
    figure: "Figure slot",
    frame: "320 × 180",
    step: "Step",
    deep: "For non-specialists",
    jargon: "Related jargon",
  },
} as const;

export function OnePointLesson({ lesson }: { lesson: OplLesson }) {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : "hu";
  const ui = UI[lang];
  return (
    <article className="space-y-5" data-opl={lesson.id}>
      <header className="space-y-2 border-b border-border/70 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          OPL · {lang === "en" ? lesson.categoryEn : lesson.categoryHu}
        </p>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {lang === "en" ? lesson.titleEn : lesson.titleHu}
        </h1>
        <ul className="flex flex-wrap gap-1.5">
          {lesson.jargon.map((id) => (
            <li key={id}>
              <LeanTerm
                termId={id}
                className="rounded-md border border-border/70 bg-card/70 px-1.5 py-0.5 text-[11px] font-medium"
                title={glossaryCopy(id, lang).term}
              >
                {glossaryCopy(id, lang).term}
              </LeanTerm>
            </li>
          ))}
        </ul>
      </header>

      <section className="rounded-xl border border-border/70 bg-card/50 px-3 py-2.5">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.why}</h2>
        <p className="mt-1 text-[13px] leading-snug text-foreground">{lang === "en" ? lesson.whyEn : lesson.whyHu}</p>
      </section>

      <section aria-label={ui.steps} className="space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.steps}</h2>
        <ol className="grid gap-3">
          {lesson.steps.map((step, i) => (
            <OplStepRow key={step.id} step={step} index={i + 1} lang={lang} ui={ui} />
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-border/70 bg-background px-3 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.deep}</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground">
          {lang === "en" ? lesson.deepDiveEn : lesson.deepDiveHu}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{ui.jargon}</h2>
        <ul className="grid gap-1.5">
          {lesson.jargon.map((id) => {
            const g = glossaryCopy(id, lang);
            return (
              <li key={id} className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-snug">
                <LeanTerm
                  termId={id}
                  className="font-medium text-foreground"
                  title={g.term}
                >
                  {g.term}
                </LeanTerm>
                <span className="text-muted-foreground">— {g.plain}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}

function OplStepRow({
  step,
  index,
  lang,
  ui,
}: {
  step: OplStep;
  index: number;
  lang: "hu" | "en";
  ui: (typeof UI)["hu"];
}) {
  return (
    <li className="grid items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-3 md:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {ui.step} {index}
        </p>
        <h3 className="mt-0.5 text-sm font-semibold text-foreground">
          {lang === "en" ? step.titleEn : step.titleHu}
        </h3>
        <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
          {lang === "en" ? step.actionEn : step.actionHu}
        </p>
      </div>
      <OplFigure slot={step.image} lang={lang} fallback={ui.figure} frameLabel={ui.frame} />
    </li>
  );
}

function OplFigure({
  slot,
  lang,
  fallback,
  frameLabel,
}: {
  slot?: OplImageSlot;
  lang: "hu" | "en";
  fallback: string;
  frameLabel: string;
}) {
  const caption = slot ? (lang === "en" ? slot.captionEn : slot.captionHu) : fallback;
  const alt = slot ? (lang === "en" ? slot.altEn ?? slot.captionEn : slot.altHu ?? slot.captionHu) : fallback;
  const { kind, url } = useOplFrame(slot?.src);
  const displayUrl = url ?? slot?.src;
  return (
    <figure className="mx-auto w-[320px] shrink-0 justify-self-end" data-opl-frame={url ? kind : displayUrl ? "fetched" : "fallback"}>
      <div
        className="overflow-hidden rounded-lg border border-dashed border-border bg-background"
        style={{ width: OPL_FRAME.widthPx, height: OPL_FRAME.heightPx }}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={alt}
            width={OPL_FRAME.widthPx}
            height={OPL_FRAME.heightPx}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{frameLabel}</span>
            <span className="text-[12px] font-medium leading-snug text-foreground">{caption}</span>
          </span>
        )}
      </div>
      <figcaption className="mt-1 truncate text-center text-[10px] text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function useOplFrame(src?: string): { kind: OplFrameKind; url?: string } {
  const [state, setState] = useState<{ kind: OplFrameKind; url?: string }>({ kind: "fallback" });
  useEffect(() => {
    let alive = true;
    let objectUrl: string | undefined;
    void resolveOplFrame(src).then((resolved) => {
      if (!alive) {
        if (resolved.objectUrl) URL.revokeObjectURL(resolved.objectUrl);
        return;
      }
      objectUrl = resolved.objectUrl;
      setState({ kind: resolved.kind, url: resolved.objectUrl });
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);
  return state;
}
