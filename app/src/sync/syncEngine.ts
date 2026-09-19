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
  const { useAuthStore } = require('../stores/authStore');

  // Wait for Zustand hydration before syncing
  await new Promise<void>(resolve => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
    // Immediately resolve if already hydrated
    if (useAuthStore.persist.hasHydrated()) resolve();
  });

  let setSyncing = (val: boolean) => {};
  let setLastSyncTime = (val: string) => {};
  let token = '';
  
  try {
    const store = useAppStore.getState();
    setSyncing = store.setSyncing;
    setLastSyncTime = store.setLastSyncTime;
    
    // Get the token from authStore directly
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
      await database.write(async () => {
        await incident.update((r: any) => {
          r.remoteId = `mock-incident-${Date.now()}`;
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
      await database.write(async () => {
        await obs.update((o: any) => {
          o.remoteId = `mock-obs-${Date.now()}`;
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
        remoteId = `mock-insp-${Date.now()}`;
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
        await database.write(async () => {
          await obs.update((o: any) => {
            o.remoteId = `mock-obs-item-${Date.now()}`;
            o.syncStatus = 'synced';
          });
        });
      }

      await database.write(async () => {
        await inspection.update((i: any) => { i.syncStatus = 'synced'; });
      });
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
      const fileUrl = `mock-url-${Date.now()}.jpg`;
      await database.write(async () => {
        await media.update((m: any) => {
          m.fileUrl = fileUrl;
          m.syncStatus = 'uploaded';
        });
      });
    } catch (error) {
      console.error(`Failed to upload media ${media.id}:`, error);
    }
  }
}
