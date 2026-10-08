import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Binoculars,
  BookOpen,
  Columns3,
  Eye,
  EyeOff,
  Library,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { CapacityHudBar } from "@/components/labs/CapacityHudBar";
import { LabsSalesFunnel } from "@/components/labs/LabsSalesFunnel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useI18n, type MessageKey } from "@/i18n";
import { useDashboardLab } from "@/hooks/useDashboardLabs";
import { useEngineView } from "@/hooks/useEngineView";
import { useEntitled } from "@/hooks/useEntitlement";
import { useLabsEngines } from "@/hooks/useLabsEngines";
import { LAB_ICON } from "@/components/labs/labIcons";
import { dashboardLabById, labShowsOnDashboard, type DashboardLabId } from "@/lib/dashboardLabs";
import { keepLang } from "@/lib/langSearch";
import { recordEngineClick } from "@/lib/engineInterest";
import { licensedEngines } from "@/lib/engineFrames";
import {
  applyExclusiveEngineEye,
  engineEyeOpen,
  engineFunnelHref,
  engineLicenseLed,
  isEngineLicensed,
  scrollEngineSection,
} from "@/lib/engineView";
import { LICENSE_CHANGE_EVENT, readLicense } from "@/lib/license";
import {
  labBerryClickKind,
  labEyeOpen,
  labLicenseLed,
  labModuleFunnelHref,
  type LabLicenseLed,
} from "@/lib/labBerrySignals";
import {
  LABS_BCP_PRACTICE,
  LABS_CORE,
  LABS_EDUCATION_MODULES,
  LABS_ENGINES,
  LABS_MESH_DESK,
  LABS_STEM,
  labsCapPath,
  LABS_TREE_MODULES,
  LABS_TREE_VIEW,
  isLabsSharedModule,
  labsClippedPath,
  labsTreeEdges,
  labsTreeNodes,
  type LabsEngineId,
} from "@/lib/labsTechTree";
import { ensureDashboardHome, requestLabFocus, type LabFocusMode } from "@/lib/labFocus";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ENGINE_LABEL_KEY: Record<LabsEngineId, MessageKey> = {
  economic: "labs.engineEconomic",
  resilience: "labs.engineResilience",
  education: "labs.engineEducation",
};

const ENGINE_ICON: Record<LabsEngineId, typeof Wallet> = {
  economic: Wallet,
  resilience: ShieldAlert,
  education: Library,
};

const ENGINE_BERRY =
  "border-foreground/40 bg-foreground/20 text-emerald-200 hover:border-foreground/55";
const ENGINE_BERRY_ON = "border-foreground/55 bg-foreground/32 text-emerald-100";

function goCart(href: string) {
  if (typeof window === "undefined" || !href) return;
  window.location.assign(href);
}

function pct(n: number, total: number): string {
  return `${(n / total) * 100}%`;
}

function LicenseLed({ led, className }: { led: LabLicenseLed; className?: string }) {
  return (
    <span
      data-labs-led={led}
      className={cn(
        "h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_7px_currentColor]",
        led === "green" ? "bg-emerald-400 text-emerald-400" : "bg-red-500 text-red-500",
        className,
      )}
      aria-hidden
    />
  );
}

function Berry({
  x,
  y,
  children,
  className,
  onClick,
  disabled,
  tip,
  label,
  hideTip,
  eyeOpen,
  licenseLed,
}: {
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  tip?: ReactNode;
  label: string;
  hideTip?: boolean;
  eyeOpen?: boolean;
  licenseLed?: LabLicenseLed;
}) {
  const showSignals = eyeOpen !== undefined || licenseLed !== undefined;
  const btn = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      data-labs-berry=""
      className={cn(
        "absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border shadow-[0_4px_12px_-6px_rgba(0,0,0,0.7)] transition-colors hover:border-foreground/50",
        showSignals ? "h-11 w-11 flex-col gap-px pt-0.5" : "h-8 w-8",
        className,
      )}
      style={{ left: pct(x, LABS_TREE_VIEW.w), top: pct(y, LABS_TREE_VIEW.h) }}
    >
      {children}
      {showSignals ? (
        <span className="flex items-center gap-0.5" aria-hidden>
          {eyeOpen !== undefined ? (
            eyeOpen ? <Eye className="h-2.5 w-2.5" data-labs-eye="open" /> : <EyeOff className="h-2.5 w-2.5" data-labs-eye="off" />
          ) : null}
          {licenseLed ? <LicenseLed led={licenseLed} /> : null}
        </span>
      ) : null}
    </button>
  );
  if (hideTip || !tip) return btn;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent side="top" className="z-[9999] max-w-[14rem] text-[11px] leading-snug">
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}

const SCOPE_CLICK_MS = 280;

function LabsPinCard({
  id,
  engineOn,
  enableEngine,
  onClose,
  onJump,
  onFunnel,
}: {
  id: DashboardLabId;
  engineOn: boolean;
  enableEngine: () => Promise<void>;
  onClose: () => void;
  onJump: () => void;
  onFunnel: (id: DashboardLabId) => void;
}) {
  const { t } = useI18n();
  const lab = dashboardLabById(id);
  const entitled = useEntitled(id);
  const { isOpen, setOpen } = useDashboardLab(id);
  const eye = labEyeOpen({ entitled, pipedToDashboard: isOpen });
  const led = labLicenseLed(entitled);
  const scopeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scopeTimer.current != null) window.clearTimeout(scopeTimer.current);
    };
  }, []);

  const toggleEye = async () => {
    if (!entitled) {
      onFunnel(id);
      return;
    }
    if (!labShowsOnDashboard(id)) {
      toast.message(t("labs.comingSoonToast"));
      return;
    }
    if (!engineOn) await enableEngine();
    setOpen(!isOpen);
  };

  const reveal = async (mode: LabFocusMode) => {
    if (!entitled) {
      onFunnel(id);
      return;
    }
    if (!labShowsOnDashboard(id)) {
      toast.message(t("labs.comingSoonToast"));
      return;
    }
    if (!engineOn) await enableEngine();
    if (!isOpen) setOpen(true);
    if (mode === "jump") {
      onJump();
      ensureDashboardHome();
    }
    requestLabFocus(id, mode);
  };

  const onScopeClick = () => {
    if (scopeTimer.current != null) {
      window.clearTimeout(scopeTimer.current);
      scopeTimer.current = null;
      void reveal("jump");
      return;
    }
    scopeTimer.current = window.setTimeout(() => {
      scopeTimer.current = null;
      void reveal("highlight");
    }, SCOPE_CLICK_MS);
  };

  return (
    <aside
      data-labs-pin={id}
      className="absolute right-1.5 top-1.5 z-20 w-[12.25rem] rounded-lg border border-border bg-card/95 p-2.5 shadow-xl"
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-[12px] font-semibold leading-snug text-foreground">{t(lab.labelKey)}</p>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            data-labs-scope=""
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={t("labs.scopeHint")}
            title={t("labs.scopeHint")}
            onClick={onScopeClick}
          >
            <Binoculars className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-6 w-6 items-center justify-center text-[10px] text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label={t("chrome.close")}
          >
            ×
          </button>
        </div>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{t(lab.hintKey)}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent"
          aria-pressed={eye}
          aria-label={eye ? t("labs.visibleOn") : t("labs.hiddenOn")}
          onClick={() => void toggleEye()}
        >
          {eye ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
          <LicenseLed led={led} className="h-2 w-2" />
          {led === "green" ? t("labs.licenseOn") : t("labs.licenseOff")}
        </span>
      </div>
    </aside>
  );
}

function LabBerry({
  id,
  x,
  y,
  pinned,
  onPin,
  onFunnel,
}: {
  id: DashboardLabId;
  x: number;
  y: number;
  pinned: boolean;
  onPin: (id: DashboardLabId) => void;
  onFunnel: (id: DashboardLabId) => void;
}) {
  const { t } = useI18n();
  const lab = dashboardLabById(id);
  const { isOpen } = useDashboardLab(id);
  const entitled = useEntitled(id);
  const led = labLicenseLed(entitled);
  const eye = labEyeOpen({ entitled, pipedToDashboard: isOpen });

  return (
    <Berry
      x={x}
      y={y}
      onClick={() => {
        if (labBerryClickKind(entitled) === "funnel") {
          onFunnel(id);
          return;
        }
        onPin(id);
      }}
      label={t(lab.labelKey)}
      hideTip={pinned}
      eyeOpen={eye}
      licenseLed={led}
      className={
        isLabsSharedModule(id)
          ? eye
            ? "border-violet-300/90 bg-violet-500/35 text-violet-50"
            : "border-violet-400/60 bg-violet-500/18 text-violet-100 hover:border-violet-300/80"
          : eye
            ? "border-emerald-400/80 bg-emerald-500/25 text-emerald-100"
            : "border-border/70 bg-card/90 text-muted-foreground hover:border-cyan-300/50"
      }
      tip={
        <>
          <div className="font-semibold text-foreground">{t(lab.labelKey)}</div>
          <div className="text-muted-foreground">
            {!labShowsOnDashboard(id) ? t("labs.prep") : eye ? t("labs.active") : t("labs.preview")}
          </div>
          <p className="mt-1 text-muted-foreground">{t(lab.hintKey)}</p>
        </>
      }
    >
      {(() => {
        const Icon = LAB_ICON[id];
        return <Icon className="h-3.5 w-3.5" />;
      })()}
    </Berry>
  );
}

export function LabsOverlay({
  open,
  onOpenChange,
  workspaceIds,
  profileCount,
  variant = "popover",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceIds: readonly string[];
  profileCount: number;
  variant?: "popover" | "page";
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { on: engines, toggle, pending } = useLabsEngines();
  const { focus, setFocus } = useEngineView();
  const meshEntitled = useEntitled("labs-szumma");
  const [, setLicTick] = useState(0);
  const lic = readLicense();
  const visibleEngines = licensedEngines(lic);
  const edges = labsTreeEdges(visibleEngines);
  const nodes = labsTreeNodes(visibleEngines);
  const treeRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: LABS_TREE_VIEW.w, h: LABS_TREE_VIEW.h });
  const [pinned, setPinned] = useState<DashboardLabId | null>(null);

  useEffect(() => {
    if (!open) setPinned(null);
  }, [open]);

  useEffect(() => {
    const sync = () => setLicTick((n) => n + 1);
    window.addEventListener(LICENSE_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(LICENSE_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useLayoutEffect(() => {
    const el = treeRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const goEngineView = (id: LabsEngineId) => {
    setFocus(id);
    onOpenChange(false);
    requestAnimationFrame(() => scrollEngineSection(id));
  };

  const ensureEngine = async (id: LabsEngineId) => {
    if (engines[id]) return;
    const result = await toggle(id);
    if (result.refused) {
      toast.message(t("labs.engineCoreToast"));
    }
  };

  const onEngine = async (id: LabsEngineId) => {
    if (!isEngineLicensed(id, lic)) {
      const href = engineFunnelHref(id);
      onOpenChange(false);
      if (href) goCart(href);
      return;
    }
    const label = t(ENGINE_LABEL_KEY[id]);
    if (!engines[id]) {
      const result = await toggle(id);
      if (result.refused) {
        toast.message(t("labs.engineCoreToast"));
        return;
      }
    }
    recordEngineClick(id);
    setFocus(applyExclusiveEngineEye(focus, id, lic));
    toast.message(t("labs.viewFocusToast", { name: label }));
  };

  const onFunnel = (id: DashboardLabId) => {
    const href = labModuleFunnelHref(id);
    onOpenChange(false);
    if (href) goCart(href);
  };

  const pinnedMeta = pinned ? LABS_TREE_MODULES.find((m) => m.id === pinned) : undefined;

  return (
        <TooltipProvider delayDuration={120}>
          <div
            className={cn(
              "relative flex flex-col gap-2 px-3 pb-3 pt-3",
              variant === "page" &&
                "rounded-2xl border border-cyan-400/35 bg-card/80 p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] sm:p-5",
            )}
          >
            <div className="flex items-center gap-2">
              <h2 className="flex shrink-0 items-center gap-1 text-sm font-semibold tracking-tight">
                {variant === "page" ? t("labs.doorTitle") : t("labs.overlayTitle")}
              </h2>
              <CapacityHudBar statusOnly workspaceIds={workspaceIds} profileCount={profileCount} />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">{t("labs.hudExplain")}</p>
            {variant === "page" ? (
              <p className="text-[12px] leading-snug text-muted-foreground">{t("labs.doorLead")}</p>
            ) : (
              <p className="sr-only">{t("labs.overlayLead")}</p>
            )}
            <LabsSalesFunnel />

            <div
              ref={treeRef}
              className="relative h-[min(80vw,22rem)] w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--accent-color)_18%,transparent),transparent_58%),linear-gradient(180deg,var(--card-bg),var(--app-bg))] sm:h-[min(42vh,22rem)]"
              data-labs-tree
            >
              {pinned && pinnedMeta ? (
                <LabsPinCard
                  id={pinned}
                  engineOn={engines[pinnedMeta.engine]}
                  enableEngine={() => ensureEngine(pinnedMeta.engine)}
                  onClose={() => setPinned(null)}
                  onJump={() => onOpenChange(false)}
                  onFunnel={onFunnel}
                />
              ) : null}

              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox={`0 0 ${LABS_TREE_VIEW.w} ${LABS_TREE_VIEW.h}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <pattern
                    id="labs-cap-hatch"
                    width="8"
                    height="8"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(32)"
                  >
                    <rect width="8" height="8" fill="rgba(129,140,248,0.16)" />
                    <path d="M0 8 L8 0" stroke="rgba(199,210,254,0.7)" strokeWidth="1.15" />
                    <path d="M-2 4 L4 -2" stroke="rgba(199,210,254,0.35)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <path d={labsCapPath()} fill="url(#labs-cap-hatch)" fillOpacity={0.6} stroke="none" />
                <path
                  d={labsClippedPath(LABS_STEM.from, LABS_STEM.to, nodes, box)}
                  fill="none"
                  stroke="rgba(165,180,252,0.72)"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
                {edges.map((e, i) => {
                  const d = labsClippedPath(e.from, e.to, nodes, box);
                  if (!d) return null;
                  return (
                    <path
                      key={i}
                      d={d}
                      fill="none"
                      stroke="rgba(52,211,153,0.38)"
                      strokeWidth={1.6}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              <Berry
                x={LABS_CORE.pos.x}
                y={LABS_CORE.pos.y}
                label={t("labs.coreLabel")}
                className="h-9 w-9 border-cyan-300/70 bg-cyan-500/20 text-cyan-50"
                disabled
                tip={
                  <>
                    <div className="font-semibold">{t("labs.coreLabel")}</div>
                    <p className="text-muted-foreground">{t("labs.coreHint")}</p>
                  </>
                }
              >
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
              </Berry>

              {LABS_ENGINES.filter((eng) => visibleEngines.includes(eng.id)).map((eng) => {
                const on = engines[eng.id];
                const label = t(ENGINE_LABEL_KEY[eng.id]);
                const Icon = ENGINE_ICON[eng.id];
                const focused = focus === eng.id;
                return (
                  <Berry
                    key={eng.id}
                    x={eng.pos.x}
                    y={eng.pos.y}
                    label={label}
                    disabled={pending}
                    onClick={() => void onEngine(eng.id)}
                    eyeOpen={engineEyeOpen(focus, eng.id, lic)}
                    licenseLed={engineLicenseLed(eng.id, lic)}
                    className={cn(on ? ENGINE_BERRY_ON : ENGINE_BERRY, focused && "ring-2 ring-emerald-300/45")}
                    tip={
                      <>
                        <div className="font-semibold">{label}</div>
                        <div className="text-muted-foreground">
                          {on ? t("labs.active") : t("labs.preview")}
                          {focused ? ` · ${t("labs.viewing")}` : ""}
                        </div>
                        <p className="mt-1 text-muted-foreground">{t("labs.engineViewHint")}</p>
                      </>
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </Berry>
                );
              })}

              {LABS_TREE_MODULES.filter(
                (m) => isLabsSharedModule(m.id) || visibleEngines.includes(m.engine),
              ).map((m) => (
                <LabBerry
                  key={m.id}
                  id={m.id}
                  x={m.pos.x}
                  y={m.pos.y}
                  pinned={pinned === m.id}
                  onPin={(id) => setPinned((cur) => (cur === id ? null : id))}
                  onFunnel={onFunnel}
                />
              ))}

              {visibleEngines.includes("resilience") ? (
              <Berry
                x={LABS_BCP_PRACTICE.pos.x}
                y={LABS_BCP_PRACTICE.pos.y}
                label={t("labs.bcpPractice")}
                disabled={pending}
                eyeOpen={engineEyeOpen(focus, "resilience", lic) && engines.resilience}
                licenseLed={engineLicenseLed("resilience", lic)}
                className={
                  engines.resilience
                    ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                    : "border-border/50 bg-card/70 text-muted-foreground hover:border-cyan-300/50"
                }
                onClick={() => {
                  if (engines.resilience) {
                    recordEngineClick("resilience");
                    goEngineView("resilience");
                    return;
                  }
                  void onEngine("resilience");
                }}
                tip={
                  <>
                    <div className="font-semibold">{t("labs.bcpPractice")}</div>
                    <p className="text-muted-foreground">{t("labs.bcpPracticeHint")}</p>
                  </>
                }
              >
                <ShieldAlert className="h-3.5 w-3.5" />
              </Berry>
              ) : null}

              {visibleEngines.includes("education") ? (
              <Berry
                x={LABS_EDUCATION_MODULES.pos.x}
                y={LABS_EDUCATION_MODULES.pos.y}
                label={t("labs.educationModules")}
                disabled={pending}
                eyeOpen={engineEyeOpen(focus, "education", lic) && engines.education}
                licenseLed={engineLicenseLed("education", lic)}
                className={cn(
                  engines.education
                    ? "border-emerald-400/70 bg-emerald-500/20 text-emerald-100"
                    : "border-border/50 bg-card/70 text-muted-foreground hover:border-cyan-300/50",
                )}
                onClick={() => {
                  if (engines.education) {
                    recordEngineClick("education");
                    goEngineView("education");
                    return;
                  }
                  void onEngine("education");
                }}
                tip={
                  <>
                    <div className="font-semibold">{t("labs.educationModules")}</div>
                    <p className="text-muted-foreground">{t("labs.educationModulesHint")}</p>
                  </>
                }
              >
                <BookOpen className="h-3.5 w-3.5" />
              </Berry>
              ) : null}

              <Berry
                x={LABS_MESH_DESK.pos.x}
                y={LABS_MESH_DESK.pos.y}
                label={t("labs.meshDesk")}
                eyeOpen={typeof window !== "undefined" && window.location.pathname.includes("/labs/desk")}
                licenseLed={labLicenseLed(meshEntitled)}
                className="border-violet-400/60 bg-violet-500/18 text-violet-100 hover:border-violet-300/80"
                onClick={() => {
                  onOpenChange(false);
                  void navigate({ to: "/labs/desk", search: keepLang });
                }}
                tip={
                  <>
                    <div className="font-semibold">{t("labs.meshDesk")}</div>
                    <p className="text-muted-foreground">{t("labs.meshDeskHint")}</p>
                  </>
                }
              >
                <Columns3 className="h-3.5 w-3.5" />
              </Berry>
            </div>
          </div>
        </TooltipProvider>
  );
}
