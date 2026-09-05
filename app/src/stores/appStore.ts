import { create } from 'zustand';

export interface SyncedItem {
  id: string;
  table: string;
  syncedAt: number;
}

export interface ConflictItem {
  id: string;
  table: string;
  reason: string;
  detectedAt: number;
}

interface AppState {
  isOnline: boolean;
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: string | null;
  pendingSyncItems: number;
  
  // New v3 state
  lastConnectedAt: number | null;
  lastSyncedItems: SyncedItem[];
  conflicts: ConflictItem[];
  shiftClosed: boolean;
  language: string;
  storageLimit: string;
  wifiOnlySync: boolean;
  notificationPrefs: {
    capaAssigned: boolean;
    complianceDue: boolean;
    dailySummary: boolean;
  };
  currentShift: string;
  
  // Actions
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setSyncProgress: (progress: number) => void;
  setLastSyncTime: (time: string) => void;
  setPendingSyncItems: (count: number) => void;
  
  setLastConnectedAt: (time: number | null) => void;
  addSyncedItem: (item: SyncedItem) => void;
  addConflict: (item: ConflictItem) => void;
  clearConflicts: () => void;
  setShiftClosed: (closed: boolean) => void;
  setLanguage: (lang: string) => void;
  setStorageLimit: (limit: string) => void;
  setWifiOnlySync: (wifiOnly: boolean) => void;
  updateNotificationPrefs: (prefs: Partial<AppState['notificationPrefs']>) => void;
  setCurrentShift: (shift: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: true,
  isSyncing: false,
  syncProgress: 0,
  lastSyncTime: null,
  pendingSyncItems: 0,

  lastConnectedAt: null,
  lastSyncedItems: [],
  conflicts: [],
  shiftClosed: false,
  language: 'en',
  storageLimit: '500MB',
  wifiOnlySync: false,
  notificationPrefs: {
    capaAssigned: true,
    complianceDue: true,
    dailySummary: true,
  },
  currentShift: 'general',

  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setSyncProgress: (syncProgress) => set({ syncProgress }),
  setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),
  setPendingSyncItems: (pendingSyncItems) => set({ pendingSyncItems }),

  setLastConnectedAt: (time) => set({ lastConnectedAt: time }),
  addSyncedItem: (item) => set((state) => ({ 
    lastSyncedItems: [item, ...state.lastSyncedItems].slice(0, 50) 
  })),
  addConflict: (item) => set((state) => ({ 
    conflicts: [item, ...state.conflicts] 
  })),
  clearConflicts: () => set({ conflicts: [] }),
  setShiftClosed: (closed) => set({ shiftClosed: closed }),
  setLanguage: (lang) => set({ language: lang }),
  setStorageLimit: (limit) => set({ storageLimit: limit }),
  setWifiOnlySync: (wifiOnly) => set({ wifiOnlySync: wifiOnly }),
  updateNotificationPrefs: (prefs) => set((state) => ({
    notificationPrefs: { ...state.notificationPrefs, ...prefs }
  })),
  setCurrentShift: (shift) => set({ currentShift: shift }),
}));
