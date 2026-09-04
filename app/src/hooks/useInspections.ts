import { useEffect, useMemo } from 'react';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useConnectivity } from './useConnectivity';
import { Inspection } from '../db/models';
// import { api } from '../services/api'; // assuming api exists, will use fetch or similar if not

// Define local fetch stand-in if not present
const fetchInspectionsFromApi = async (mineId: string) => {
  // Mock API call to be replaced with actual Axios/fetch instance
  // e.g. return await api.get(`/api/v1/inspections?mine_id=${mineId}`);
  console.log(`[API] Fetching inspections for mine ${mineId}`);
  return [];
};

export function useInspections(mineId: string) {
  const { isOnline } = useConnectivity();

  // Queries
  const activeQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'in_progress')
  ).observe(), [mineId]);

  const scheduledQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'draft')
  ).observe(), [mineId]);

  const completedQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.or(
      Q.where('status', 'submitted'),
      Q.where('status', 'reviewed')
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
                r.zone = item.zone ?? '';
                r.status = item.status;
                r.syncStatus = 'synced';
                r.startedAt = new Date(item.started_at).getTime();
              });
            } else {
              // Update existing if server is newer? Depends on conflict resolution
              // For now, we only insert missing ones
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
