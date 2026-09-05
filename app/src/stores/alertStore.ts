import { create } from 'zustand';

export interface AlertMessage {
  id: string;
  type: 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  mineId: string;
  remoteId?: string; // ID from Supabase
}

interface AlertState {
  activeAlerts: AlertMessage[];
  criticalAlarmActive: boolean;
  
  // Actions
  addAlert: (alert: AlertMessage) => void;
  removeAlert: (id: string) => void;
  acknowledgeAlert: (id: string) => Promise<void>;
  setCriticalAlarm: (isActive: boolean) => void;
  clearAllAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  activeAlerts: [],
  criticalAlarmActive: false,

  addAlert: (alert) => set((state) => ({ 
    activeAlerts: [alert, ...state.activeAlerts],
    criticalAlarmActive: alert.type === 'CRITICAL' ? true : state.criticalAlarmActive
  })),
  
  removeAlert: (id) => set((state) => {
    const newAlerts = state.activeAlerts.filter(a => a.id !== id);
    return {
      activeAlerts: newAlerts,
      // Turn off critical alarm if no critical alerts remain
      criticalAlarmActive: newAlerts.some(a => a.type === 'CRITICAL')
    };
  }),

  acknowledgeAlert: async (id) => {
    const state = get();
    const alert = state.activeAlerts.find(a => a.id === id);
    if (!alert) return;

    // Simulate PATCH request to Supabase
    console.log(`[NETWORK] PATCH /rest/v1/alerts?id=eq.${alert.remoteId || id} { "status": "read", "read_at": "now()" }`);
    
    // Remove from local state
    state.removeAlert(id);
  },

  setCriticalAlarm: (isActive) => set({ criticalAlarmActive: isActive }),
  
  clearAllAlerts: () => set({ activeAlerts: [], criticalAlarmActive: false }),
}));
