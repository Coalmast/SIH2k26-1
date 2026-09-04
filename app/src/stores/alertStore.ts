import { create } from 'zustand';

export interface AlertMessage {
  id: string;
  type: 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  mineId: string;
}

interface AlertState {
  activeAlerts: AlertMessage[];
  criticalAlarmActive: boolean;
  
  // Actions
  addAlert: (alert: AlertMessage) => void;
  removeAlert: (id: string) => void;
  setCriticalAlarm: (isActive: boolean) => void;
  clearAllAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
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

  setCriticalAlarm: (isActive) => set({ criticalAlarmActive: isActive }),
  
  clearAllAlerts: () => set({ activeAlerts: [], criticalAlarmActive: false }),
}));
