import { database } from '../db';
import { Inspection, Observation } from '../db/models';
import { Q } from '@nozbe/watermelondb';
import { useAppStore } from '../stores/appStore';
import { MediaUploader } from './mediaUploader';
// import { api } from '../services/api';

// Mock API - replace with actual fetch/axios calls to your FastAPI
const api = {
  post: async (url: string, data: any) => {
    console.log(`[API POST] ${url}`, data);
    return { data: { id: `remote_${Date.now()}` } };
  }
};

export async function performSync() {
  // We'll safely attempt to use appStore, if it doesn't exist, we just proceed
  let setSyncing = (val: boolean) => {};
  let setLastSyncTime = (val: string) => {};
  
  try {
    const store = useAppStore.getState();
    setSyncing = store.setSyncing;
    setLastSyncTime = store.setLastSyncTime;
  } catch (e) {
    // appStore might not be properly set up, ignore
  }
  
  setSyncing(true);

  try {
    await pushLocalChanges();
    // Pull changes if needed (e.g., getting latest templates or other inspections)
    // pullRemoteChanges(); 
    
    setLastSyncTime(new Date().toISOString());
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  } finally {
    setSyncing(false);
  }
}

async function pushLocalChanges() {
  // 1. Find all inspections that need to be submitted
  const pendingInspections = await database.get<Inspection>('inspections')
    .query(Q.where('sync_status', 'pending_sync'))
    .fetch();

  for (const inspection of pendingInspections) {
    try {
      // First, create the inspection on server (if it doesn't have a remoteId yet)
      let remoteId = inspection.remoteId;
      if (!remoteId) {
        const createPayload = {
          mine_id: inspection.mineId,
          inspection_type: inspection.inspectionType,
          checklist_template_id: inspection.checklistTemplateId,
          scheduled_date: new Date(inspection.startedAt || Date.now()).toISOString(),
          zone: inspection.zone,
        };
        
        const createRes = await api.post('/api/v1/inspections', createPayload);
        remoteId = createRes.data.id;
        
        await database.write(async () => {
          await inspection.update((i: any) => {
            i.remoteId = remoteId;
          });
        });
      }

      // 2. Find all pending observations for this inspection
      const pendingObservations = await database.get<Observation>('observations')
        .query(
          Q.where('inspection_id', inspection.id),
          Q.where('sync_status', 'pending_sync')
        )
        .fetch();

      for (const obs of pendingObservations) {
        // Upload photos first if any
        let uploadedPhotoUrls: string[] = [];
        if (obs.photoUris) {
          const localUris = JSON.parse(obs.photoUris);
          uploadedPhotoUrls = await MediaUploader.uploadPhotos(localUris);
        }

        const obsPayload = {
          checklist_item_id: obs.checklistItemId,
          category: obs.category,
          description: obs.description,
          status: obs.responseType, // 'ok' | 'non_compliant' | 'observation_only'
          severity: obs.severity,
          // geo_stamp can be appended if saved in observation
        };

        const obsRes = await api.post(`/api/v1/inspections/${remoteId}/observations`, obsPayload);
        
        await database.write(async () => {
          await obs.update((o: any) => {
            o.remoteId = obsRes.data.id;
            o.syncStatus = 'synced';
            // Optional: update photo_uris to the remote URLs
            if (uploadedPhotoUrls.length > 0) {
              o.photoUris = JSON.stringify(uploadedPhotoUrls);
            }
          });
        });
      }

      // 3. If inspection is submitted, call the submit endpoint
      if (inspection.status === 'submitted') {
        let geoStamp = undefined;
        if (inspection.geoStampEnd) {
          geoStamp = JSON.parse(inspection.geoStampEnd);
        }

        const submitPayload = {
          geo_stamp: geoStamp,
          overall_remarks: inspection.overallRemarks,
        };

        await api.post(`/api/v1/inspections/${remoteId}/submit`, submitPayload);

        await database.write(async () => {
          await inspection.update((i: any) => {
            i.syncStatus = 'synced';
          });
        });
      } else {
        // If it's just in_progress but we synced observations, we can mark the inspection itself as synced for now
        await database.write(async () => {
          await inspection.update((i: any) => {
            i.syncStatus = 'synced';
          });
        });
      }

    } catch (err) {
      console.error(`Failed to push inspection ${inspection.id}:`, err);
      // Mark as error so we can retry or show UI indicator
      await database.write(async () => {
        await inspection.update((i: any) => {
          i.syncStatus = 'error';
        });
      });
    }
  }
}
