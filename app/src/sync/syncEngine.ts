import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../db';
import { api } from '../lib/api';
import { useAppStore } from '../stores/appStore';

export async function performSync() {
  const setSyncing = useAppStore.getState().setSyncing;
  const setLastSyncTime = useAppStore.getState().setLastSyncTime;
  
  setSyncing(true);

  try {
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
        const response = await api.get(`/sync?last_pulled_at=${lastPulledAt || 0}`);
        const { changes, timestamp } = response;
        return { changes, timestamp };
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        await api.post(`/sync`, { changes, lastPulledAt });
      },
      migrationsEnabledAtVersion: 1,
    });
    
    setLastSyncTime(new Date().toISOString());
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  } finally {
    setSyncing(false);
  }
}
