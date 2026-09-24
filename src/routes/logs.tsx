import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { ProfileHeader } from "@/components/ProfileHeader";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { useVault } from "@/lib/vault";
import type { MeshLogEntry } from "@/lib/mesh/log";

export const Route = createFileRoute("/logs")({
  validateSearch: z.object({
    profile: z.string().min(1),
  }),
  component: LogsPage,
});

function LogsPage() {
  const { state } = useVault();
  const { profile } = Route.useSearch();
  const repo = useMeshRepository();

  const active =
    state.status === "unlocked"
      ? { id: state.profile.id, name: state.profile.name }
      : null;
  const profileId = active?.id ?? profile;
  const profileName = active?.name ?? "Profil";

  const q = useQuery({
    queryKey: ["mesh", "logs", profileId],
    queryFn: async () => {
      const rows = (await repo.getAll("logs")) as MeshLogEntry[];
      return rows
        .filter((r) => r.profileId === profileId)
        .sort((a, b) => (a.at < b.at ? 1 : -1));
    },
    initialData: [],
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <ProfileHeader profileId={profileId} profileName={profileName} showBack />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-4 px-6 py-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Napló</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Egyszerű eseménynapló a helyi műveletekről és a szinkronról.
            </p>
          </div>

          <ul className="space-y-2">
            {(q.data ?? []).map((r) => (
              <li key={r.id} className="rounded border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">
                    {r.op} · {r.store}
                    {r.key ? <span className="ml-2 font-mono text-xs">{r.key}</span> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(r.at).toLocaleString("hu-HU")}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  eszköz: <span className="font-mono">{r.deviceId}</span>
                  {r.message ? <span className="ml-2">· {r.message}</span> : null}
                </div>
              </li>
            ))}
            {(q.data ?? []).length === 0 && (
              <li className="rounded border border-dashed p-3 text-sm text-muted-foreground">
                Nincs naplóbejegyzés.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

