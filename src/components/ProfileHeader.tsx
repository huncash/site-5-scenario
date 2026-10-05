import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  Download,
  GraduationCap,
  Lock,
  Menu,
  Sparkles,
  QrCode,
  Search,
  Settings,
  Upload,
  Users,
  Wallet,
  Keyboard,
  Monitor,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { useFeatureComingSoon } from "@/components/FeatureComingSoon";
import { KnowledgeBaseModal } from "@/components/KnowledgeBaseModal";
import { PdcaSemiRotaryKnob } from "@/components/PdcaSemiRotaryKnob";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decryptJSON } from "@/lib/crypto";
import { EMPTY_SETTINGS, type CustomSettings, type WorkspaceMeta } from "@/lib/finance";
import { localdb } from "@/lib/localdb";
import { getPdcaCycleSum } from "@/lib/pdcaCycle";
import { useVault } from "@/lib/vault";
import { toast } from "sonner";
import { isDemoProfileName, writeScenarioDoorStep } from "@/lib/demoSession";
import { useOnboardingTour } from "@/components/onboarding/OnboardingTourProvider";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DesktopAppPanel } from "@/components/desktop/DesktopAppPanel";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export function ProfileHeader({
  profileId,
  profileName,
  profileHint,
  visitorDemo,
  onAddDevice,
  showBack,
  rightControls,
  bottomRow,
  situationLead,
  viewMode,
  onViewModeChange,
  pdcaMode,
  onPdcaModeChange,
  onRotatePdca,
}: {
  profileId: string;
  profileName: string;
  profileHint?: string;
  visitorDemo?: boolean;
  onAddDevice?: () => void;
  showBack?: boolean;
  rightControls?: ReactNode;
  bottomRow?: ReactNode;
  situationLead?: string;
  viewMode?: "split" | "full";
  onViewModeChange?: (v: "split" | "full") => void;
  pdcaMode?: "PD" | "DC" | "CA" | "AP";
  onPdcaModeChange?: (v: "PD" | "DC" | "CA" | "AP") => void;
  onRotatePdca?: () => void;
}) {
  const { lock, state } = useVault();
  const { t } = useI18n();
  const router = useRouter();
  const { openComingSoon } = useFeatureComingSoon();
  const { openTour, isOpen: tourOpen, stepId: tourStepId } = useOnboardingTour();
  const [kbOpen, setKbOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [omni, setOmni] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const unlocked = state.status === "unlocked" ? state : null;
  const vaultKey = unlocked?.key ?? null;
  const visitorShell = Boolean(visitorDemo) || isDemoProfileName(unlocked?.profile.name);
  const highlightShortcuts = tourOpen && tourStepId === "welcome-shortcuts";
  const highlightViewToggle = tourOpen && tourStepId === "pdca";
  const highlightMenu = tourOpen && (tourStepId === "security-close" || tourStepId === "demo");

  const settingsQ = useQuery({
    queryKey: ["settings"],
    enabled: Boolean(vaultKey),
    queryFn: async (): Promise<CustomSettings> => {
      if (!vaultKey) return EMPTY_SETTINGS;
      const row = await localdb.getSettings();
      if (!row) return EMPTY_SETTINGS;
      try {
        const s = await decryptJSON<Partial<CustomSettings>>(vaultKey, row.data_enc);
        return { ...EMPTY_SETTINGS, ...s, workspaces: s.workspaces ?? [] };
      } catch {
        return EMPTY_SETTINGS;
      }
    },
  });

  const workspaces = (settingsQ.data?.workspaces ?? []) as WorkspaceMeta[];
  const pdcaSum = useMemo(() => getPdcaCycleSum(workspaces), [workspaces]);

  const openOmniSearch = useCallback(() => {
    const q = omni.trim();
    openComingSoon({
      title: q ? `Globális keresés: „${q}"` : "Globális kereső (omnibox)",
      purpose:
        "Egységes keresés tételekre, célokra, munkaterekre és törzsadatokra. Az indexelő és a találati lista modulja előkészítés alatt áll.",
      featureId: "header.omnibox",
    });
  }, [omni, openComingSoon]);

  function ymdDash(d = new Date()) {
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function downloadText(filename: string, content: string) {
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const back = useCallback(() => {
    void router.navigate({ to: "/" });
  }, [router]);

  const leaveVisitorCase = useCallback(async () => {
    setProfileOpen(false);
    if (visitorShell) {
      // Köztes esetválasztó kivezetve: mindig a hierarchikus főoldalra.
      writeScenarioDoorStep("type");
      try {
        window.localStorage.setItem("szcenario_home_mode", "door");
        window.dispatchEvent(new Event("szcenario:home_mode"));
      } catch {
        /* ignore */
      }
    }
    await lock();
    if (visitorShell) await router.navigate({ to: "/" });
  }, [lock, router, visitorShell]);

  return (
    <header
      className="sticky top-0 z-50 shrink-0 border-b border-border text-foreground backdrop-blur-md"
      style={{ background: "var(--ws-canvas-bg, var(--app-bg))" }}
    >
      <div className={`w-full px-2 sm:px-3 md:px-4 ${showBack ? "py-2" : "pt-1.5 pb-0.5"}`}>
        <div className="grid w-full gap-2">
          {/* TOP ROW: left brand/profile (fills) | right controls (pinned to right edge) */}
          <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 sm:gap-3">
            <div className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-3 justify-self-start">
              <div className="flex min-w-0 items-center gap-2">
                {showBack ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-9 shrink-0 border-border bg-card/40 text-foreground hover:bg-accent"
                    onClick={back}
                    title={t("chrome.backDashboard")}
                    aria-label={t("chrome.backDashboard")}
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    {t("chrome.back")}
                  </Button>
                ) : (
                <Link
                  to="/"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary transition-all duration-200 hover:bg-primary/25"
                  aria-label={t("chrome.home")}
                  title={t("chrome.home")}
                >
                  <Wallet className="h-5 w-5" />
                </Link>
                )}
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-sm font-semibold tracking-tight text-foreground">{t("brand.name")}</div>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="truncate text-xs text-muted-foreground" title={profileHint ?? profileName}>
                      {profileName}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: pinned controls */}
            <div className="flex min-w-0 items-center justify-end gap-2 justify-self-end">
              {rightControls}
              {vaultKey ? (
                <Popover
                  open={profileOpen}
                  onOpenChange={(o) => {
                    setProfileOpen(o);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card/40 px-2 text-[11px] font-mono tabular-nums text-foreground hover:bg-accent"
                      onClick={() => {
                        setProfileOpen((v) => !v);
                      }}
                      aria-label={t("chrome.pdcaCycles", { n: String(pdcaSum) })}
                      title={t("chrome.profilePanel")}
                    >
                      <span className="text-muted-foreground leading-none">PDCA</span>
                      <span className="leading-none">#{pdcaSum}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-72 border border-border bg-popover text-popover-foreground"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{profileName}</div>
                          {visitorShell ? (
                            <div className="mt-0.5 text-[11px] text-muted-foreground">{t("chrome.visitorDemo")}</div>
                          ) : (
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {t("chrome.profileId")} <span className="font-mono">{profileId}</span>
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 rounded-md border border-border bg-card/50 px-2 py-1 text-[10px] font-mono tabular-nums text-foreground">
                          PDCA #{pdcaSum}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 border-border bg-card/30 text-foreground hover:bg-accent"
                        >
                          <Link to="/stats" search={{ profile: profileId }}>
                            {t("chrome.activityShort")}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 border-border bg-card/30 text-foreground hover:bg-accent"
                        >
                          <Link to="/settings" search={{ profile: profileId, tab: undefined, focus: undefined }}>
                            {t("chrome.settings")}
                          </Link>
                        </Button>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 w-full justify-center border border-border bg-card/30 text-foreground hover:bg-accent"
                        onClick={() => {
                          void leaveVisitorCase();
                        }}
                        title={visitorShell ? t("chrome.otherCaseTitle") : t("chrome.lockTitle")}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        {visitorShell ? t("chrome.otherCase") : t("chrome.lock")}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : null}

              <ViewSettingsMenu
                showSplit
                viewMode={viewMode ?? "split"}
                onViewModeChange={onViewModeChange}
                highlightSplit={highlightViewToggle}
              />

              {/* Keyboard shortcuts — left of the main menu */}
              <button
                type="button"
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card/40 text-foreground hover:bg-accent",
                  highlightShortcuts
                    ? "border-cyan-300/70 shadow-[0_0_0_3px_rgba(34,211,238,0.22)] ring-2 ring-cyan-300/60 animate-pulse"
                    : "",
                )}
                aria-label={t("chrome.shortcuts")}
                title={t("chrome.shortcuts")}
                data-tour-anchor="shortcuts"
                onClick={() => setShortcutsOpen(true)}
              >
                <Keyboard className="h-4 w-4" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    data-tour-anchor="app-menu"
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card/40 hover:bg-accent",
                      highlightMenu
                        ? "border-cyan-300/70 shadow-[0_0_0_3px_rgba(34,211,238,0.22)] ring-2 ring-cyan-300/60 animate-pulse"
                        : "",
                    )}
                    aria-label={t("chrome.menu")}
                    title={t("chrome.menu")}
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-56 border border-border bg-popover text-popover-foreground"
                >
                  {visitorShell ? null : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/devices" search={{ profile: profileId }}>
                          <Users className="mr-2 h-4 w-4" />
                          {t("chrome.devices")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/logs" search={{ profile: profileId }}>
                          <CalendarClock className="mr-2 h-4 w-4" />
                          {t("chrome.log")}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/stats" search={{ profile: profileId }}>
                      <CalendarClock className="mr-2 h-4 w-4" />
                      {t("chrome.activity")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setKbOpen(true);
                    }}
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {t("chrome.knowledge")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      openTour();
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("chrome.tour")}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/references"
                      search={{
                        profile: profileId,
                        workspace: "personal",
                        tab: "partners",
                        highlight: undefined,
                        isSzumma: false,
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("chrome.master")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" search={{ profile: profileId, tab: undefined, focus: undefined }}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t("chrome.settings")}
                    </Link>
                  </DropdownMenuItem>
                  {visitorShell ? null : (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          void (async () => {
                            try {
                              const wsId =
                                typeof sessionStorage !== "undefined"
                                  ? sessionStorage.getItem("ui:activeWorkspaceId") || "personal"
                                  : "personal";
                              const wsName =
                                typeof sessionStorage !== "undefined"
                                  ? sessionStorage.getItem("ui:activeWorkspaceName") || wsId
                                  : wsId;
                              const scope = wsId === "ALL" ? "ALL" : wsId;
                              const txt = await localdb.exportEncryptedData({ scope });
                              const fn =
                                scope === "ALL"
                                  ? `mesh_backup_full_${ymdDash()}.json`
                                  : `mesh_backup_${String(wsName).replaceAll(" ", "_")}_${ymdDash()}.json`;
                              downloadText(fn, txt);
                              toast.success(t("chrome.quickSaved"));
                            } catch (e: any) {
                              toast.error(e?.message || t("chrome.quickSaveFail"));
                            }
                          })();
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t("chrome.quickSave")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          void router.navigate({
                            to: "/settings",
                            search: { profile: profileId, tab: undefined, focus: undefined },
                            hash: "backup-restore" as any,
                          });
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t("chrome.loadBackup")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => {
                          if (onAddDevice) {
                            onAddDevice();
                            return;
                          }
                          void router.navigate({ to: "/connect" });
                        }}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        {t("chrome.addDevice")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setDesktopOpen(true)}>
                        <Monitor className="mr-2 h-4 w-4" />
                        {t("chrome.desktopApp")}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      void leaveVisitorCase();
                    }}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {visitorShell ? t("chrome.otherCase") : t("chrome.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/*
            RULE: the PDCA dial pivot (SVG centerline) sits on the viewport
            horizontal midpoint in every view. Equal 1fr | auto | 1fr on a
            full-width row; do not shift the middle column.
            Subpages (showBack) drop this case chrome — no dial, search, or CT.
          */}
          {showBack ? null : (
          <div
            data-tour-anchor="header"
            data-pdca-dial-viewport-center
            className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2"
          >
            {situationLead ? (
              <div
                data-tour-anchor="situation"
                className={cn(
                  "min-w-0 w-full rounded-xl border border-border/50 bg-card/30 px-2.5 py-1.5",
                  tourOpen && (tourStepId === "demo" || tourStepId === "anatomy")
                    ? "border-cyan-300/70 shadow-[0_0_0_3px_rgba(34,211,238,0.22)] ring-2 ring-cyan-300/60"
                    : "",
                )}
              >
                <p className="text-xs leading-snug text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-foreground">
                    {t("chrome.situation")}{" "}
                  </span>
                  {situationLead}
                </p>
              </div>
            ) : (
              <div className="min-w-0" />
            )}

            <div data-tour-anchor="pdca-dial" className="pointer-events-none select-none bg-transparent">
              <PdcaSemiRotaryKnob mode={pdcaMode ?? "PD"} onModeChange={() => {}} />
            </div>

            <div className="flex min-w-0 w-full flex-col items-stretch justify-end gap-1">
              <button
                type="button"
                className="inline-flex h-8 w-auto max-w-full shrink-0 self-start items-center justify-center whitespace-nowrap rounded-md border border-border bg-card/40 px-2 text-xs text-foreground transition-colors hover:bg-accent sm:px-3"
                onClick={() => {
                  if (onRotatePdca) {
                    onRotatePdca();
                    return;
                  }
                  openComingSoon({
                    title: "PDCA váltótárcsa forgatás",
                    purpose:
                      "Negyedfordulatos PDCA módváltás a tárcsával. Ezen az oldalon a tárcsa vezérlő nincs bekötve — nyisd meg a fő PDCA nézetet.",
                    featureId: "header.pdca_rotate",
                  });
                }}
                aria-label={t("pdca.rotate")}
                title={t("pdca.rotate")}
              >
                <span className="truncate">👈 {t("pdca.rotate")}</span>
              </button>
              <div className="flex h-9 min-w-0 w-full items-center overflow-hidden rounded-lg border border-border bg-card/40 px-3 focus-within:border-ring">
                <Input
                  value={omni}
                  onChange={(e) => setOmni(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      openOmniSearch();
                    }
                  }}
                  placeholder={t("chrome.search")}
                  className="h-8 min-w-0 flex-1 border-none bg-transparent px-0 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground transition-colors hover:text-foreground"
                  title={t("chrome.searchBtn")}
                  aria-label={t("chrome.searchBtn")}
                  onClick={openOmniSearch}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        {bottomRow ? (
          <div
            data-tour-anchor="workspaces"
            className="mt-1 -mx-2 px-2 pt-1 sm:-mx-3 sm:px-3 md:-mx-4 md:px-4"
            style={{ background: "var(--ws-canvas-bg, var(--app-bg))" }}
          >
            {bottomRow}
          </div>
        ) : null}

        <KnowledgeBaseModal open={kbOpen} onOpenChange={setKbOpen} />

        <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
          <DialogContent className="max-w-xl border-border bg-card text-foreground shadow-2xl">
            <div className="space-y-3">
              <div className="pr-8">
                <DialogTitle className="text-lg font-semibold text-foreground">{t("chrome.shortcuts")}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  Navigáció és fókuszváltás desktopon. Ha épp beviteli mezőben gépelsz, a navigációs gyorsbillentyűk nem futnak.
                </DialogDescription>
              </div>

              <div className="grid gap-2 text-[13px] text-foreground sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Mentés</div>
                  <div className="mt-1 font-mono">Ctrl/Cmd + S</div>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lean kereső</div>
                  <div className="mt-1 font-mono">Ctrl/Cmd + K</div>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Szumma</div>
                  <div className="mt-1 font-mono">Alt + Shift + End</div>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alsó fülek</div>
                  <div className="mt-1 font-mono">Alt + Shift + ← / →</div>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Munkaterek</div>
                  <div className="mt-1 font-mono">PageUp / PageDown</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Fallback: Alt+Shift+PageUp/PageDown, Ctrl+Alt+←/→</div>
                </div>
                <div className="rounded-xl border border-border bg-card/40 p-3 sm:col-span-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t("chrome.pdcaQuarter")}</div>
                  <div className="mt-1 font-mono">↓</div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Fallback: Alt + Shift + ↓</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={desktopOpen} onOpenChange={setDesktopOpen}>
          <DialogContent className="max-w-3xl border-border bg-card text-foreground shadow-2xl">
            <DialogTitle className="text-lg font-semibold text-foreground">{t("chrome.desktopApp")}</DialogTitle>
            <DialogDescription className="sr-only">{t("desktop.lead")}</DialogDescription>
            <DesktopAppPanel compact />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
