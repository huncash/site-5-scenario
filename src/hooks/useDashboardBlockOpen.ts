import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  dashboardBlockQueryKey,
  readDashboardBlockOpen,
  writeDashboardBlockOpen,
} from "@/lib/dashboardBlocks";
import { useMeshRepository } from "@/lib/mesh/meshRepository";

export function useDashboardBlockOpen(id: string, defaultOpen = true) {
  const repo = useMeshRepository();
  const qc = useQueryClient();
  const key = dashboardBlockQueryKey(id);

  const q = useQuery({
    queryKey: key,
    queryFn: () => readDashboardBlockOpen(repo, id, defaultOpen),
    staleTime: Infinity,
    placeholderData: defaultOpen,
  });

  const mut = useMutation({
    mutationFn: async (open: boolean) => {
      await writeDashboardBlockOpen(repo, id, open);
      return open;
    },
    onSuccess: (open) => {
      qc.setQueryData(key, open);
    },
  });

  const isOpen = q.data ?? defaultOpen;

  return {
    isOpen,
    toggle: () => mut.mutate(!isOpen),
    setOpen: (open: boolean) => mut.mutate(open),
  };
}
