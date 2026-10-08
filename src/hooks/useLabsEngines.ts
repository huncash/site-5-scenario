import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { isDemoProfileName } from "@/lib/demoSession";
import { activateAllLicenseEngines } from "@/lib/engineFrames";
import { incrementEngineInterest, noteEngineSwitch } from "@/lib/engineInterest";
import {
  activateDemoCaseEngines,
  ALL_ENGINES_ON,
  labsEngineQueryKey,
  readEngineOn,
  toggleEngine,
  writeEngineOn,
} from "@/lib/labsEngines";
import { resolveEngineOn, type LabsEngineId } from "@/lib/labsTechTree";
import { useMeshRepository } from "@/lib/mesh/meshRepository";
import { useVault } from "@/lib/vault";

export function useLabsEngines() {
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const key = labsEngineQueryKey();
  const { state } = useVault();
  const demo = state.status === "unlocked" && isDemoProfileName(state.profile.name);

  useEffect(() => {
    if (demo) {
      void activateDemoCaseEngines(repo).then((on) => qc.setQueryData(key, on));
      return;
    }
    if (!import.meta.env.DEV) return;
    activateAllLicenseEngines();
    void writeEngineOn(repo, ALL_ENGINES_ON).then((on) => {
      qc.setQueryData(key, on);
    });
  }, [demo, repo, qc, key]);

  const q = useQuery({
    queryKey: key,
    queryFn: () => readEngineOn(repo),
    staleTime: Infinity,
    placeholderData: resolveEngineOn(),
  });

  const mut = useMutation({
    mutationFn: async (id: LabsEngineId) => {
      const result = await toggleEngine(repo, id);
      if (result.switched) await noteEngineSwitch(repo, id);
      else await incrementEngineInterest(repo, id, "click");
      return result;
    },
    onSuccess: (result) => {
      qc.setQueryData(key, result.on);
    },
  });

  const on = q.data ?? resolveEngineOn();

  return {
    on,
    toggle: (id: LabsEngineId) => mut.mutateAsync(id),
    pending: mut.isPending,
  };
}
