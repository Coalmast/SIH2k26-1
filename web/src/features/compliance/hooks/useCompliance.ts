import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/compliance`;

export function useComplianceInstances(mineId: string | undefined, month?: string, status?: string) {
  return useQuery({
    queryKey: ['complianceInstances', mineId, month, status],
    queryFn: async () => {
      const activeMineId = mineId || 'all';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (status && status !== 'All') params.append('status', status);
      
      const response = await fetch(`${API_URL}/mines/${activeMineId}/instances?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch instances');
      return response.json();
    },
    enabled: true,
  });
}

export function useComplianceHealth(mineId: string | undefined) {
  return useQuery({
    queryKey: ['complianceHealth', mineId],
    queryFn: async () => {
      if (!mineId || mineId === 'all') return null;
      const response = await fetch(`${API_URL}/mines/${mineId}/health-score`);
      if (!response.ok) throw new Error('Failed to fetch health score');
      return response.json();
    },
    enabled: !!mineId && mineId !== 'all',
    refetchInterval: 300000, // 5 minutes
  });
}

export function useComplianceInstance(instanceId: string) {
  return useQuery({
    queryKey: ['complianceInstance', instanceId],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/instances/${instanceId}`);
      if (!response.ok) throw new Error('Failed to fetch instance');
      return response.json();
    },
  });
}

export function useApproveInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await fetch(`${API_URL}/instances/${instanceId}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve instance');
      return response.json();
    },
    onSuccess: (_, instanceId) => {
      queryClient.invalidateQueries({ queryKey: ['complianceInstance', instanceId] });
      queryClient.invalidateQueries({ queryKey: ['complianceInstances'] });
    },
  });
}

export function useSubmitEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, formData }: { instanceId: string; formData: FormData }) => {
      const response = await fetch(`${API_URL}/instances/${instanceId}/submit`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to submit evidence');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complianceInstance', variables.instanceId] });
      queryClient.invalidateQueries({ queryKey: ['complianceInstances'] });
    },
  });
}
