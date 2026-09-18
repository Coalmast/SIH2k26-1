import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useAttendanceSummary(mineId?: string) {
  return useQuery({
    queryKey: ['attendance-summary', mineId],
    queryFn: async () => {
      if (!mineId) return null;

      // Simplified query to get today's attendance records
      const today = new Date().toISOString().split('T')[0];
      
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('shift_type, status')
        .eq('mine_id', mineId)
        .gte('created_at', today);

      const summary = {
        shiftA: 0,
        shiftB: 0,
        shiftC: 0,
        absent: 0,
        total: 0
      };

      if (attendance) {
        summary.total = attendance.length;
        for (const record of attendance) {
          if (record.status === 'absent') {
            summary.absent++;
          } else {
            if (record.shift_type === 'A') summary.shiftA++;
            else if (record.shift_type === 'B') summary.shiftB++;
            else if (record.shift_type === 'C') summary.shiftC++;
          }
        }
      }

      return summary;
    },
    enabled: !!mineId
  });
}
