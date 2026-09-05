import { useEffect, useMemo } from 'react';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useConnectivity } from './useConnectivity';
import { Inspection } from '../db/models';
import { supabase } from '../lib/supabase';

const fetchInspectionsFromApi = async (mineId: string) => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('mine_id', mineId);
    
  if (error) {
    console.error('[Supabase] fetchInspections error:', error);
    return [];
  }
  return data || [];
};

export function useInspections(mineId: string) {
  const { isOnline } = useConnectivity();

  // Queries
  const activeQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'in_progress') // Or draft if start uses draft
  ).observe(), [mineId]);

  const scheduledQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'draft')
  ).observe(), [mineId]);

  const completedQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.or(
      Q.where('status', 'submitted'),
      Q.where('status', 'reviewed'),
      Q.where('status', 'completed')
    )
  ).observe(), [mineId]);

  // Reactive state
  const active = useObserve(activeQuery, []) || [];
  const scheduled = useObserve(scheduledQuery, []) || [];
  const completed = useObserve(completedQuery, []) || [];

  // Sync from server when online
  useEffect(() => {
    if (!isOnline || !mineId) return;

    let mounted = true;

    const syncFromServer = async () => {
      try {
        const data = await fetchInspectionsFromApi(mineId);
        if (!mounted || !data.length) return;

        await database.write(async () => {
          for (const item of data) {
            const existing = await database.get<Inspection>('inspections')
              .query(Q.where('remote_id', item.id))
              .fetch();

            if (existing.length === 0) {
              await database.get<Inspection>('inspections').create((r: any) => {
                r.remoteId = item.id;
                r.mineId = item.mine_id;
                r.conductedBy = item.conducted_by;
                r.inspectionType = item.inspection_type;
                r.checklistTemplateId = item.checklist_template_id;
                r.zone = item.zone ?? '';
                r.status = item.status === 'draft' ? 'in_progress' : item.status; 
                r.syncStatus = 'synced';
                r.startedAt = item.started_at ? new Date(item.started_at).getTime() : Date.now();
                r.completedAt = item.completed_at ? new Date(item.completed_at).getTime() : undefined;
                r.observationCount = item.observation_count || 0;
                r.violationCount = item.violation_count || 0;
              });
            } else {
              // Update existing
              await existing[0].update((r: any) => {
                r.status = item.status === 'draft' ? 'in_progress' : item.status; 
                r.observationCount = item.observation_count || r.observationCount;
                r.violationCount = item.violation_count || r.violationCount;
                r.syncStatus = 'synced';
              });
            }
          }
        });
      } catch (error) {
        console.error('Failed to sync inspections:', error);
      }
    };

    syncFromServer();

    return () => {
      mounted = false;
    };
  }, [isOnline, mineId]);

  return {
    active,
    scheduled,
    completed,
    isLoading: active === null && scheduled === null,
  };
}
