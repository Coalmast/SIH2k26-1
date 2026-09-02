import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';
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
    vibrationPattern: [0, 500, 300, 500, 300, 500],
  });
}

// Register device token with backend after login
export async function registerAndSyncPushToken(apiBase: string, accessToken: string) {
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  
  if (!apiBase || !accessToken) return;

  try {
    await fetch(`${apiBase}/api/v1/users/me/push-token`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ expo_push_token: token }),
    });
  } catch (error) {
    console.error('Failed to sync push token:', error);
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
