import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';

export function useMines(subsidiaryId?: string) {
  return useQuery({
    queryKey: ['mines', subsidiaryId],
    queryFn: async () => {
      let query = supabase.from('mines').select('*, subsidiaries(name)');
      if (subsidiaryId && subsidiaryId !== 'all') {
        query = query.eq('subsidiary_id', subsidiaryId);
      }
      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    }
  });
}

export function useCreateMine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mineData: any) => {
      const res = await apiClient.post('/api/v1/mines', mineData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mines'] });
    }
  });
}
