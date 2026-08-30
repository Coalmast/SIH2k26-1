import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export function useCAPA(id: string) {
  return useQuery({
    queryKey: ["capa", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/inspections/all/corrective-actions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateCAPA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await apiClient.patch(`/api/v1/inspections/all/corrective-actions/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["capa", data.id] });
      queryClient.invalidateQueries({ queryKey: ["violation", data.violation_id] });
    },
  });
}

export function useVerifyCloseCAPA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/api/v1/inspections/all/corrective-actions/${id}/verify`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["capa", data.id] });
      queryClient.invalidateQueries({ queryKey: ["violation", data.violation_id] });
    },
  });
}
