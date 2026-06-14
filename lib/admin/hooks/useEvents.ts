import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export function useEvents(params: any) {
  return useQuery({
    queryKey: ["admin", "events", params],
    queryFn: () => adminApi.getEvents(params),
    staleTime: 30_000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["admin", "event", id],
    queryFn: () => adminApi.getEvent(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function usePublishEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.publishEvent(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "event", id] });
    },
  });
}

export function useUnpublishEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unpublishEvent(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "event", id] });
    },
  });
}

export function useFeatureEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.featureEvent(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "event", id] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
    },
  });
}
