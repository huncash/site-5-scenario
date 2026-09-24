import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

import { useFeatureComingSoon } from "@/components/FeatureComingSoon";
import { ProfileHeader } from "@/components/ProfileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decryptJSON } from "@/lib/crypto";
import { EMPTY_SETTINGS, type CustomSettings, type WorkspaceMeta } from "@/lib/finance";
import { getPdcaCycleCount, getPdcaCycleSum, getTopPdcaWorkspaces } from "@/lib/pdcaCycle";
import { localdb } from "@/lib/localdb";
import { useVault } from "@/lib/vault";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  validateSearch: (s: Record<string, unknown>) => ({
    profile: String(s.profile ?? ""),
  }),
});

function StatsPage() {
  const { state } = useVault();
  const { openComingSoon } = useFeatureComingSoon();
  const search = Route.useSearch();
  const unlocked = state.status === "unlocked" ? state : null;
  const profileId = unlocked?.profile.id ?? search.profile;
  const profileName = unlocked?.profile.name ?? "Profil";
  const vaultKey = unlocked?.key ?? null;

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
  const sum = useMemo(() => getPdcaCycleSum(workspaces), [workspaces]);
  const top = useMemo(() => getTopPdcaWorkspaces(workspaces, 10), [workspaces]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Betöltés…
      </div>
    );
  }
  if (!unlocked || !vaultKey) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <ProfileHeader profileId={profileId} profileName={profileName} showBack />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <RotateCw className="h-5 w-5 text-muted-foreground" />
              Aktivitás & Ciklus Statisztikák
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Vázlat: user aktivitás, elvégzett PDCA ciklusok és futási idő nyomon követése (offline).
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Globális ciklus szumma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold tabular-nums">#{sum}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Aktív munkaterek</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold tabular-nums">{workspaces.length || 1}</div>
              </CardContent>
            </Card>
            <Card
              role="button"
              tabIndex={0}
              className="cursor-pointer transition-all duration-200 hover:bg-muted/20"
              onClick={() =>
                openComingSoon({
                  title: "Futási idő & aktivitás-napló",
                  purpose:
                    "Offline session idő, aktív napok és PDCA fázisonkénti időráfordítás. Az aktivitás-gyűjtő és a riport nézet előkészítés alatt áll.",
                  featureId: "stats.runtime",
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openComingSoon({
                    title: "Futási idő & aktivitás-napló",
                    purpose:
                      "Offline session idő, aktív napok és PDCA fázisonkénti időráfordítás. Az aktivitás-gyűjtő és a riport nézet előkészítés alatt áll.",
                    featureId: "stats.runtime",
                  });
                }
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Futási idő</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">Előkészítés alatt — kattints a részletekért</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Workspace ciklusok</CardTitle>
            </CardHeader>
            <CardContent>
              {top.length === 0 ? (
                <div className="text-sm text-muted-foreground">Még nincs lezárt PDCA ciklus.</div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {top.map((w) => (
                    <li key={w.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="truncate">
                        {w.alias?.trim() || (w.id === "personal" ? "Magán" : w.id)}
                      </span>
                      <span className="font-mono text-slate-200">#{getPdcaCycleCount(w)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
