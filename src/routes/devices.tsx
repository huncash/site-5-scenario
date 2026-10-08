import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { ViewerInvitePanel } from "@/components/access/ViewerInvitePanel";
import { AccessModeBanner } from "@/components/access/AccessModeBanner";
import { ProfileHeader } from "@/components/ProfileHeader";
import { useMeshRepository, getMeshDeviceId } from "@/lib/mesh/meshRepository";
import { useVault } from "@/lib/vault";
import type { MeshDevice } from "@/lib/mesh/device";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/devices")({
  validateSearch: z
    .object({
      profile: z.string().min(1),
      lang: z.enum(["hu", "en"]).optional(),
    })
    .passthrough(),
  component: DevicesPage,
});

function DevicesPage() {
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
    queryKey: ["mesh", "devices", profileId],
    queryFn: async () => {
      const rows = await repo.getAll("devices");
      return (rows as MeshDevice[]).filter((d) => d.profileId === profileId);
    },
    initialData: [],
  });

  const devices = useMemo(
    () => (q.data ?? []).slice().sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1)),
    [q.data],
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasDraft, setAliasDraft] = useState<string>("");

  const startEdit = (d: MeshDevice) => {
    setEditingId(d.id);
    setAliasDraft((d.alias ?? "").trim());
  };
  const cancelEdit = () => {
    setEditingId(null);
    setAliasDraft("");
  };
  const saveAlias = async (d: MeshDevice) => {
    const trimmed = aliasDraft.trim();
    await repo.save("devices", {
      ...d,
      alias: trimmed ? trimmed : null,
      lastSeenAt: new Date().toISOString(),
    } as MeshDevice);
    cancelEdit();
    void q.refetch();
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      <ProfileHeader profileId={profileId} profileName={profileName} showBack />
      <AccessModeBanner />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Eszközeim</h1>
            <p className="mt-1 text-xs text-muted-foreground">Ezen a profilon ismert eszközök.</p>
          </div>

          <ViewerInvitePanel />

          <div className="rounded border p-3 text-xs text-muted-foreground">
            Saját eszköz azonosító: <span className="font-mono">{getMeshDeviceId()}</span>
          </div>

          <ul className="space-y-2">
            {devices.map((d) => (
              <li key={d.id} className="rounded border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {(d.alias && d.alias.trim()) || d.name}
                      {d.alias && d.alias.trim() ? (
                        <span className="ml-2 text-[10px] font-normal text-muted-foreground">(alias)</span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      <span className="font-mono">{d.deviceId}</span> · utoljára:{" "}
                      {new Date(d.lastSeenAt).toLocaleString("hu-HU")}
                    </div>
                  </div>
                  {editingId === d.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={aliasDraft}
                        onChange={(e) => setAliasDraft(e.target.value)}
                        placeholder="Egyedi név (alias)"
                        className="h-8 w-56"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => void saveAlias(d)}
                        aria-label="Alias mentése"
                        title="Alias mentése"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEdit}
                        aria-label="Mégse"
                        title="Mégse"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(d)}
                      aria-label="Eszköz átnevezése"
                      title="Eszköz átnevezése"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
            {(q.data ?? []).length === 0 && (
              <li className="rounded border border-dashed p-3 text-sm text-muted-foreground">
                Nincs eszköz adat.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}

