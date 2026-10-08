import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { activateAllLicenseEngines } from "@/lib/engineFrames";
import { incrementEngineInterest, noteEngineSwitch } from "@/lib/engineInterest";
import { labsEngineQueryKey, readEngineOn, toggleEngine, writeEngineOn } from "@/lib/labsEngines";
import { resolveEngineOn, type LabsEngineId } from "@/lib/labsTechTree";
import { useMeshRepository } from "@/lib/mesh/meshRepository";

export function useLabsEngines() {
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const key = labsEngineQueryKey();

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    activateAllLicenseEngines();
    void writeEngineOn(repo, { economic: true, resilience: true, education: true }).then((on) => {
      qc.setQueryData(key, on);
    });
  }, [repo, qc, key]);

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
