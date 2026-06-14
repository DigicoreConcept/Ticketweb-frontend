import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api";

export function useAdminStats(period: string = "30d") {
  return useQuery({
    queryKey: ["admin", "stats", period],
    queryFn: () => adminApi.getStats(period),
    staleTime: 60 * 1000, // 1 min
  });
}
