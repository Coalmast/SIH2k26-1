import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/apiClient";
import { type z } from "zod";
import { type CAPACreateSchema } from "../schemas";

interface ViolationFilters {
  mineId?: string;
  severity?: string;
  status?: string;
}

export function useViolations(filters: ViolationFilters) {
  return useQuery({
    queryKey: ["violations", filters],
    queryFn: async () => {
      let query = supabase
        .from("violations")
        .select("*, capas:corrective_actions(id, status, due_date, assigned_to)");

      if (filters.mineId && filters.mineId !== "all") {
        query = query.eq("mine_id", filters.mineId);
      }
      if (filters.severity && filters.severity !== "all") {
        query = query.eq("severity", filters.severity);
      }
      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useViolation(id: string) {
  return useQuery({
    queryKey: ["violation", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/inspections/all/violations/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAssignCAPA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ violationId, dto }: { violationId: string, dto: z.infer<typeof CAPACreateSchema> }) => {
      const response = await apiClient.post(`/api/v1/inspections/all/violations/${violationId}/assign-capa`, dto);
      return response.data;
    },
    onSuccess: (_, { violationId }) => {
      queryClient.invalidateQueries({ queryKey: ["violation", violationId] });
      queryClient.invalidateQueries({ queryKey: ["violations"] });
    },
  });
}
