"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);
  const src = supportEmbedUrl(slug);

  useEffect(() => {
    setFailed(false);
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setFailed(true);
      return;
    }
    timer.current = window.setTimeout(() => setFailed(true), 8000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [src]);

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
          {fallback ?? <p>A support oldal most nem érhető el. A helyi súgó továbbra is a készülékeden van.</p>}
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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Bezárás"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-[91] w-full max-w-3xl rounded-lg border border-slate-700 bg-background p-3 shadow-2xl"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <button
            type="button"
            className="rounded-md px-1.5 text-slate-400 hover:text-slate-100"
            aria-label="Bezárás"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>
        <SupportEmbedFrame slug={slug} title={title} fallback={fallback} />
      </div>
    </div>,
    document.body,
  );
}
