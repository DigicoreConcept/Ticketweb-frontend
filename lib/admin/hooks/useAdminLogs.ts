import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export function useTransactions(params: any) {
  return useQuery({
    queryKey: ["admin", "transactions", params],
    queryFn: () => adminApi.getTransactions(params),
    staleTime: 30_000,
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminApi.getSettings(),
    staleTime: 60_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => adminApi.updateSettings(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

export function useAuditLogs(params: any) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => adminApi.getAuditLog(params),
    staleTime: 30_000,
  });
}
