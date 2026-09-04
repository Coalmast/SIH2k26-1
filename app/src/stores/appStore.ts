import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: string | null;
  pendingSyncItems: number;
  
  // Actions
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncProgress: (progress: number) => void;
  setLastSyncTime: (time: string) => void;
  setPendingSyncItems: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  isSyncing: false,
  syncProgress: 0,
  lastSyncTime: null,
  pendingSyncItems: 0,

  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setSyncProgress: (syncProgress) => set({ syncProgress }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setPendingSyncItems: (pendingSyncItems) => set({ pendingSyncItems }),
}));
