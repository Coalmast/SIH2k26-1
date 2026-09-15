import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance, AndroidCategory, EventType } from '@notifee/react-native';
import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager';

// Show banner even when app is open
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.comet_alarm === 'true';
    // Critical alarms are handled by Notifee (Tier 3), not shown here
    if (isAlarm) return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false };

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Listen for foreground notifications so they trigger even when app is open
Notifications.addNotificationReceivedListener(async (notification) => {
  const payload = notification.request.content.data;
  if (payload?.comet_alarm === 'true') {
    await notifee.displayNotification({
      title: `🚨 ${payload.title || notification.request.content.title || 'CRITICAL ALARM'}`,
      body: payload.body || notification.request.content.body || 'Evacuate immediately.',
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
});

// Setup channels for Notifee
export async function bootstrapNotifications() {
  // Standard channel — normal priority
  await notifee.createChannel({
    id: 'comet_standard',
    name: 'COMET Alerts',
    importance: AndroidImportance.HIGH,
  });

  // Critical alarm channel — bypasses DND, siren sound
  await notifee.createChannel({
    id: 'comet_critical_alarm',
    name: 'COMET Emergency Alarms',
    importance: AndroidImportance.HIGH,
    sound: 'comet_alarm',              // requires comet_alarm.wav in android/app/src/main/res/raw/
    bypassDnd: true,
    vibration: true,
    vibrationPattern: [300, 500, 300, 500],
  });
}

import AsyncStorage from '@react-native-async-storage/async-storage';

notifee.onForegroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction?.id === 'acknowledge') {
    const alertId = detail.notification?.data?.alert_id;
    if (detail.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
    if (alertId) {
      const apiUrl = await AsyncStorage.getItem('DEV_API_URL')
        .catch(() => process.env.EXPO_PUBLIC_API_URL);
      fetch(`${apiUrl}/api/v1/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  }
});

// Register device token with backend after login
export async function registerAndSyncPushToken(apiBase: string, accessToken: string) {
  // NOTE: Expo Push Token sync via FCM is disabled in dev builds because
  // getExpoPushTokenAsync requires valid FCM server credentials to be uploaded
  // to Expo EAS (not just google-services.json). Alarm delivery in this build
  // uses Supabase Realtime instead, which works without FCM.
  // To re-enable: upload FCM credentials to EAS and remove this early return.
  try {
    // Request permissions only (for Notifee channels to work)
    await notifee.requestPermission();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }
    console.log('[COMET] Notification permissions requested. Alarm delivery via Realtime is active.');
  } catch (error) {
    console.error('FATAL ERROR in registerAndSyncPushToken:', error);
  }
}

// Register background handler for critical alarms
Notifications.registerTaskAsync('BACKGROUND_NOTIFICATION_TASK');

TaskManager.defineTask('BACKGROUND_NOTIFICATION_TASK', async ({ data, error }) => {
  if (error) {
    console.error('Background task error:', error);
    return;
  }
  
  const notification = data as any;
  const payload = notification?.notification?.request?.content?.data;

  if (payload?.comet_alarm === 'true') {
    // Hand off to Notifee for critical alarm
    await notifee.displayNotification({
      title: `🚨 ${payload.title || 'CRITICAL ALARM'}`,
      body: payload.body || 'Evacuate immediately.',
      android: {
        channelId: 'comet_critical_alarm',
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.ALARM,
        fullScreenAction: { id: 'default' },  // Launch fullscreen even on lock screen
        ongoing: true,                         // Cannot be swiped away
        autoCancel: false,
        actions: [{
          title: '✅ Acknowledge & Evacuating',
          pressAction: { id: 'acknowledge' },
        }],
      },
      ios: {
        critical: true,           // Requires Apple entitlement
        criticalVolume: 1.0,
        sound: 'comet_alarm.wav',
        interruptionLevel: 'critical',
      },
    });
  }
});
