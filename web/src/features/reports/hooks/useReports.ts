import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/reports`;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = useAuthStore.getState().auth.session;
  const headers = new Headers(options.headers || {});
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  
  return fetch(url, { ...options, headers });
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: async (data: { type: string; mine_id: string; period_start: string; period_end: string }) => {
      const response = await fetchWithAuth(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to start generation');
      return response.json();
    }
  });
}

export function useReportJob(jobId: string | null) {
  return useQuery({
    queryKey: ['reportJob', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await fetchWithAuth(`${API_URL}/jobs/${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch job status');
      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => (data?.status === 'completed' ? false : 2000),
  });
}

export function useReportHistory(mineId: string) {
  return useQuery({
    queryKey: ['reportHistory', mineId],
    queryFn: async () => {
      const response = await fetchWithAuth(`${API_URL}/history?mine_id=${mineId}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    }
  });
}
