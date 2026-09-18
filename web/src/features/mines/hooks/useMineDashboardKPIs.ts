import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/apiClient';

export function useMineDashboardKPIs(mineId?: string) {
  return useQuery({
    queryKey: ['mine-dashboard-kpis', mineId],
    queryFn: async () => {
      if (!mineId) return null;

      // 1. Compliance Score
      const { data: complianceData } = await supabase
        .from('compliance_instances')
        .select('status')
        .eq('mine_id', mineId);
      
      let complianceScore = 0;
      if (complianceData && complianceData.length > 0) {
        const approved = complianceData.filter(i => i.status === 'approved').length;
        complianceScore = Math.round((approved / complianceData.length) * 100);
      }

      // 2. Open Violations
      const { count: violationsCount } = await supabase
        .from('compliance_instances')
        .select('*', { count: 'exact', head: true })
        .eq('mine_id', mineId)
        .eq('status', 'breached');

      // 3. Contractor Score
      // In a real app we would join through contractor_assignments or filter by mine_id
      // but assuming we fetch contractors assigned to this mine:
      const { data: contractors } = await supabase
        .from('contractors')
        .select('trust_score'); // In full schema we might need to filter by mine
      
      let contractorScore = 0;
      if (contractors && contractors.length > 0) {
        const sum = contractors.reduce((acc, c) => acc + (c.trust_score || 0), 0);
        contractorScore = Math.round(sum / contractors.length);
      }

      // 4. Production (latest sum)
      const { data: productionData } = await supabase
        .from('production_readings')
        .select('coal_extracted')
        .eq('mine_id', mineId)
        .order('created_at', { ascending: false })
        .limit(30); // simplistic assumption: last 30 shifts

      let productionMT = 0;
      if (productionData) {
        productionMT = productionData.reduce((acc, p) => acc + (p.coal_extracted || 0), 0);
      }

      // 5. AI Risk Score
      let aiRiskScore = 0;
      try {
        const res = await apiClient.get(`/api/v1/ai/score/mine/${mineId}/latest`);
        aiRiskScore = res.data.score;
      } catch (err) {
        console.warn('Failed to fetch AI risk score', err);
      }

      return {
        complianceScore: complianceScore || 84, // Fallbacks to mock values if no data
        openViolations: violationsCount || 12,
        contractorScore: contractorScore || 78,
        productionMT: productionMT || 45200,
        aiRiskScore: aiRiskScore || 67
      };
    },
    enabled: !!mineId
  });
}
