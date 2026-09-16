import { useEffect, useRef } from 'react';
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { useAlertStore } from '../stores/alertStore';
import { database } from '../db';

// ─── DEV BYPASS ───────────────────────────────────────────────────────────
// Skip auth check for notification testing. Remove before production.
const DEV_BYPASS_AUTH = true;
const DEV_MINE_ID = '00000000-0000-0000-0000-000000000004';
const DEV_USER_ID = '00000000-0000-0000-0000-000000000010';
// ───────────────────────────────────────────────────────────────────────────

export function useRealtimeAlerts() {
  const { session, user, mineId } = useAuthStore();
  const addAlert = useAlertStore((state) => state.addAlert);

  useEffect(() => {
    // ─── DEV BYPASS: use hardcoded values if DEV_BYPASS_AUTH is true ───
    const effectiveMineId = DEV_BYPASS_AUTH ? DEV_MINE_ID : mineId;
    const effectiveUserId = DEV_BYPASS_AUTH ? DEV_USER_ID : user?.id;
    // ──────────────────────────────────────────────────────────
    console.log('[REALTIME] useRealtimeAlerts effect fired', { session: !!session, effectiveMineId, effectiveUserId });
    if (!effectiveMineId) {
      console.warn('[REALTIME] Skipping subscription — no mineId', { mineId, DEV_BYPASS_AUTH });
      return;
    }

    const channelName = `mine_alerts_${effectiveMineId}`;
    console.log('[REALTIME] Subscribing to channel:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `mine_id=eq.${effectiveMineId}`,
        },
        async (payload) => {
          console.log('[REALTIME] ✅ Postgres change received!', payload.new);
          const newAlert = payload.new;
          
          // Filter to only this user's alerts (string-safe comparison)
          if (newAlert.target_user_id && String(newAlert.target_user_id) !== String(effectiveUserId)) {
            console.log('[REALTIME] Skipping alert — target_user_id mismatch', {
              target: newAlert.target_user_id,
              current: effectiveUserId,
            });
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
            console.log('[REALTIME] ✅ Alert saved to WatermelonDB');
          } catch (e) {
            console.error('[REALTIME] ❌ Failed to save notification to local DB:', e);
          }

          // Trigger Notifee alarm for critical alerts
          if (newAlert.priority === 'critical') {
            console.log('[REALTIME] 🚨 Triggering critical alarm via Notifee...');
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
      .subscribe((status, err) => {
        console.log(`[REALTIME] Channel "${channelName}" status:`, status, err ?? '');
        if (err) {
          console.error('[REALTIME] ❌ Subscription error details:', JSON.stringify(err));
        }
        if (status === 'SUBSCRIBED') {
          console.log('[REALTIME] ✅ Successfully subscribed. Waiting for DB changes...');
        }
        if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.warn('[REALTIME] ⚠️ Retrying subscription in 3s...');
          setTimeout(() => {
            supabase.removeChannel(channel);
          }, 3000);
        }
      });

    return () => {
      console.log('[REALTIME] Removing channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [session, user, mineId]);
}
