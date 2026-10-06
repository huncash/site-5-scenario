import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Folder } from "lucide-react";

import { LeanTerm } from "@/components/HelpIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
// PDCA controls are rendered in the top header

import type { WorkspaceMeta } from "@/lib/finance";
import { formatMoney } from "@/lib/finance";
import { computeWorkspaceTint, type WorkspaceTint } from "@/lib/workspaceTint";
import { useOnboardingTour } from "@/components/onboarding/OnboardingTourProvider";
import { useI18n } from "@/i18n";

export type PdcaMode = "PD" | "DC" | "CA" | "AP";
export type PdcaNewBucket = "DO" | "PLAN";

type WsKey = "magan" | "middle" | "szumma";

export function WorkspaceTabs({
  activeWs,
  setActiveWs,
  middleWs,
  setMiddleWs,
  wsOptions,
  workspaces,
  labelFor,
  colorFor,
  onOpenCreate,
  className,
}: {
  activeWs: WsKey;
  setActiveWs: (k: WsKey) => void;
  middleWs: string;
  setMiddleWs: (v: string) => void;
  wsOptions: string[];
  workspaces: WorkspaceMeta[];
  labelFor: (wsId: string) => string;
  colorFor: (wsId: string) => string;
  onOpenCreate?: () => void;
  className?: string;
}) {
  const { isOpen: tourOpen, stepId: tourStepId } = useOnboardingTour();
  const highlightPanels = tourOpen && (tourStepId === "demo" || tourStepId === "anatomy");
  const selectWs = (wsId: string) => {
    if (wsId === "__all") return setActiveWs("szumma");
    if (wsId === "personal") return setActiveWs("magan");
    setMiddleWs(wsId);
    setActiveWs("middle");
  };

  const tabBase =
    "relative -mb-px inline-flex h-8 max-w-full shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-t-lg border border-b-0 px-2.5 text-xs font-medium transition-all duration-200";

  const tabBtn = (
    wsId: string,
    tint?: WorkspaceTint,
  ) => {
    const isActive =
      (wsId === "personal" && activeWs === "magan") ||
      (wsId !== "personal" && activeWs === "middle" && middleWs === wsId);
    return (
      <button
        key={wsId}
        type="button"
        onClick={() => selectWs(wsId)}
        className={`${tabBase} ${
          isActive
            ? "z-10 text-foreground"
            : "border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
        }`}
        style={{
          ...(isActive
            ? {
                backgroundColor: tint?.tabBgActive ?? undefined,
                borderColor: tint?.accentBorder ?? tint?.tabBorder ?? undefined,
                borderTopColor: tint?.tabTop ?? undefined,
                borderTopWidth: 2,
                color: tint?.accentText ?? undefined,
                boxShadow: tint?.accentBorder
                  ? `0 0 0 1px ${tint.accentBorder}, 0 10px 30px -18px ${tint.accent}`
                  : undefined,
              }
            : {
                borderTopColor: "transparent",
                borderTopWidth: 2,
              }),
        }}
        aria-pressed={isActive}
        title={labelFor(wsId)}
      >
        <Folder className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[7rem] truncate sm:max-w-[11rem]">{labelFor(wsId)}</span>
      </button>
    );
  };

  const { leftIds, rightIds } = useMemo(() => {
    const byId = new Map(workspaces.map((w) => [w.id, w]));
    const left: string[] = [];
    const right: string[] = [];

    left.push("personal");

    for (const id of wsOptions) {
      if (id === "personal") continue;
      const w = byId.get(id);
      if (!w) continue;
      if (w.type === "project") right.push(id);
      else left.push(id);
    }

    const uniq = (xs: string[]) => Array.from(new Set(xs));
    return { leftIds: uniq(left), rightIds: uniq(right) };
  }, [workspaces, wsOptions]);

  const tintByWs = useMemo(() => {
    const all = [...leftIds, ...rightIds];
    const byId = new Map(workspaces.map((w) => [w.id, w]));
    return computeWorkspaceTint(all, (id) => {
      if (id === "personal") return "personal";
      const t = byId.get(id)?.type ?? null;
      if (t === "project") return "project";
      if (t === "business") return "business";
      if (t === "personal") return "personal";
      return "business";
    });
  }, [leftIds, rightIds, workspaces]);

  const stripKey = useMemo(() => {
    const a = leftIds.join("|");
    const b = rightIds.join("|");
    return `${a}::${b}`;
  }, [leftIds, rightIds]);

  return (
    <div className={`flex min-w-0 items-end gap-2 pb-0.5 ${className ?? ""}`.trim()}>
      <div className="grid min-w-0 flex-1 grid-cols-1 items-end gap-2 xl:grid-cols-2">
        <div className="no-scrollbar flex min-w-0 flex-nowrap items-end gap-2 overflow-x-auto pr-1">
          {leftIds.map((id) => tabBtn(id, tintByWs.map.get(id)))}
        </div>
        <div key={stripKey} className="no-scrollbar flex min-w-0 flex-nowrap items-end gap-2 overflow-x-auto">
          {rightIds.map((id) => tabBtn(id, tintByWs.map.get(id)))}
        </div>
      </div>
      {onOpenCreate ? (
        <div className="btn-new-item-wrap">
          <button
            type="button"
            className="btn-new-item"
            onClick={onOpenCreate}
            title="Új Slot"
            aria-label="Új Slot"
          >
            <span aria-hidden="true">+</span>
            <span className="btn-new-item-label">Új</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function WorkspacePanels({
  activeWs,
  setActiveWs,
  middleWs,
  setMiddleWs,
  wsOptions,
  workspaces,
  labelFor,
  colorFor,
  pdcaMode,
  setPdcaMode,
  activeWorkspaceId,
  viewMode,
  checkNotes,
  onSaveCheckNotes,
  checkSummary,
  resourceEfficiency,
  realEstatePanel,
  onPromotePlanToDo,
  onStartNewPlanningCycle,
  onNewImprovementGoal,
  leftContent,
  rightContent,
  useMasterGrid,
  phaseExactFor,
}: {
  activeWs: WsKey;
  setActiveWs: (k: WsKey) => void;
  middleWs: string;
  setMiddleWs: (v: string) => void;
  wsOptions: string[];
  workspaces: WorkspaceMeta[];
  labelFor: (wsId: string) => string;
  colorFor: (wsId: string) => string;
  pdcaMode: PdcaMode;
  setPdcaMode: (v: PdcaMode) => void;
  activeWorkspaceId: string;
  viewMode?: "split" | "full";
  checkNotes: string;
  onSaveCheckNotes: (next: string) => void;
  checkSummary: null | {
    mudaScore: number;
    effPct: number;
    runway60Pct: number | null;
    frictionGross: number;
    idleCash: number;
    dataWastePct: number;
  };
  resourceEfficiency?: null | {
    evGross: number;
    efoGross: number;
    hrActualGross: number;
    hrPlannedGross: number;
    vehicleGross: number;
    totalExpenseGross: number;
  };
  realEstatePanel?: ReactNode;
  onPromotePlanToDo: () => void;
  onStartNewPlanningCycle: () => void;
  onNewImprovementGoal: () => void;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  useMasterGrid?: boolean;
  phaseExactFor?: (phase: "PLAN" | "DO" | "CHECK" | "ACT") => string;
}) {
  const [notesDraft, setNotesDraft] = useState(checkNotes ?? "");
  useEffect(() => setNotesDraft(checkNotes ?? ""), [checkNotes, activeWorkspaceId, pdcaMode]);
  const { isOpen: tourOpen, stepId: tourStepId } = useOnboardingTour();
  const { t } = useI18n();
  const highlightPanels = tourOpen && (tourStepId === "demo" || tourStepId === "anatomy");

  const phaseLabel = (p: "PLAN" | "DO" | "CHECK" | "ACT") => {
    if (p === "PLAN") return t("pdca.plan");
    if (p === "DO") return t("pdca.do");
    if (p === "CHECK") return t("pdca.check");
    return t("pdca.act");
  };
  const phaseExact = (p: "PLAN" | "DO" | "CHECK" | "ACT") => {
    if (phaseExactFor) return phaseExactFor(p);
    if (p === "PLAN") return "tervezés — célok, szimuláció, örökölt törzs. Itt tervezel, mielőtt élesítesz.";
    if (p === "DO") return "végrehajtás — élő folyamat. Ami most történik.";
    if (p === "CHECK") return "ellenőrzés — a számok és a mutatók valósága.";
    return "beavatkozás — protokoll vagy keret.";
  };
  const phaseCls = (p: "PLAN" | "DO" | "CHECK" | "ACT") => {
    if (p === "PLAN") return "text-amber-400 font-bold";
    if (p === "DO") return "text-cyan-400 font-bold";
    if (p === "CHECK") return "text-emerald-400 font-bold";
    return "text-rose-400 font-bold";
  };

  const leftPhase: "PLAN" | "DO" | "CHECK" | "ACT" =
    pdcaMode === "PD" ? "PLAN" : pdcaMode === "DC" ? "DO" : pdcaMode === "CA" ? "CHECK" : "ACT";
  const rightPhase: "PLAN" | "DO" | "CHECK" | "ACT" =
    pdcaMode === "PD" ? "DO" : pdcaMode === "DC" ? "CHECK" : pdcaMode === "CA" ? "ACT" : "PLAN";

  const headerLeft = phaseLabel(leftPhase);
  const headerRight = phaseLabel(rightPhase);
  const headerLeftCls = phaseCls(leftPhase);
  const headerRightCls = phaseCls(rightPhase);

  if (useMasterGrid) {
    const isFull = viewMode === "full";
    return (
      <div
        data-tour-anchor="work-panels"
        data-view-mode={viewMode ?? "split"}
        className={`w-full px-2 pt-1 sm:px-3 md:px-4 ${isFull ? "max-w-none" : "mx-auto max-w-[98%]"} ${
          highlightPanels ? "rounded-xl ring-2 ring-cyan-300/70 shadow-[0_0_0_4px_rgba(34,211,238,0.16)]" : ""
        }`}
      >
        <div
          className={`relative grid w-full grid-cols-1 items-start gap-2 md:gap-2.5 ${
            isFull ? "" : "xl:grid-cols-2"
          }`}
        >
          {!isFull ? (
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-slate-800 xl:block" />
          ) : null}

          {/* LEFT COLUMN */}
          <section className="pdca-col">
            <div className="shrink-0 text-[11px] font-semibold uppercase tracking-wider">
              <LeanTerm
                className={headerLeftCls}
                termId={leftPhase.toLowerCase() as "plan" | "do" | "check" | "act"}
                exact={phaseExact(leftPhase)}
                title={headerLeft}
              >
                {headerLeft}
              </LeanTerm>
            </div>
            <div className="grid min-h-0 w-full items-start gap-1.5">{leftContent}</div>
          </section>

          {/* RIGHT COLUMN */}
          {!isFull ? (
            <section className="pdca-col">
              <div className="shrink-0 text-left text-[11px] font-semibold uppercase tracking-wider">
                <LeanTerm
                  className={headerRightCls}
                  termId={rightPhase.toLowerCase() as "plan" | "do" | "check" | "act"}
                  exact={phaseExact(rightPhase)}
                  title={headerRight}
                >
                  {headerRight}
                </LeanTerm>
              </div>
              <div className="grid min-h-0 w-full items-start gap-1.5">{rightContent}</div>
            </section>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      data-tour-anchor="work-panels"
      className={`mx-auto w-full px-2 pt-4 sm:px-4 ${viewMode === "full" ? "max-w-none" : "max-w-[98%]"} ${
        highlightPanels ? "rounded-xl ring-2 ring-cyan-300/70 shadow-[0_0_0_4px_rgba(34,211,238,0.16)]" : ""
      }`}
    >
      <div className="mt-2 grid grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-6">
        <div className="text-xs font-semibold uppercase tracking-wider">
          <LeanTerm
            className={headerLeftCls}
            termId={leftPhase.toLowerCase() as "plan" | "do" | "check" | "act"}
            title={headerLeft}
          >
            {headerLeft}
          </LeanTerm>
        </div>
        <div className="text-left text-xs font-semibold uppercase tracking-wider">
          <LeanTerm
            className={headerRightCls}
            termId={rightPhase.toLowerCase() as "plan" | "do" | "check" | "act"}
            title={headerRight}
          >
            {headerRight}
          </LeanTerm>
        </div>
      </div>

      {pdcaMode === "CA" ? (
        <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-background/40 p-5">
            <div className="mb-3 text-xs font-medium text-emerald-300">{t("pdca.checkNotes")}</div>

            {checkSummary ? (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <LeanTerm className="text-xs text-muted-foreground" termId="muda">
                    MUDA score
                  </LeanTerm>
                  <Badge variant="secondary" className="text-[10px]">
                    {checkSummary.mudaScore}/100
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Hatékonyság: <span className="font-mono text-slate-200">{checkSummary.effPct}%</span> · Adatveszteség:{" "}
                  <span className="font-mono text-slate-200">{checkSummary.dataWastePct}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <LeanTerm termId="friction">Súrlódás</LeanTerm>:{" "}
                  <span className="font-mono text-slate-200">
                    {formatMoney(Math.round(checkSummary.frictionGross))}
                  </span>{" "}
                  · <LeanTerm termId="idleCash">Holtpénz</LeanTerm>:{" "}
                  <span className="font-mono text-slate-200">{formatMoney(Math.round(checkSummary.idleCash))}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <LeanTerm termId="runway">Céltartalék 60 nap</LeanTerm>:{" "}
                  <span className="font-mono text-slate-200">
                    {checkSummary.runway60Pct == null ? "—" : `${checkSummary.runway60Pct}%`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Válassz egy vállalkozás/projekt munkateret a Check összegzéshez.
              </div>
            )}

            {resourceEfficiency ? (
              <div className="mt-5 rounded-md border border-slate-700/60 bg-slate-800/50 p-4">
                <LeanTerm
                  className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-200"
                  title="Erőforrás-hatékonyság"
                  exact="alvállalkozói és alkalmi díjak, jármű, és a terv vs tény a személyzeten."
                >
                  Erőforrás & Humán Költséghatékonyság
                </LeanTerm>
                <div className="grid gap-2.5 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <LeanTerm
                      title="EV alvállalkozók"
                      exact="alvállalkozó / egyéni vállalkozó díja, bruttó."
                    >
                      EV alvállalkozók (bruttó)
                    </LeanTerm>
                    <span className="font-mono text-slate-200">{formatMoney(Math.round(resourceEfficiency.evGross))}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <LeanTerm
                      title="EFO napidíjak"
                      exact="alkalmi (egyszerűsített) foglalkoztatás napidíja, bruttó."
                    >
                      EFO napidíjak (bruttó)
                    </LeanTerm>
                    <span className="font-mono text-slate-200">{formatMoney(Math.round(resourceEfficiency.efoGross))}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Járműhasználat / kiküldetés (bruttó)</span>
                    <span className="font-mono text-slate-200">
                      {formatMoney(Math.round(resourceEfficiency.vehicleGross))}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <LeanTerm
                      title="HR terv vs tény"
                      exact="személyzeti veszteség — a tervezett költség vs. ami tényleg kifizetődött."
                    >
                      Muda: HR terv vs tény
                    </LeanTerm>
                    <span className="font-mono text-slate-200">
                      {formatMoney(Math.round(resourceEfficiency.hrPlannedGross))} →{" "}
                      {formatMoney(Math.round(resourceEfficiency.hrActualGross))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <LeanTerm
                      title="EV+EFO arány"
                      exact="alvállalkozói és alkalmi díjak az összes kiadáshoz képest."
                    >
                      Arány (EV+EFO / összköltség)
                    </LeanTerm>
                    <span className="font-mono text-slate-200">
                      {resourceEfficiency.totalExpenseGross > 0
                        ? `${Math.round(
                            ((resourceEfficiency.evGross + resourceEfficiency.efoGross) /
                              resourceEfficiency.totalExpenseGross) *
                              100,
                          )}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {realEstatePanel ? <div className="mt-4">{realEstatePanel}</div> : null}

            <div className="mt-4 grid gap-2">
              <div className="text-xs text-slate-300">Megjegyzések (check_notes)</div>
              <Textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.currentTarget.value)}
                placeholder="pl. eltérés okai, észrevételek, következő mérés fókusza…"
                className="min-h-[90px]"
              />
              <div className="flex items-center justify-end">
                <Button type="button" size="sm" className="h-8" onClick={() => onSaveCheckNotes(notesDraft)}>
                  Mentés
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-background/40 p-4">
            <div className="mb-3 text-xs font-medium text-rose-300">{t("pdca.actGoals")}</div>
            <div className="grid gap-2">
              <Button type="button" variant="outline" onClick={onPromotePlanToDo} title="Projekt élesítése (PLAN→DO)">
                🚀 Projekt Élesítése (PLAN → DO)
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onStartNewPlanningCycle}
                title="Új tervezési ciklus indítása (PLAN ág)"
              >
                🔄 Új Tervezési Ciklus Indítása
              </Button>
              <Button type="button" variant="outline" onClick={onNewImprovementGoal} title="Új fejlesztési cél">
                🎯 Új Fejlesztési Cél Kitűzése
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

