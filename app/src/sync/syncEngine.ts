import { database } from '../db';
import { Inspection, Observation, IncidentReport, SafetyObservation, ShiftReport, AttendanceRecord, MediaAttachment } from '../db/models';
import { Q } from '@nozbe/watermelondb';
import { useAppStore } from '../stores/appStore';
import { MediaUploader } from './mediaUploader';
import { createClient } from '@supabase/supabase-js';

// Get URL and Key once
const supabaseUrl = (global as any).DEV_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export async function performSync() {
  let setSyncing = (val: boolean) => {};
  let setLastSyncTime = (val: string) => {};
  let token = '';
  
  try {
    const store = useAppStore.getState();
    setSyncing = store.setSyncing;
    setLastSyncTime = store.setLastSyncTime;
    
    // Get the token from authStore directly
    const { useAuthStore } = require('../stores/authStore');
    token = useAuthStore.getState().session?.access_token || '';
  } catch (e) {
    // appStore might not be properly set up, ignore
  }
  
  setSyncing(true);

  try {
    // Create a dedicated client for syncing to avoid triggering global auth listeners
    const syncSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    });

    await pushLocalChanges(syncSupabase);
    setLastSyncTime(new Date().toISOString());
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  } finally {
    setSyncing(false);
  }
}

async function pushLocalChanges(syncSupabase: any) {
  // 1. Incident Reports
  const pendingIncidents = await database.get<IncidentReport>('incident_reports').query(Q.where('sync_status', 'pending_sync')).fetch();
  for (const incident of pendingIncidents) {
    try {
      const payload = {
        mine_id: incident.mineId,
        incident_type: incident.incidentType,
        description: incident.description,
        severity: incident.severity,
        ai_suggested_severity: incident.aiSuggestedSeverity,
        ai_suggested_category: incident.aiSuggestedCategory,
        geo_stamp: incident.geoStamp ? JSON.parse(incident.geoStamp) : null,
        zone: incident.zone,
        shift: incident.shift,
        persons_involved: incident.personsInvolved ? JSON.parse(incident.personsInvolved) : [],
        immediate_actions_taken: incident.immediateActionsTaken,
        is_linked_to_accident_register: incident.isLinkedToAccidentRegister,
        reported_by: incident.reportedBy,
        reported_at: new Date(incident.reportedAt).toISOString(),
      };
      
      const { data, error } = await syncSupabase.from('incident_reports').insert(payload).select('id').single();
      if (error) throw error;
      
      await database.write(async () => {
        await incident.update((r: any) => {
          r.remoteId = data.id;
          r.syncStatus = 'synced';
        });
      });
    } catch (err) {
      console.error(`Failed to sync incident ${incident.id}:`, err);
    }
  }

  // 2. Safety Observations
  const pendingSafetyObs = await database.get<SafetyObservation>('safety_observations').query(Q.where('sync_status', 'pending_sync')).fetch();
  for (const obs of pendingSafetyObs) {
    try {
      const payload = {
        mine_id: obs.mineId,
        zone: obs.zone,
        observation_type: obs.observationType,
        category: obs.category,
        description: obs.description,
        geo_stamp: obs.geoStamp ? JSON.parse(obs.geoStamp) : null,
        status: obs.status,
        observed_by: obs.observedBy,
        observed_at: new Date(obs.observedAt).toISOString(),
      };
      
      const { data, error } = await syncSupabase.from('safety_observations').insert(payload).select('id').single();
      if (error) throw error;
      
      await database.write(async () => {
        await obs.update((o: any) => {
          o.remoteId = data.id;
          o.syncStatus = 'synced';
        });
      });
    } catch (err) {
      console.error(`Failed to sync safety observation ${obs.id}:`, err);
    }
  }

  // 3. Inspections
  const pendingInspections = await database.get<Inspection>('inspections').query(Q.where('sync_status', 'pending_sync')).fetch();
  for (const inspection of pendingInspections) {
    try {
      let remoteId = inspection.remoteId;
      if (!remoteId) {
        const createPayload = {
          mine_id: inspection.mineId,
          conducted_by: inspection.conductedBy,
          inspection_type: inspection.inspectionType,
          checklist_template_id: inspection.checklistTemplateId || null,
          zone: inspection.zone,
          geo_stamp: inspection.geoStampStart ? JSON.parse(inspection.geoStampStart) : null,
          started_at: new Date(inspection.startedAt || Date.now()).toISOString(),
          status: inspection.status === 'in_progress' ? 'draft' : inspection.status, // Map status correctly
          observation_count: inspection.observationCount,
          violation_count: inspection.violationCount,
          overall_remarks: inspection.overallRemarks,
        };
        
        const { data, error } = await syncSupabase.from('inspections').insert(createPayload).select('id').single();
        if (error) {
          console.error("Supabase error inserting inspection:", error);
          throw error;
        }
        remoteId = data.id;
        
        await database.write(async () => {
          await inspection.update((i: any) => {
            i.remoteId = remoteId;
          });
        });
      }

      // Sync Observations
      const pendingObservations = await database.get<Observation>('observations')
        .query(Q.where('inspection_id', inspection.id), Q.where('sync_status', 'pending_sync'))
        .fetch();

      for (const obs of pendingObservations) {
        const obsPayload = {
          inspection_id: remoteId,
          checklist_item_id: obs.checklistItemId,
          category: obs.category,
          description: obs.description,
          status: (obs as any).responseType || 'ok',
          severity: obs.severity === 'none' ? 'low' : (obs.severity || 'low'),
        };

        const { data: obsData, error: obsError } = await syncSupabase.from('observations').insert(obsPayload).select('id').single();
        if (obsError) throw obsError;
        
        await database.write(async () => {
          await obs.update((o: any) => {
            o.remoteId = obsData.id;
            o.syncStatus = 'synced';
          });
        });
      }

      // Mark inspection synced if submitted
      if (inspection.status === 'submitted' || inspection.status === 'completed') {
        const updatePayload = {
          completed_at: inspection.completedAt ? new Date(inspection.completedAt).toISOString() : null,
          submitted_at: inspection.submittedAt ? new Date(inspection.submittedAt).toISOString() : null,
          status: 'submitted'
        };
        await syncSupabase.from('inspections').update(updatePayload).eq('id', remoteId);
        await database.write(async () => {
          await inspection.update((i: any) => { i.syncStatus = 'synced'; });
        });
      } else {
        await database.write(async () => {
          await inspection.update((i: any) => { i.syncStatus = 'synced'; });
        });
      }
    } catch (err) {
      console.error(`Failed to push inspection ${inspection.id}:`, err);
    }
  }

  // 4. Media Attachments
  await uploadPendingMedia();
}

async function uploadPendingMedia() {
  const pendingMedia = await database.get<MediaAttachment>('media_attachments').query(Q.where('sync_status', 'pending_upload')).fetch();
  for (const media of pendingMedia) {
    try {
      const fileUrl = await MediaUploader.uploadSinglePhoto(media.localFilePath);
      if (fileUrl) {
        // Also insert to media_attachments table
        const payload = {
           parent_type: media.parentType,
           parent_id: media.parentId, // Might need to map local ID to remote ID later
           media_type: media.mediaType,
           file_url: fileUrl,
           captured_by: media.capturedBy,
        };
        // await supabase.from('media_attachments').insert(payload);
        
        await database.write(async () => {
          await media.update((m: any) => {
            m.fileUrl = fileUrl;
            m.syncStatus = 'uploaded';
          });
        });
      }
    } catch (error) {
      console.error(`Failed to upload media ${media.id}:`, error);
    }
  }
}
