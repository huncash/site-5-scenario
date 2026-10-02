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
import { DEMO_PASSWORD, DEMO_SEGMENTS, type DemoSegmentId } from "@/lib/demoSeed";
import {
  LAST_PROFILE_KEY,
  dedupeAllDemoProfiles,
  ensureDemoPackProfilesExist,
  enterDemoSegment,
} from "@/lib/demoSession";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { state, unlockById, lock, beginCreate, backToPicker, createProfile } = useVault();

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
      setError(err?.message || "Demo belépési hiba.");
    } finally {
      setBusy(false);
      demoInFlightRef.current = false;
    }
  };

  // Optional: one-click autologin via /login?demo=1..7 or /login?demo=demo1_multisite_operator
  useEffect(() => {
    if (typeof window === "undefined") return;
    const demo = new URLSearchParams(window.location.search).get("demo");
    if (!demo) return;
    // Avoid autologin when already unlocked
    if (state.status === "unlocked") return;
    const byNum =
      demo === "1"
        ? ("demo1_multisite_operator" as const)
        : demo === "2"
          ? ("demo2_premium_nightlife" as const)
          : demo === "3"
            ? ("demo3_specialty_cafe_tea" as const)
            : demo === "4"
              ? ("demo4_fine_dining_bistro" as const)
              : demo === "5"
                ? ("demo5_pastry_gelato" as const)
                : demo === "6"
                  ? ("demo6_event_catering_popup" as const)
                : demo === "7"
                  ? ("demo7_personal_pocket_seasonal_pilot" as const)
                  : null;
    const segId = (byNum ?? (demo as DemoSegmentId)) as DemoSegmentId;
    if (!DEMO_SEGMENTS.some((s) => s.id === segId)) return;
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
        setError("Nincs elérhető profil az eszközön. Hozz létre újat vagy importálj QR kóddal.");
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
        setError("Hibás mesterjelszó. Kérjük, próbáld újra.");
      }
    } catch (err: any) {
      setError(err?.message || "Hiba történt a feloldás során.");
    } finally {
      setBusy(false);
    }
  };

  const isAlreadyUnlocked = state.status === "unlocked";
  const hasProfiles = profiles.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-between text-[12px]">
          <Link to="/" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            ← Főoldal
          </Link>
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
                  Eszköz állapota
                </span>
                {hasProfiles ? (
                  <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-[10px] text-emerald-500 border-emerald-500/30">
                    <UserCheck className="h-3 w-3" />
                    Ismert eszköz ({profiles.length} profil)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 bg-amber-500/10 text-[10px] text-amber-500 border-amber-500/30">
                    Ismeretlen / Törölt cache
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasProfiles
                  ? "Helyi titkosított profilok elérhetők ezen a készüléken"
                  : "Nincs mentett profil vagy kiürült a helyi tároló"}
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
              Profil megnyitása
            </h1>
            <p className="text-sm text-muted-foreground">
              Add meg a mesterjelszót a helyi profil megnyitásához (az eseteid ezen az eszközön vannak).
            </p>
          </div>

          {/* Active session banner if unlocked */}
          {isAlreadyUnlocked && (
            <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center justify-between">
              <div className="text-xs">
                <p className="font-semibold text-emerald-400">
                  Aktív belépés: {state.profile.name}
                </p>
                <p className="text-muted-foreground">A profil jelenleg meg van nyitva.</p>
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
                  Vezérlőpult
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
                  Profil kiválasztása
                </Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger id="profile-select" className="w-full">
                    <SelectValue placeholder="Válassz profilt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
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
                Mesterjelszó {selectedProfile ? `— ${selectedProfile.name}` : ""}
              </Label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="login-pw"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Add meg a mesterjelszót..."
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
                  Megnyitás...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Megnyitás
                </>
              )}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 border-t border-border/60 pt-5 space-y-3">
            <p className="text-center text-[11px] uppercase tracking-wide text-muted-foreground">
              Egyéb lehetőségek
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => void beginCreate()}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Új profil
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={() => setImportOpen(true)}
              >
                <QrCode className="h-3.5 w-3.5" />
                QR Import
              </Button>
            </div>

            <div className="mt-2">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-foreground">
                      Demó indító — 7 gazdasági eset
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      1 kattintás: létrehoz / felold + feltölt 3 év “Vállalkozás1” adatot + “Projekt1” modellt. Jelszó:{" "}
                      <span className="font-mono">{DEMO_PASSWORD}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Demó</Badge>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {DEMO_SEGMENTS.map((s) => (
                    <Button
                      key={s.id}
                      variant="secondary"
                      size="sm"
                      className="w-full justify-start gap-2 text-xs"
                      disabled={busy}
                      onClick={() => void handleDemoLogin(s.id)}
                      title={s.blurb}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span className="font-medium">{s.title}</span>
                    </Button>
                  ))}
                </div>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  Tipp: autologin pl. <span className="font-mono">/login?demo=7</span> vagy{" "}
                  <span className="font-mono">/login?demo=demo7_personal_pocket_seasonal_pilot</span>.
                </p>

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
  );
}
