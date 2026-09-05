import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";
import { z } from "zod";
import { InspectionCreateSchema } from "../schemas";

interface InspectionFilters {
  mineId?: string;
  type?: string;
  status?: string;
}

export function useInspections(filters: InspectionFilters) {
  return useQuery({
    queryKey: ["inspections", filters],
    queryFn: async () => {
      let query = supabase
        .from("inspections")
        .select("*, observations(count)");

      if (filters.mineId && filters.mineId !== "all") {
        query = query.eq("mine_id", filters.mineId);
      }
      if (filters.type && filters.type !== "all") {
        query = query.eq("inspection_type", filters.type);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("started_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: ["inspection", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/inspections/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useScheduleInspection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dto: z.infer<typeof InspectionCreateSchema>) => {
      const response = await apiClient.post("/api/v1/inspections", dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useSubmitInspection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/inspections/${id}/submit`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["inspection", id] });
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
    },
  });
}

export function useAddObservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inspectionId, data }: { inspectionId: string; data: any }) => {
      const response = await apiClient.post(`/api/v1/inspections/${inspectionId}/observations`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inspection", variables.inspectionId] });
    },
  });
}

export function useAnalyzeInspection() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/inspections/${id}/analyze`);
      return response.data;
    },
  });
}

export function useInspectionReport(id: string) {
  return useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/reports/inspection/${id}/summary`);
      return response.data;
    },
    enabled: !!id,
  });
}
