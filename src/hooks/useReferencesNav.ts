import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

import {
  captureScrollPosition,
  consumeReferencesReturn,
  pushReferencesReturn,
  stageReferencesRestore,
  type ReferencesReturnState,
  type ReferencesTabId,
} from "@/lib/referencesNav";
import { inheritedLang, langSearch } from "@/lib/langSearch";

export function useReferencesNav() {
  const navigate = useNavigate();

  const openReferences = useCallback(
    (input: {
      profile: string;
      workspace: string;
      tab?: ReferencesTabId;
      highlightIds?: string[];
      isSzumma?: boolean;
      returnState: Omit<
        ReferencesReturnState,
        "profile" | "workspace" | "scrollPosition" | "previousView" | "highlightIds"
      > &
        Partial<Pick<ReferencesReturnState, "previousView" | "scrollPosition">>;
    }) => {
      const scrollPosition = input.returnState.scrollPosition ?? captureScrollPosition();
      const isSzumma =
        Boolean(input.isSzumma) ||
        input.workspace === "__all" ||
        input.workspace === "all" ||
        input.workspace === "szumma";
      const workspace = isSzumma
        ? "__all"
        : input.workspace && input.workspace !== "__all"
          ? input.workspace
          : "personal";

      pushReferencesReturn({
        previousView: input.returnState.previousView ?? "/",
        activeTab: input.returnState.activeTab,
        activeWs: input.returnState.activeWs,
        middleWs: input.returnState.middleWs,
        pdcaMode: input.returnState.pdcaMode,
        scrollPosition,
        profile: input.profile,
        workspace,
        highlightIds: input.highlightIds,
      });
      void navigate({
        to: "/references",
        search: {
          lang: inheritedLang(),
          profile: input.profile,
          workspace,
          tab: input.tab ?? "partners",
          highlight: input.highlightIds?.[0] ?? undefined,
          isSzumma,
        },
      });
    },
    [navigate],
  );

  const backToPreviousView = useCallback(() => {
    const st = consumeReferencesReturn();
    if (st) {
      stageReferencesRestore(st);
      void navigate({ to: (st.previousView || "/") as "/", search: langSearch() });
      return;
    }
    void navigate({ to: "/", search: langSearch() });
  }, [navigate]);

  return { openReferences, backToPreviousView };
}
