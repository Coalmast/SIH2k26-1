/**
 * useRealtimeAlerts.ts
 * --------------------
 * Subscribes to the Supabase Realtime `alerts` table for the current mine.
 * On INSERT, pops a toast notification on the web dashboard.
 *
 * Routing logic mirrors the backend notification_service.py:
 *   critical → destructive red toast with siren icon, 10-second duration
 *   high     → warning amber toast, 6-second duration
 *   medium   → standard toast, 4-second duration
 *   info     → subtle toast, 3-second duration
 *
 * Usage:
 *   Place this hook once in the dashboard layout component.
 *   It self-manages the Supabase Realtime channel subscription.
 */

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'          // Sonner is the toast lib used in shadcn/ui
import { supabase } from '@/lib/supabase'

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type AlertPriority = 'critical' | 'high' | 'medium' | 'low' | 'info'

interface AlertPayload {
  id: string
  priority: AlertPriority
  type: string
  title: string
  message: string
  entity_type?: string
  entity_id?: string
  mine_id?: string
}

interface UseRealtimeAlertsOptions {
  mineId: string | null
  /** Called when a new alert arrives — useful for badge counters */
  onNewAlert?: (alert: AlertPayload) => void
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

export function useRealtimeAlerts({ mineId, onNewAlert }: UseRealtimeAlertsOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    if (!mineId) return

    // Clean up any previous subscription before creating a new one
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`alerts:mine_id=eq.${mineId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'alerts',
          filter: `mine_id=eq.${mineId}`,
        },
        (payload: any) => {
          const alert = payload.new as AlertPayload
          showAlertToast(alert)
          onNewAlert?.(alert)
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [mineId, onNewAlert])
}

// --------------------------------------------------------------------------
// Toast renderer
// --------------------------------------------------------------------------

function showAlertToast(alert: AlertPayload) {
  const config = getToastConfig(alert.priority)

  const toastFn = config.fn

  toastFn(alert.title, {
    description: alert.message,
    duration:    config.duration,
    icon:        config.icon,
    // Deep-link: clicking the toast navigates to the related entity
    action: alert.entity_type && alert.entity_id
      ? {
          label: 'View',
          onClick: () => navigateToEntity(alert.entity_type!, alert.entity_id!),
        }
      : undefined,
    // Critical alerts cannot be dismissed by clicking — require explicit close
    dismissible: alert.priority !== 'critical',
  })
}

function getToastConfig(priority: AlertPriority): {
  fn: any
  duration: number
  icon: string
} {
  switch (priority) {
    case 'critical':
      return { fn: toast.error,   duration: 10_000, icon: '🚨' }
    case 'high':
      return { fn: toast.warning, duration:  6_000, icon: '⚠️' }
    case 'medium':
      return { fn: toast,         duration:  4_000, icon: '🔔' }
    case 'low':
    case 'info':
    default:
      return { fn: toast,         duration:  3_000, icon: 'ℹ️' }
  }
}

function navigateToEntity(entityType: string, entityId: string) {
  const routeMap: Record<string, string> = {
    compliance_instance: `/compliance/${entityId}`,
    corrective_action:   `/inspections/capa/${entityId}`,
    incident_report:     `/incidents/${entityId}`,
    contractor_document: `/contractors/docs/${entityId}`,
    statutory_report:    `/reports/${entityId}`,
    gas_reading:         `/dashboard`,
  }
  const path = routeMap[entityType] ?? '/dashboard'
  window.location.href = path
}
