import { useEffect } from "react";

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
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isInputFocused =
        ["INPUT", "TEXTAREA", "SELECT"].includes((document.activeElement?.tagName || "").toUpperCase()) ||
        Boolean((document.activeElement as HTMLElement | null)?.isContentEditable);

      // Save: Ctrl+S (always allowed) + prevent browser save dialog
      if (e.ctrlKey && !e.altKey && !e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (e.repeat) return;
        onSave?.();
        return;
      }

      // If typing, navigation is disabled.
      if (isInputFocused) return;

      // Alt+Shift+End: toggle Szumma (prevent browser scroll-to-end)
      if (!e.ctrlKey && e.altKey && e.shiftKey && (e.key === "End" || e.code === "End")) {
        e.preventDefault();
        if (e.repeat) return;
        onToggleSzumma?.();
        return;
      }

      // Bottom tabs: Alt+Shift+ArrowLeft/Right
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.repeat) return;
        onPrevBottomTab?.();
        return;
      }

      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) return;
        onNextBottomTab?.();
        return;
      }

      // Top workspace tabs: Alt+Shift+PageUp/PageDown
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "PageUp") {
        e.preventDefault();
        if (e.repeat) return;
        onPrevTopTab?.();
        return;
      }
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "PageDown") {
        e.preventDefault();
        if (e.repeat) return;
        onNextTopTab?.();
        return;
      }

      // Top workspace tabs (alt fallback): Ctrl+Alt+ArrowLeft/Right
      if (e.ctrlKey && e.altKey && !e.shiftKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.repeat) return;
        onPrevTopTab?.();
        return;
      }
      if (e.ctrlKey && e.altKey && !e.shiftKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (e.repeat) return;
        onNextTopTab?.();
        return;
      }

      // Alt+Shift+ArrowDown: PDCA quarter rotate
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.key === "ArrowDown") {
        e.preventDefault();
        if (e.repeat) return;
        onRotatePdca?.();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [enabled, onNextBottomTab, onNextTopTab, onPrevBottomTab, onPrevTopTab, onRotatePdca, onSave, onToggleSzumma]);
}

