import { useEffect, useRef, useState } from "react";

import { TangledRopeSvg } from "@/components/rope/TangledRopeSvg";
import { ROPE_TOTAL_STEPS } from "@/lib/ropePath";
import { cn } from "@/lib/utils";

const PLAY_MS = ROPE_TOTAL_STEPS * 750;
const REPLAY_WAIT_MS = 30_000;

type FooterRopeMarkProps = {
  className?: string;
  /** @deprecated Hover helyett viewport + 30 mp auto-replay. Opcionális extra trigger. */
  hovered?: boolean;
};

/**
 * Kötél SVG: viewportba görgetéskor elindul (iPad-kompatibilis, hover nélkül),
 * lejátszás után 30 mp múlva magától újraindul. Kattintás: azonnali újraindítás.
 */
export function FooterRopeMark({ className, hovered = false }: FooterRopeMarkProps) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(0);
  const prevHoveredRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const waitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockedRef = useRef(false);
  const playingRef = useRef(false);
  const startedFromViewRef = useRef(false);
  const startPlayRef = useRef<(force: boolean) => void>(() => {});

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  startPlayRef.current = (force: boolean) => {
    if (!force && (playingRef.current || lockedRef.current)) return;
    if (waitRef.current != null) {
      clearTimeout(waitRef.current);
      waitRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lockedRef.current = false;
    lastTsRef.current = null;
    progressRef.current = 0;
    setProgress(0);
    playingRef.current = true;
    setPlaying(true);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (waitRef.current != null) clearTimeout(waitRef.current);
    };
  }, []);

  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const next = Math.min(1, progressRef.current + dt / PLAY_MS);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        lockedRef.current = true;
        if (waitRef.current != null) clearTimeout(waitRef.current);
        waitRef.current = setTimeout(() => {
          waitRef.current = null;
          lockedRef.current = false;
          startPlayRef.current(true);
        }, REPLAY_WAIT_MS);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing]);

  /** Első láthatóvá váláskor indít (scroll / iPad). */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      startPlayRef.current(false);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0);
        if (!hit || startedFromViewRef.current) return;
        startedFromViewRef.current = true;
        startPlayRef.current(false);
      },
      { threshold: [0, 0.2, 0.35], rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Opcionális hover rising edge (asztali). */
  useEffect(() => {
    const rising = hovered && !prevHoveredRef.current;
    prevHoveredRef.current = hovered;
    if (!rising) return;
    startPlayRef.current(false);
  }, [hovered]);

  return (
    <span
      ref={wrapRef}
      className={cn("site-footer-rope-wrap", className)}
      aria-hidden
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startPlayRef.current(true);
      }}
    >
      <TangledRopeSvg progress={progress} className="site-footer-rope" />
    </span>
  );
}
