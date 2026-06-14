import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export function useOrders(params: any) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminApi.getOrders(params),
    staleTime: 30_000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => adminApi.getOrder(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useRefundOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => adminApi.refundOrder(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "order", variables.id] });
    },
  });
}
