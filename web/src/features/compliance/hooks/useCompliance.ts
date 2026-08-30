import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/compliance`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = useAuthStore.getState().auth.session;
  const headers = new Headers(options.headers || {});
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  
  return fetch(url, { ...options, headers });
}

export function useComplianceInstances(mineId: string | undefined, month?: string, status?: string) {
  return useQuery({
    queryKey: ['complianceInstances', mineId, month, status],
    queryFn: async () => {
      const activeMineId = mineId || 'all';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (status && status !== 'All') params.append('status', status);
      
      const response = await fetchWithAuth(`${API_URL}/mines/${activeMineId}/instances?${params.toString()}`);
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
      const response = await fetchWithAuth(`${API_URL}/mines/${mineId}/health-score`);
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
      const response = await fetchWithAuth(`${API_URL}/instances/${instanceId}`);
      if (!response.ok) throw new Error('Failed to fetch instance');
      return response.json();
    },
  });
}

export function useApproveInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (instanceId: string) => {
      const response = await fetchWithAuth(`${API_URL}/instances/${instanceId}/approve`, {
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
      const response = await fetchWithAuth(`${API_URL}/instances/${instanceId}/submit`, {
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

export function useRejectInstance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ instanceId, reason }: { instanceId: string; reason: string }) => {
      const response = await fetchWithAuth(`${API_URL}/instances/${instanceId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject instance');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complianceInstance', variables.instanceId] });
      queryClient.invalidateQueries({ queryKey: ['complianceInstances'] });
    },
  });
}

export function useComplianceCalendar(mineId: string | undefined, month: string) {
  return useQuery({
    queryKey: ['complianceCalendar', mineId, month],
    queryFn: async () => {
      const activeMineId = mineId || 'all';
      const response = await fetchWithAuth(`${API_URL}/mines/${activeMineId}/calendar?month=${month}`);
      if (!response.ok) throw new Error('Failed to fetch calendar');
      return response.json();
    },
    enabled: !!month,
  });
}
