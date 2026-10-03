import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { useVault } from "@/lib/vault";
import { Profile, localdb } from "@/lib/localdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  KeyRound,
  Smartphone,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  QrCode,
  LogOut,
  ArrowRight,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { ImportQrDialog } from "@/components/ProfileTransfer";
import { ViewSettingsMenu } from "@/components/ViewSettingsMenu";
import { caseBlurb, caseTitle, useI18n, type MessageKey } from "@/i18n";
import {
  demoSerialFromId,
  groupPublicDemoSegments,
  type DemoCatalogIndustry,
  type DemoCatalogKind,
} from "@/lib/coreCases";
import { DEMO_PASSWORD, isDemoSegmentId, type DemoSegmentId } from "@/lib/demoCatalog";
import { cn } from "@/lib/utils";
import {
  LAST_PROFILE_KEY,
  dedupeAllDemoProfiles,
  ensureDemoPackProfilesExist,
  enterDemoSegment,
} from "@/lib/demoSession";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const DEMO_KIND_TITLE: Record<DemoCatalogKind, MessageKey> = {
  economic: "login.demoKindEconomic",
  resilience: "login.demoKindResilience",
  education: "login.demoKindEducation",
  inner: "login.demoKindInner",
};

const DEMO_INDUSTRY_TITLE: Record<DemoCatalogIndustry, MessageKey> = {
  hospitality: "login.demoIndHospitality",
  healthcare: "login.demoIndHealthcare",
  manufacturing: "login.demoIndManufacturing",
  logistics: "login.demoIndLogistics",
  strategy: "login.demoIndStrategy",
  education: "login.demoIndEducation",
  firmBcp: "login.demoIndFirmBcp",
  community: "login.demoIndCommunity",
  household: "login.demoIndHousehold",
  demography: "login.demoIndDemography",
  personal: "login.demoIndPersonal",
};

const DEMO_KIND_ACCENT: Record<DemoCatalogKind, string> = {
  economic: "border-l-sky-400/70",
  resilience: "border-l-rose-400/70",
  education: "border-l-emerald-400/70",
  inner: "border-l-slate-400/70",
};

function LoginPage() {
  const navigate = useNavigate();
  const { state, unlockById, lock, beginCreate, backToPicker, createProfile } = useVault();
  const { t, locale } = useI18n();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const demoInFlightRef = useRef(false);
  const demoDedupeOnMountRef = useRef(false);

  // Always keep profiles loaded from IndexedDB directly to be resilient against vault state mismatches or cache wipes
  const reloadProfiles = async () => {
    try {
      const list = await localdb.listProfiles();
      setProfiles(list);
    } catch {
      setProfiles([]);
    }
  };

  useEffect(() => {
    // Poka‑yoke: clean demo duplicates before rendering the picker dropdown.
    if (demoDedupeOnMountRef.current) return;
    demoDedupeOnMountRef.current = true;
    void (async () => {
      try {
        await dedupeAllDemoProfiles();
        // Ensure the 6-pack is always present (create missing demo shells without unlocking).
        await ensureDemoPackProfilesExist();
        // Just in case creation happened in a race: collapse again.
        await dedupeAllDemoProfiles();
      } finally {
        await reloadProfiles();
      }
    })();
  }, [state]);

  const handleDemoLogin = async (segmentId: DemoSegmentId) => {
    if (demoInFlightRef.current) return;
    demoInFlightRef.current = true;
    setBusy(true);
    setError(null);
    try {
      await enterDemoSegment(segmentId, { unlockById, createProfile });
      try {
        window.localStorage.setItem("szcenario_home_mode", "dashboard");
        window.localStorage.setItem("szcenario_onboarding_pending", "1");
        window.dispatchEvent(new Event("szcenario:home_mode"));
      } catch {
        // ignore
      }
      await navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message || t("login.demoFail"));
    } finally {
      setBusy(false);
      demoInFlightRef.current = false;
    }
  };

  // Optional: one-click autologin via /login?demo=1..18 or /login?demo=demo1_multisite_operator
  useEffect(() => {
    if (typeof window === "undefined") return;
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (!demo) return;
    if (state.status === "unlocked") return;
    const n = Number(demo);
    const byNum =
      Number.isInteger(n) && n >= 1 && n <= 18
        ? (groupPublicDemoSegments()
            .flatMap((g) => g.industries.flatMap((b) => b.segments))
            .find((s) => demoSerialFromId(s.id) === n)?.id ?? null)
        : null;
    const segId = (byNum ?? demo) as DemoSegmentId;
    if (!isDemoSegmentId(segId)) return;
    void handleDemoLogin(segId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const initialId = useMemo(() => {
    if (state.status === "locked" || state.status === "unlocked") {
      return state.profile.id;
    }
    if (profiles.length === 0) return "";
    const last = typeof window !== "undefined" ? localStorage.getItem(LAST_PROFILE_KEY) : null;
    if (last && profiles.some((p) => p.id === last)) return last;
    return profiles[0].id;
  }, [state, profiles]);

  useEffect(() => {
    if (initialId && !selectedId) {
      setSelectedId(initialId);
    }
  }, [initialId, selectedId]);

  const selectedProfile = useMemo(() => {
    return profiles.find((p) => p.id === selectedId) || (state.status === "unlocked" || state.status === "locked" ? state.profile : null);
  }, [profiles, selectedId, state]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pw) return;

    setBusy(true);
    setError(null);

    try {
      let targetId = selectedId;
      if (!targetId && profiles.length > 0) {
        targetId = profiles[0].id;
      }

      if (!targetId) {
        setError(t("login.noProfile"));
        setBusy(false);
        return;
      }

      const ok = await unlockById(targetId, pw);
      if (ok) {
        localStorage.setItem(LAST_PROFILE_KEY, targetId);
        try {
          localStorage.setItem("szcenario_home_mode", "dashboard");
          window.dispatchEvent(new Event("szcenario:home_mode"));
        } catch {
          // ignore
        }
        void navigate({ to: "/" });
      } else {
        setError(t("login.badPassword"));
      }
    } catch (err: any) {
      setError(err?.message || t("login.unlockFail"));
    } finally {
      setBusy(false);
    }
  };

  const isAlreadyUnlocked = state.status === "unlocked";
  const hasProfiles = profiles.length > 0;

  return (
    <div className="door-page flex h-dvh flex-col overflow-x-hidden overflow-y-auto bg-background">
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between text-[12px]">
          <Link to="/" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            {t("login.home")}
          </Link>
          <ViewSettingsMenu />
        </div>
        {/* Device Status Header */}
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("login.deviceStatus")}
                </span>
                {hasProfiles ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-[10px] text-emerald-500 border-emerald-500/30">
                    <UserCheck className="h-3 w-3" />
                    {t("login.knownDevice", { count: profiles.length })}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-500/10 text-[10px] text-amber-500 border-amber-500/30">
                    {t("login.unknownDevice")}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasProfiles ? t("login.profilesOk") : t("login.noProfiles")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            {isAlreadyUnlocked ? (
              <Unlock className="h-7 w-7 text-emerald-400" />
            ) : (
              <ShieldCheck className="h-7 w-7" />
            )}
          </div>

          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("login.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("login.lead")}
            </p>
          </div>

          {/* Active session banner if unlocked */}
          {isAlreadyUnlocked && (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-emerald-400">
                  {t("login.active", { name: state.profile.name })}
                </p>
                <p className="text-muted-foreground">{t("login.openNow")}</p>
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    try {
                      localStorage.setItem("szcenario_home_mode", "dashboard");
                      window.dispatchEvent(new Event("szcenario:home_mode"));
                    } catch {
                      // ignore
                    }
                    void navigate({ to: "/" });
                  }}
                >
                  {t("login.dashboard")}
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => void lock()}>
                  <LogOut className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* ALWAYS VISIBLE LOGIN FORM */}
          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            {hasProfiles && (
              <div className="space-y-2">
                <Label htmlFor="profile-select" className="text-xs font-medium">
                  {t("login.pickProfile")}
                </Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger id="profile-select" className="w-full">
                    <SelectValue placeholder={t("login.pickPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {[...profiles]
                      .sort((a, b) => {
                        const na = Number(String(a.name).match(/^DEMO\s+(\d+)/i)?.[1] ?? 999);
                        const nb = Number(String(b.name).match(/^DEMO\s+(\d+)/i)?.[1] ?? 999);
                        return na - nb || String(a.name).localeCompare(String(b.name));
                      })
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="login-pw" className="text-xs font-medium">
                {t("login.password")} {selectedProfile ? `— ${selectedProfile.name}` : ""}
              </Label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="login-pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t("login.passwordPlaceholder")}
                  className="pl-9 pr-10"
                  value={pw}
                  onChange={(e) => {
                    setPw(e.target.value);
                    if (error) setError(null);
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs font-medium text-destructive animate-in fade-in-50">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gap-2 font-medium"
              disabled={busy || !pw}
            >
              {busy ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t("chrome.unlocking")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {t("chrome.unlock")}
                </>
              )}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 border-t border-border/60 pt-5 space-y-3">
            <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
              {t("login.other")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => void beginCreate()}
              >
                <UserPlus className="h-3.5 w-3.5" />
                {t("login.newProfile")}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => setImportOpen(true)}
              >
                <QrCode className="h-3.5 w-3.5" />
                {t("login.qrImport")}
              </Button>
            </div>

            <div className="mt-2">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-foreground">
                      {t("login.demoTitle")}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t("login.demoBody", { password: DEMO_PASSWORD })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{t("login.demoBadge")}</Badge>
                </div>

                <div className="mt-3 space-y-4">
                  {groupPublicDemoSegments().map((group) => (
                    <div
                      key={group.kind}
                      className={cn(
                        "space-y-2 rounded-lg border border-border/50 bg-background/40 py-2.5 pl-3 pr-2 border-l-4",
                        DEMO_KIND_ACCENT[group.kind],
                      )}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {t(DEMO_KIND_TITLE[group.kind])}
                      </p>
                      <div className="space-y-3">
                        {group.industries.map((bucket) => (
                          <div key={bucket.industry} className="space-y-1.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium text-foreground/90"
                            >
                              {t(DEMO_INDUSTRY_TITLE[bucket.industry])}
                            </Badge>
                            <div className="grid grid-cols-1 gap-1.5">
                              {bucket.segments.map((s) => (
                                <Button
                                  key={s.id}
                                  variant="secondary"
                                  size="sm"
                                  className="w-full justify-start gap-2 text-xs"
                                  disabled={busy}
                                  onClick={() => void handleDemoLogin(s.id)}
                                  title={caseBlurb(s.id, locale) ?? s.blurb}
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                  <span className="font-medium text-left">
                                    {caseTitle(s.id, locale) ?? s.title}
                                  </span>
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">{t("login.demoTip")}</p>

                {/* DEMO reset moved to Settings → Danger Zone */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImportQrDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImported={(id: string) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_PROFILE_KEY, id);
          }
          void reloadProfiles();
          void backToPicker();
        }}
      />
    </div>
      <div data-site-footer-host />
    </div>
  );
}

