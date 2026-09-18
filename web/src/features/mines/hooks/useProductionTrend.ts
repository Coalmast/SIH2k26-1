import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';

export function useProductionTrend(mineId?: string) {
  return useQuery({
    queryKey: ['production-trend', mineId],
    queryFn: async () => {
      if (!mineId) return null;

      const { data: productionData } = await supabase
        .from('production_readings')
        .select('created_at, coal_extracted')
        .eq('mine_id', mineId)
        .order('created_at', { ascending: true })
        .limit(180); // Roughly 6 months of daily data

      // Also get anomalies
      let anomalies: any[] = [];
      try {
        const res = await apiClient.get(`/api/v1/ai/anomalies/${mineId}`);
        anomalies = res.data.filter((a: any) => a.anomaly_type === 'production');
      } catch (err) {
        console.warn('Failed to fetch anomalies', err);
      }

      // If no data (e.g. mock mine), provide some fallback data to show the chart UI
      let finalData = productionData || [];
      if (finalData.length === 0) {
        // Generate mock data for the last 6 months
        const now = new Date();
        for (let i = 180; i >= 0; i -= 7) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          finalData.push({
            created_at: d.toISOString(),
            coal_extracted: 40000 + Math.random() * 10000
          });
        }
      }

      return {
        productionData: finalData,
        anomalies: anomalies
      };
    },
    enabled: !!mineId
  });
}
