import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useEnvironmentReadings(mineId?: string) {
  return useQuery({
    queryKey: ['environment-readings', mineId],
    queryFn: async () => {
      if (!mineId) return null;

      // We should ideally fetch the latest reading for each parameter.
      // For simplicity in the dashboard, we fetch the last N readings and find the latest.
      const { data: readings } = await supabase
        .from('environment_readings')
        .select('*')
        .eq('mine_id', mineId)
        .order('created_at', { ascending: false })
        .limit(20);

      const latestReadings: Record<string, any> = {};
      if (readings) {
        // Group by parameter and get the most recent one
        for (const reading of readings) {
          if (!latestReadings[reading.parameter]) {
            latestReadings[reading.parameter] = reading;
          }
        }
      }

      return latestReadings;
    },
    enabled: !!mineId
  });
}
