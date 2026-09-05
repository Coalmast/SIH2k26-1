import { useEffect, useMemo } from 'react';
import { database } from '../db';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useConnectivity } from './useConnectivity';
import { IncidentReport, SafetyObservation, ShiftReport } from '../db/models';
import { supabase } from '../lib/supabase';

export function useReports(mineId: string) {
  const { isOnline } = useConnectivity();

  const incidentsQuery = useMemo(() => database.get<IncidentReport>('incident_reports').query(
    Q.where('mine_id', mineId)
  ).observe(), [mineId]);

  const observationsQuery = useMemo(() => database.get<SafetyObservation>('safety_observations').query(
    Q.where('mine_id', mineId)
  ).observe(), [mineId]);

  const shiftsQuery = useMemo(() => database.get<ShiftReport>('shift_reports').query(
    Q.where('mine_id', mineId)
  ).observe(), [mineId]);

  const incidents = useObserve(incidentsQuery, []) || [];
  const observations = useObserve(observationsQuery, []) || [];
  const shiftReports = useObserve(shiftsQuery, []) || [];

  useEffect(() => {
    if (!isOnline || !mineId) return;
    let mounted = true;

    const syncFromServer = async () => {
      try {
        // Fetch Incidents
        const { data: incidentData } = await supabase.from('incident_reports').select('*').eq('mine_id', mineId);
        if (mounted && incidentData) {
          await database.write(async () => {
            for (const item of incidentData) {
              const existing = await database.get<IncidentReport>('incident_reports').query(Q.where('remote_id', item.id)).fetch();
              if (existing.length === 0) {
                await database.get<IncidentReport>('incident_reports').create((r: any) => {
                  r.remoteId = item.id;
                  r.mineId = item.mine_id;
                  r.incidentType = item.incident_type;
                  r.description = item.description;
                  r.severity = item.severity;
                  r.zone = item.zone || '';
                  r.syncStatus = 'synced';
                  r.reportedBy = item.reported_by;
                  r.reportedAt = new Date(item.reported_at || Date.now()).getTime();
                });
              }
            }
          });
        }

        // Fetch Safety Observations
        const { data: obsData } = await supabase.from('safety_observations').select('*').eq('mine_id', mineId);
        if (mounted && obsData) {
          await database.write(async () => {
            for (const item of obsData) {
              const existing = await database.get<SafetyObservation>('safety_observations').query(Q.where('remote_id', item.id)).fetch();
              if (existing.length === 0) {
                await database.get<SafetyObservation>('safety_observations').create((r: any) => {
                  r.remoteId = item.id;
                  r.mineId = item.mine_id;
                  r.observationType = item.observation_type;
                  r.description = item.description;
                  r.zone = item.zone || '';
                  r.syncStatus = 'synced';
                  r.observedBy = item.observed_by;
                  r.observedAt = new Date(item.observed_at || Date.now()).getTime();
                  r.status = item.status;
                });
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to pull reports:', error);
      }
    };

    syncFromServer();
    return () => { mounted = false; };
  }, [isOnline, mineId]);

  return {
    incidents,
    observations,
    shiftReports,
    isLoading: incidents === null,
  };
}
