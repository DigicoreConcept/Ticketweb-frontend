import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export function usePayouts(params: any) {
  return useQuery({
    queryKey: ["admin", "payouts", params],
    queryFn: () => adminApi.getPayouts(params),
    staleTime: 30_000,
  });
}

export function useApprovePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ref: string) => adminApi.approvePayout(ref),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
  });
}

export function useRejectPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ref, body }: { ref: string; body: any }) => adminApi.rejectPayout(ref, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "payouts"] });
    },
  });
}
