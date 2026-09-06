import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { database } from '../db';
import { Inspection, Observation } from '../db/models';
import { Q } from '@nozbe/watermelondb';
import { useObserve } from './useObserve';
import { useMemo } from 'react';

// --- READ HOOKS (Cache First with Background Sync) ---

export function useInspectionList(mineId: string) {
  // Query local DB
  const activeQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'in_progress')
  ).observe(), [mineId]);

  const completedQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.where('mine_id', mineId),
    Q.where('status', 'submitted')
  ).observe(), [mineId]);

  const active = useObserve(activeQuery, []) || [];
  const completed = useObserve(completedQuery, []) || [];

  // Background fetch from API
  useQuery({
    queryKey: ['inspections', mineId],
    queryFn: async () => {
      const data = await api.get(`/api/v1/inspections?mine_id=${mineId}`);
      
      await database.write(async () => {
        for (const item of data) {
          const existing = await database.get<Inspection>('inspections')
            .query(Q.where('remote_id', item.id))
            .fetch();

          if (existing.length === 0) {
            await database.get<Inspection>('inspections').create((r: any) => {
              r.remoteId = item.id;
              r.mineId = item.mine_id;
              r.conductedBy = item.conducted_by || '';
              r.inspectionType = item.type || 'environmental_pcb';
              r.checklistTemplateId = item.checklist_template_id || '';
              r.zone = item.zone || '';
              r.status = item.status === 'draft' ? 'in_progress' : item.status; 
              r.syncStatus = 'synced';
              r.startedAt = item.started_at ? new Date(item.started_at).getTime() : Date.now();
              r.observationCount = item.observations_count || 0;
              r.violationCount = item.violations_count || 0;
            });
          } else {
            await existing[0].update((r: any) => {
              r.status = item.status === 'draft' ? 'in_progress' : item.status; 
              r.observationCount = item.observations_count || r.observationCount;
              r.violationCount = item.violations_count || r.violationCount;
              r.syncStatus = 'synced';
            });
          }
        }
      });
      return data;
    },
    enabled: !!mineId,
    staleTime: 60000,
  });

  return { active, completed };
}

export function useInspectionDetail(id: string) {
  // We use WatermelonDB by default, fetching from API only if it's missing or observations are empty
  const queryClient = useQueryClient();

  const inspectionQuery = useMemo(() => database.get<Inspection>('inspections').query(
    Q.or(
      Q.where('id', id),
      Q.where('remote_id', id)
    )
  ).observe(), [id]);

  const observationsQuery = useMemo(() => database.get<Observation>('observations').query(
    Q.where('inspection_id', id) // Wait, if remote_id is used as inspection_id, need to be careful
  ).observe(), [id]);

  const inspections = useObserve(inspectionQuery, []) || [];
  const localObservations = useObserve(observationsQuery, []) || [];
  
  const inspection = inspections[0];

  const { data: apiDetail, isLoading } = useQuery({
    queryKey: ['inspection', id],
    queryFn: async () => {
      // Find remote ID
      let remoteId = id;
      if (inspection && inspection.remoteId) {
        remoteId = inspection.remoteId;
      }
      
      if (!remoteId.includes('-')) return null; // UUID check

      const data = await api.get(`/api/v1/inspections/${remoteId}`);
      // Sync observations if needed
      // (For this demo, we assume if we have local observations, we don't overwrite)
      return data;
    },
    enabled: !!id,
    staleTime: 60000,
  });

  return { 
    inspection: inspection || apiDetail, 
    observations: localObservations.length > 0 ? localObservations : (apiDetail?.observations || []),
    isLoading: isLoading && !inspection 
  };
}

export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      return await api.get('/api/v1/inspections/templates');
    },
    staleTime: Infinity,
  });
}

export function useInspectionReport(id: string) {
  return useQuery({
    queryKey: ['inspection_report', id],
    queryFn: async () => {
      // Simulate polling the report endpoint
      // The FastAPI doesn't have a specific report endpoint yet, but we'll mock the response based on Analyze
      const data = await api.get(`/api/v1/inspections/${id}`);
      return data;
    },
    refetchInterval: (query) => (query.state.data?.ai_report?.executive_summary ? false : 2000),
    refetchIntervalInBackground: true,
  });
}

// --- WRITE HOOKS (Write-through: WatermelonDB -> API) ---

export function useCreateInspection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // 1. Write optimistic to WatermelonDB
      let newId = '';
      await database.write(async () => {
        const ins = await database.get<Inspection>('inspections').create((r: any) => {
          r.mineId = data.mine_id;
          r.conductedBy = data.conducted_by || '';
          r.inspectionType = data.inspection_type;
          r.checklistTemplateId = data.checklist_template_id;
          r.zone = data.zone;
          r.status = 'in_progress';
          r.syncStatus = 'pending_sync';
          r.startedAt = Date.now();
          r.observationCount = 0;
          r.violationCount = 0;
        });
        newId = ins.id;
      });

      // 2. Call API
      try {
        const res = await api.post('/api/v1/inspections', data);
        // 3. Update remote_id
        await database.write(async () => {
          const ins = await database.get<Inspection>('inspections').find(newId);
          await ins.update((r: any) => {
            r.remoteId = res.id;
            r.syncStatus = 'synced';
          });
        });
        return { localId: newId, remoteId: res.id };
      } catch (err) {
        // Will sync later via syncEngine
        return { localId: newId, error: err };
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inspections', variables.mine_id] });
    }
  });
}

export function useAddObservation() {
  return useMutation({
    mutationFn: async ({ localInspectionId, remoteInspectionId, obsData }: any) => {
      // 1. Write to DB
      let newId = '';
      await database.write(async () => {
        const obs = await database.get<Observation>('observations').create((r: any) => {
          r.inspectionId = localInspectionId;
          r.checklistItemId = obsData.checklist_item_id;
          r.category = obsData.category;
          r.severity = obsData.severity;
          r.description = obsData.description;
          r.gasReadings = JSON.stringify(obsData.gas_readings || {});
          r.isCompliant = obsData.severity === 'none' || obsData.status === 'ok';
          r.responseType = obsData.status; // Save the status here since there's no native 'status' col
          r.syncStatus = 'pending_sync';
        });
        newId = obs.id;
        
        // Update count
        const ins = await database.get<Inspection>('inspections').find(localInspectionId);
        await ins.update((r: any) => {
          r.observationCount += 1;
        });
      });

      // 2. Call API if remote ID exists
      if (remoteInspectionId && remoteInspectionId.includes('-')) {
        try {
          const res = await api.post(`/api/v1/inspections/${remoteInspectionId}/observations`, obsData);
          await database.write(async () => {
            const obs = await database.get<Observation>('observations').find(newId);
            await obs.update((r: any) => {
              r.remoteId = res.id;
              r.syncStatus = 'synced';
            });
          });
        } catch (e) {
          console.error("API error adding obs", e);
        }
      }
      return newId;
    }
  });
}

export function useAnalyzeInspection() {
  return useMutation({
    mutationFn: async (remoteInspectionId: string) => {
      return await api.post(`/api/v1/inspections/${remoteInspectionId}/analyze`, {});
    }
  });
}

export function useSubmitInspection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ localId, remoteId }: any) => {
      // Update local
      await database.write(async () => {
        const ins = await database.get<Inspection>('inspections').find(localId);
        await ins.update((r: any) => {
          r.status = 'submitted';
          r.syncStatus = 'pending_sync';
        });
      });
      // Call API
      if (remoteId && remoteId.includes('-')) {
        await api.post(`/api/v1/inspections/${remoteId}/submit`, {});
        await database.write(async () => {
          const ins = await database.get<Inspection>('inspections').find(localId);
          await ins.update((r: any) => {
            r.syncStatus = 'synced';
          });
        });
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    }
  });
}
