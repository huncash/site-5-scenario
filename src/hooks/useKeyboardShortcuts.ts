import { useEffect, useRef } from "react";

export function useKeyboardShortcuts({
  enabled = true,
  onPrevBottomTab,
  onNextBottomTab,
  onPrevTopTab,
  onNextTopTab,
  onSave,
  onToggleSzumma,
  onRotatePdca,
}: {
  enabled?: boolean;
  onPrevBottomTab?: () => void;
  onNextBottomTab?: () => void;
  onPrevTopTab?: () => void;
  onNextTopTab?: () => void;
  onSave?: () => void;
  onToggleSzumma?: () => void;
  onRotatePdca?: () => void;
}) {
  const handlersRef = useRef({
    onPrevBottomTab,
    onNextBottomTab,
    onPrevTopTab,
    onNextTopTab,
    onSave,
    onToggleSzumma,
    onRotatePdca,
  });

  // Keep latest callbacks without re-binding the event listener.
  useEffect(() => {
    handlersRef.current = {
      onPrevBottomTab,
      onNextBottomTab,
      onPrevTopTab,
      onNextTopTab,
      onSave,
      onToggleSzumma,
      onRotatePdca,
    };
  }, [onNextBottomTab, onNextTopTab, onPrevBottomTab, onPrevTopTab, onRotatePdca, onSave, onToggleSzumma]);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        ["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement?.tagName || "").toUpperCase()) ||
        Boolean((document.activeElement as HTMLElement | null)?.isContentEditable);

      // Save: Ctrl/Cmd+S (always allowed) + prevent browser save dialog
      if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onSave?.();
        return;
      }

      // If typing, navigation is disabled.
      if (isInputFocused) return;

      // Alt+Shift+End: toggle Szumma (prevent browser scroll-to-end)
      if (!e.ctrlKey && e.altKey && e.shiftKey && (e.key === "End" || e.code === "End")) {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onToggleSzumma?.();
        return;
      }

      // Bottom tabs: Alt+Shift+ArrowLeft/Right
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onPrevBottomTab?.();
        return;
      }

      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onNextBottomTab?.();
        return;
      }

      // Top workspace tabs: PageUp/PageDown (legacy, no modifiers)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key === "PageUp") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onPrevTopTab?.();
        return;
      }
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key === "PageDown") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onNextTopTab?.();
        return;
      }

      // Top workspace tabs: Alt+Shift+PageUp/PageDown (fallback)
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "PageUp") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onPrevTopTab?.();
        return;
      }
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "PageDown") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onNextTopTab?.();
        return;
      }

      // Top workspace tabs (alt fallback): Ctrl+Alt+ArrowLeft/Right
      if (e.ctrlKey && e.altKey && !e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onPrevTopTab?.();
        return;
      }
      if (e.ctrlKey && e.altKey && !e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onNextTopTab?.();
        return;
      }

      // PDCA quarter rotate: ArrowDown (legacy, no modifiers)
      if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && e.key === "ArrowDown") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onRotatePdca?.();
        return;
      }

      // PDCA quarter rotate: Alt+Shift+ArrowDown (fallback)
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        if (e.repeat) return;
        handlersRef.current.onRotatePdca?.();
        return;
      }
    };

    const opts: AddEventListenerOptions = { passive: false };
    window.addEventListener("keydown", onKeyDown, opts);
    return () => window.removeEventListener("keydown", onKeyDown, opts);
  }, [enabled]);
}

