import { cn } from "@/lib/utils";

export function BottomNav({
  activeSubTab,
  onChangeSubTab,
  inventoryLabel,
  isSzummaActive,
  onToggleSzumma,
  onOpenCreate,
}: {
  activeSubTab: "cashflow" | "ledger" | "deals" | "inventory";
  onChangeSubTab: (t: "cashflow" | "ledger" | "deals" | "inventory") => void;
  inventoryLabel: string;
  isSzummaActive: boolean;
  onToggleSzumma: () => void;
  onOpenCreate: () => void;
}) {
  const tabCls = (on: boolean) =>
    cn(
      "inline-flex h-7 items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-all duration-200",
      on
        ? "bg-background/40 text-foreground"
        : "border-transparent bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground",
    );

  const activeStyle = (on: boolean) =>
    on
      ? ({
          borderColor: "var(--ws-folder-accent-border, var(--color-border))",
          backgroundColor: "var(--ws-folder-accent-bg, var(--muted))",
          color: "var(--ws-folder-accent-text, var(--color-foreground))",
        } as const)
      : undefined;

  return (
    <div
      data-tour-anchor="bottom-tabs"
      className="fixed bottom-0 left-0 right-0 z-50 flex h-8 w-full items-center justify-between gap-2 border-t border-border px-2 py-0.5 backdrop-blur-md sm:px-3"
      style={{ background: "var(--ws-canvas-bg, var(--app-bg))" }}
    >
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          className={tabCls(activeSubTab === "cashflow")}
          style={activeStyle(activeSubTab === "cashflow")}
          onClick={() => onChangeSubTab("cashflow")}
        >
          Cashflow
        </button>
        <button
          type="button"
          className={tabCls(activeSubTab === "ledger")}
          style={activeStyle(activeSubTab === "ledger")}
          onClick={() => onChangeSubTab("ledger")}
        >
          Tételek
        </button>
        <button
          type="button"
          className={tabCls(activeSubTab === "deals")}
          style={activeStyle(activeSubTab === "deals")}
          onClick={() => onChangeSubTab("deals")}
        >
          Üzletek
        </button>
        <button
          type="button"
          className={tabCls(activeSubTab === "inventory")}
          style={activeStyle(activeSubTab === "inventory")}
          onClick={() => onChangeSubTab("inventory")}
        >
          {inventoryLabel}
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleSzumma}
          className="flex h-7 items-center justify-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-all duration-200"
          style={
            isSzummaActive
              ? ({
                  borderColor: "var(--ws-folder-accent-border, var(--card-border))",
                  backgroundColor: "var(--ws-folder-accent-bg, var(--dropdown-hover))",
                  color: "var(--ws-folder-accent-text, var(--text-main))",
                } as const)
              : ({
                  borderColor: "var(--card-border)",
                  backgroundColor: "var(--dropdown-hover)",
                  color: "var(--text-muted)",
                } as const)
          }
          title="Szumma (összes munkaterület)"
        >
          Szumma
        </button>

        <div className="btn-new-item-wrap">
          <button
            type="button"
            onClick={onOpenCreate}
            className="btn-new-item h-7"
            title="Új..."
            aria-label="Új munkaterület"
          >
            <span aria-hidden="true">+</span>
            <span className="btn-new-item-label">Új</span>
          </button>
        </div>
      </div>
    </div>
  );
}
