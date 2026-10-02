import { useEffect, useMemo, useRef, useState } from "react";

function asHtml(n: EventTarget | null): HTMLElement | null {
  if (!n) return null;
  if (n instanceof HTMLElement) return n;
  if (n instanceof Element) return n.parentElement;
  return null;
}

function readExact(el: HTMLElement | null): string | null {
  if (!el) return null;
  const raw = el.getAttribute("data-exact");
  if (!raw) return null;
  const text = raw.replace(/\\n/g, "\n").trim();
  if (!text) return null;
  const lines = text.split("\n").slice(0, 5);
  const clipped = lines.join("\n");
  return clipped.length > 240 ? `${clipped.slice(0, 237).trimEnd()}…` : clipped;
}

function normHint(s: string) {
  return s
    .toLowerCase()
    .replace(/[—–−\-_/·|,.;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Skip tips that only restate the already-visible label. */
function addsInformation(exact: string, el: HTMLElement): boolean {
  const visible = normHint((el.innerText || el.textContent || "").slice(0, 220));
  const hint = normHint(exact.split("\n")[0] ?? "");
  if (!hint) return false;
  if (!visible) return true;
  if (visible === hint) return false;
  if (visible.includes(hint) || hint.includes(visible)) return false;
  const visWords = new Set(visible.split(" ").filter((w) => w.length > 2));
  const hintWords = hint.split(" ").filter((w) => w.length > 2);
  if (hintWords.length === 0) return false;
  const overlap = hintWords.filter((w) => visWords.has(w)).length;
  return overlap / hintWords.length < 0.72;
}

function closestExact(start: HTMLElement | null): HTMLElement | null {
  let el = start;
  for (let i = 0; i < 4 && el; i++) {
    if (el.closest?.("[data-exact-ignore]")) return null;
    const text = readExact(el);
    if (text && addsInformation(text, el)) return el;
    el = el.parentElement;
  }
  return null;
}

export function HoverCoachTooltip() {
  const [shown, setShown] = useState<string | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const timerRef = useRef<number | null>(null);
  const lastTargetRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const style = useMemo(() => {
    if (typeof window === "undefined") return { left: pos.x + 14, top: pos.y + 18 } as React.CSSProperties;
    return {
      left: Math.min(window.innerWidth - 268, Math.max(12, pos.x + 14)),
      top: Math.min(window.innerHeight - 120, Math.max(12, pos.y + 18)),
    } as React.CSSProperties;
  }, [pos.x, pos.y]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cursorEl: HTMLElement | null = null;
    const setHelpCursor = (el: HTMLElement | null) => {
      if (cursorEl === el) return;
      if (cursorEl) cursorEl.style.removeProperty("cursor");
      cursorEl = el;
      if (el) el.style.cursor = "help";
    };

    const clearTimer = () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };

    const hide = () => {
      clearTimer();
      setHelpCursor(null);
      setShown(null);
    };

    const onMove = (e: MouseEvent) => {
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        setPos(lastMouseRef.current);
      });
    };

    const onOver = (e: MouseEvent) => {
      const t = closestExact(asHtml(e.target));
      if (!t) {
        lastTargetRef.current = null;
        hide();
        return;
      }
      setHelpCursor(t);
      if (lastTargetRef.current === t) return;
      lastTargetRef.current = t;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        const text = readExact(t);
        if (text && addsInformation(text, t)) setShown(text);
      }, 90);
    };

    const onOut = (e: MouseEvent) => {
      const raw = asHtml(e.relatedTarget);
      if (lastTargetRef.current && raw && lastTargetRef.current.contains(raw)) return;
      lastTargetRef.current = null;
      hide();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("keydown", onKey);
      clearTimer();
      setHelpCursor(null);
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!shown) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] max-w-[260px] rounded-md border border-border bg-[var(--dropdown-bg)] px-2.5 py-2 text-[12px] leading-snug text-[var(--text-main)] shadow-xl"
      style={style}
      role="status"
      aria-live="polite"
      data-exact-ignore
    >
      <div className="whitespace-pre-wrap break-words">{shown}</div>
    </div>
  );
}
