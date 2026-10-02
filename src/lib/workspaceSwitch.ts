export type WorkspaceSwitchId = string;

export type WorkspaceCatalogItem = {
  id: string;
  label: string;
  hint: string;
  keywords?: string;
};

export const WORKSPACE_CATALOG_EVENT = "szcenario:workspace-catalog";

export function publishWorkspaceCatalog(items: WorkspaceCatalogItem[]): void {
  window.dispatchEvent(new CustomEvent(WORKSPACE_CATALOG_EVENT, { detail: { items } }));
}

export const WORKSPACE_SWITCH_EVENT = "szcenario:switch-workspace";

export function requestWorkspaceSwitch(id: WorkspaceSwitchId): void {
  window.dispatchEvent(new CustomEvent(WORKSPACE_SWITCH_EVENT, { detail: { id } }));
}

export function applyWorkspaceSwitch(
  id: WorkspaceSwitchId,
  set: {
    setActiveWs: (k: "magan" | "middle" | "szumma") => void;
    setMiddleWs: (id: string) => void;
  },
): void {
  if (id === "personal") {
    set.setActiveWs("magan");
    return;
  }
  if (id === "__all") {
    set.setActiveWs("szumma");
    return;
  }
  set.setMiddleWs(id);
  set.setActiveWs("middle");
}
