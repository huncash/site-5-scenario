"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { OnePointLesson } from "@/components/support/OnePointLesson";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/i18n";
import { oplByPath } from "@/lib/opl";
import { resolveSupportSlug } from "@/lib/supportRoutes";
import { supportEmbedUrl } from "@/lib/support";

export function SupportEmbedFrame({
  slug,
  title,
  fallback,
}: {
  slug: string;
  title: string;
  fallback?: ReactNode;
}) {
  const { locale, t } = useI18n();
  const route = resolveSupportSlug(slug);
  const opl = oplByPath(route.canonical);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);
  const src = `${supportEmbedUrl(slug)}#${locale}`;

  useEffect(() => {
    if (opl) return;
    setFailed(false);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setFailed(true);
      return;
    }
    timer.current = window.setTimeout(() => setFailed(true), 8000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [src, opl]);

  if (opl) {
    return (
      <div data-support-embed="local" className="min-h-0 overflow-y-auto pr-1">
        <OnePointLesson lesson={opl} />
      </div>
    );
  }

  return (
    <div className="relative min-h-[min(70vh,32rem)] overflow-hidden rounded-md bg-[#0b1220]">
      {!failed ? (
        <iframe
          title={title}
          src={src}
          loading="eager"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          className="absolute inset-0 h-full w-full border-0 bg-[#0b1220]"
          onLoad={() => {
            if (timer.current) window.clearTimeout(timer.current);
          }}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="p-4 text-sm text-slate-300">
          {fallback ?? <p>{t("support.embedFail")}</p>}
        </div>
      )}
    </div>
  );
}

export function SupportEmbedModal({
  open,
  onOpenChange,
  slug,
  title,
  fallback,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  title: string;
  fallback?: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-3 overflow-y-auto sm:max-w-xl"
        data-support-slideover=""
      >
        <SheetHeader>
          <SheetTitle className="text-left">{title}</SheetTitle>
        </SheetHeader>
        <SupportEmbedFrame slug={slug} title={title} fallback={fallback} />
      </SheetContent>
    </Sheet>
  );
}
