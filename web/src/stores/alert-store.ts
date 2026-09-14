import { create } from 'zustand'

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Alert {
  id: string
  title: string
  message: string
  priority: AlertPriority
  timestamp: string
  read: boolean
  source?: string
  mineId?: string
}

interface AlertState {
  alerts: Alert[]
  unreadCount: number
  addAlert: (alert: Omit<Alert, 'id' | 'read' | 'timestamp'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  setAlerts: (alerts: Alert[]) => void
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  unreadCount: 0,
  
  addAlert: (alertData) => set((state) => {
    const newAlert: Alert = {
      ...alertData,
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString()
    }
    const newAlerts = [newAlert, ...state.alerts]
    return {
      alerts: newAlerts,
      unreadCount: newAlerts.filter(a => !a.read).length
    }
  }),
  
  markRead: (id) => set((state) => {
    const newAlerts = state.alerts.map(a => 
      a.id === id ? { ...a, read: true } : a
    )
    return {
      alerts: newAlerts,
      unreadCount: newAlerts.filter(a => !a.read).length
    }
  }),
  
  markAllRead: () => set((state) => ({
    alerts: state.alerts.map(a => ({ ...a, read: true })),
    unreadCount: 0
  })),
  
  setAlerts: (alerts) => set({
    alerts,
    unreadCount: alerts.filter(a => !a.read).length
  })
}))
