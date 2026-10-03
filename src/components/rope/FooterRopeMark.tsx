import { useEffect, useRef, useState } from "react";

import { TangledRopeSvg } from "@/components/rope/TangledRopeSvg";
import { ROPE_TOTAL_STEPS } from "@/lib/ropePath";
import { cn } from "@/lib/utils";

const PLAY_MS = ROPE_TOTAL_STEPS * 750;
const RESET_WAIT_MS = 30_000;

type FooterRopeMarkProps = {
  className?: string;
  /** Footer hover: rising edge → lejátszás (ha nincs zárolva). */
  hovered?: boolean;
};

/**
 * Footer márka: alapból 1. képkocka.
 * Footer hover → lejátsza a lépéseket → 30 mp vár → vissza az 1. képkockára.
 * Kattintás → azonnal újraindítja (oldalbetöltés nélkül).
 */
export function FooterRopeMark({ className, hovered = false }: FooterRopeMarkProps) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);
  const prevHoveredRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const waitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Lejátszás utáni 30 mp: új hover nem indít (kattintás igen). */
  const lockedRef = useRef(false);
  const playingRef = useRef(false);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (waitRef.current != null) clearTimeout(waitRef.current);
    };
  }, []);

  const startPlay = (force: boolean) => {
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
          progressRef.current = 0;
          setProgress(0);
          lockedRef.current = false;
          waitRef.current = null;
        }, RESET_WAIT_MS);
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

  useEffect(() => {
    const rising = hovered && !prevHoveredRef.current;
    prevHoveredRef.current = hovered;
    if (!rising) return;
    startPlay(false);
  }, [hovered]);

  return (
    <span
      className={cn("site-footer-rope-wrap", className)}
      aria-hidden
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        startPlay(true);
      }}
    >
      <TangledRopeSvg progress={progress} className="site-footer-rope" />
    </span>
  );
}
