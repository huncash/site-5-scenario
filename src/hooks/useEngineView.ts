import { useCallback, useEffect, useState } from "react";

import {
  ENGINE_VIEW_EVENT,
  readEngineViewFocus,
  writeEngineViewFocus,
  type EngineViewFocus,
} from "@/lib/engineView";

export function useEngineView() {
  const [focus, setFocusState] = useState<EngineViewFocus>(readEngineViewFocus);

  useEffect(() => {
    const sync = () => setFocusState(readEngineViewFocus());
    window.addEventListener(ENGINE_VIEW_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ENGINE_VIEW_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setFocus = useCallback((id: EngineViewFocus) => {
    setFocusState(writeEngineViewFocus(id));
  }, []);

  return { focus, setFocus };
}
