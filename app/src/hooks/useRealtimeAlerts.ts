import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAlertStore } from '../stores/alertStore';
import { database } from '../db';

export function useRealtimeAlerts() {
  const { session, user, mineId } = useAuthStore();
  const addAlert = useAlertStore((state) => state.addAlert);

  useEffect(() => {
    if (!session || !mineId) return;

    const channel = supabase
      .channel(`mine_alerts_${mineId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `mine_id=eq.${mineId}`,
        },
        async (payload) => {
          const newAlert = payload.new;
          
          // Filter to only this user's alerts (string-safe comparison)
          if (newAlert.target_user_id && String(newAlert.target_user_id) !== String(user?.id)) {
            return;
          }

          // Insert into local WatermelonDB
          try {
            await database.write(async () => {
              await database.get('notifications').create((n: any) => {
                n.remoteId = newAlert.id;
                n.type = newAlert.type;
                n.priority = newAlert.priority;
                n.title = newAlert.title;
                n.message = newAlert.message;
                n.targetUserId = newAlert.target_user_id;
                n.mineId = newAlert.mine_id;
                n.entityType = newAlert.entity_type;
                n.entityId = newAlert.entity_id;
                n.status = 'unread';
                n.syncStatus = 'synced'; // came from server
              });
            });
          } catch (e) {
            console.error('Failed to save notification to local DB:', e);
          }

          // Trigger Notifee alarm for critical alerts
          if (newAlert.priority === 'critical') {
            const notifee = require('@notifee/react-native').default;
            const { AndroidImportance, AndroidCategory } = require('@notifee/react-native');
            
            await notifee.displayNotification({
              title: `🚨 ${newAlert.title || 'CRITICAL ALARM'}`,
              body: newAlert.message || 'Evacuate immediately.',
              android: {
                channelId: 'comet_critical_alarm',
                importance: AndroidImportance.HIGH,
                category: AndroidCategory.ALARM,
                fullScreenAction: { id: 'default' },
                ongoing: true,
                autoCancel: false,
                actions: [{ title: '✅ Acknowledge & Evacuating', pressAction: { id: 'acknowledge' } }],
              },
              ios: { critical: true, criticalVolume: 1.0, sound: 'comet_alarm.wav', interruptionLevel: 'critical' },
            });
          }

          addAlert({
            id: newAlert.id,
            remoteId: newAlert.id,
            type: newAlert.priority === 'critical' ? 'CRITICAL' : 'WARNING',
            title: newAlert.title,
            message: newAlert.message,
            timestamp: newAlert.created_at,
            mineId: newAlert.mine_id,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, user, mineId]);
}
