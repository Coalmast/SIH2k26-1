/**
 * notifications.ts  (Mobile App — React Native / Expo)
 * ======================================================
 * Unified notification bootstrap for the COMET mobile field app.
 *
 * Two libraries are used with distinct responsibilities:
 *
 *   expo-notifications (via FCM)
 *     → Standard push alerts: compliance reminders, CAPA assignments,
 *       grievance updates, inspection schedules.
 *     → Handles background/foreground push delivery from FCM.
 *     → Token is registered on login and stored on the backend
 *       via PATCH /api/v1/users/me/push-token
 *
 *   Notifee  (react-native-notifee)
 *     → Critical emergency alarms: high CH₄ gas readings, fatal incidents.
 *     → Bypasses Android DND / silent mode via IMPORTANCE_HIGH channel.
 *     → Plays custom siren audio (comet_alarm.wav).
 *     → Shows a full-screen intent on locked Android screens.
 *     → Uses iOS critical alert entitlement to override Focus / Silent mode.
 *
 * Signal: The backend sets `comet_alarm: "true"` in the FCM data payload
 * for critical alerts. The FCM background message handler checks this flag
 * and delegates to Notifee instead of the standard expo-notifications path.
 *
 * Install:
 *   npx expo install expo-notifications expo-device expo-constants
 *   npm install @notifee/react-native
 *   (also requires Firebase config: google-services.json / GoogleService-Info.plist)
 */

import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  AuthorizationStatus,
  AndroidColor,
} from '@notifee/react-native'
import { Platform } from 'react-native'
import messaging from '@react-native-firebase/messaging'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHANNEL_CRITICAL = 'comet_critical'    // Notifee — bypasses DND
const CHANNEL_STANDARD = 'comet_standard'    // expo-notifications standard

// ---------------------------------------------------------------------------
// 1. Bootstrap (call once in App.tsx / _layout.tsx)
// ---------------------------------------------------------------------------

/**
 * Sets up all notification channels, requests permissions,
 * and registers background FCM message handler.
 *
 * Call this in your root layout's useEffect on app mount.
 */
export async function bootstrapNotifications(): Promise<void> {
  await _createNotifeeChannels()
  await _requestPermissions()
  await _registerFCMBackgroundHandler()
}

// ---------------------------------------------------------------------------
// 2. Register device token & sync to backend
// ---------------------------------------------------------------------------

/**
 * Gets the Expo push token (which wraps the FCM token on Android)
 * and PATCHes it to the backend so the notification_service can
 * look it up when dispatching alerts to this user.
 *
 * Call this after successful login.
 */
export async function registerAndSyncPushToken(
  backendApiBase: string,
  authToken: string,
): Promise<void> {
  if (!Device.isDevice) {
    console.warn('[NOTIFY] Push tokens only work on physical devices.')
    return
  }

  // Get Expo push token (maps to FCM token on Android, APNs on iOS)
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  if (!projectId) {
    console.warn('[NOTIFY] EAS projectId not found — cannot register push token.')
    return
  }

  const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({
    projectId,
  })

  // Also get the raw FCM token for direct HTTP v1 targeting from backend
  const fcmToken = await messaging().getToken()

  // Sync FCM token to backend
  try {
    await fetch(`${backendApiBase}/api/v1/users/me/push-token`, {
      method:  'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ fcm_push_token: fcmToken, expo_push_token: expoPushToken }),
    })
    console.log('[NOTIFY] Push token registered on backend.')
  } catch (err) {
    console.error('[NOTIFY] Failed to sync push token:', err)
  }
}

// ---------------------------------------------------------------------------
// 3. Foreground notification handler (expo-notifications)
// ---------------------------------------------------------------------------

/**
 * Configure expo-notifications to show alerts while the app is in foreground.
 * Call this before bootstrapNotifications() in App.tsx.
 */
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data ?? {}

    // If this is a critical alarm, let Notifee handle it
    // (Notifee will show its own full-screen UI)
    if (data['comet_alarm'] === 'true') {
      return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false }
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge:  true,
    }
  },
})

// ---------------------------------------------------------------------------
// 4. FCM background / quit state handler (Notifee for critical alarms)
// ---------------------------------------------------------------------------

async function _registerFCMBackgroundHandler(): Promise<void> {
  // This runs when the app receives an FCM data message while in background/quit
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const data = remoteMessage.data ?? {}

    if (data['comet_alarm'] === 'true') {
      // 🚨 Critical alarm path — bypass DND, play siren
      await _triggerCriticalAlarm({
        title:   data['title']   as string ?? '🚨 COMET Emergency Alert',
        body:    data['body']    as string ?? 'Critical mine safety event detected.',
        alertId: data['alert_id'] as string,
      })
    } else {
      // Standard path — display via Notifee on the standard channel
      await notifee.displayNotification({
        title: remoteMessage.notification?.title ?? data['title'] as string,
        body:  remoteMessage.notification?.body  ?? data['body']  as string,
        android: { channelId: CHANNEL_STANDARD, smallIcon: 'ic_notification' },
      })
    }
  })

  // Also handle foreground FCM messages (fires while app is open)
  messaging().onMessage(async (remoteMessage) => {
    const data = remoteMessage.data ?? {}
    if (data['comet_alarm'] === 'true') {
      await _triggerCriticalAlarm({
        title:   data['title']   as string ?? '🚨 COMET Emergency Alert',
        body:    data['body']    as string ?? 'Critical mine safety event detected.',
        alertId: data['alert_id'] as string,
      })
    }
    // Standard foreground alerts are handled by expo-notifications above
  })
}

// ---------------------------------------------------------------------------
// 5. Critical alarm trigger (Notifee)
// ---------------------------------------------------------------------------

interface AlarmPayload {
  title: string
  body: string
  alertId?: string
}

/**
 * Fires a Notifee critical alarm notification.
 *
 * Android: IMPORTANCE_HIGH channel, full-screen intent, custom vibration,
 *          plays comet_alarm.wav (must be in android/app/src/main/res/raw/).
 * iOS:     Uses critical alert sound (requires Apple entitlement:
 *          com.apple.developer.usernotifications.critical-alerts).
 */
async function _triggerCriticalAlarm(payload: AlarmPayload): Promise<void> {
  await notifee.displayNotification({
    title: payload.title,
    body:  payload.body,
    data:  { alert_id: payload.alertId ?? '' },

    android: {
      channelId:  CHANNEL_CRITICAL,
      smallIcon:  'ic_notification_critical',        // red icon in drawable
      color:      AndroidColor.RED,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,          // show on lock screen
      fullScreenAction: {
        // Opens CriticalAlarmScreen.tsx full-screen when device is locked
        id: 'default',
      },
      // Aggressive vibration pattern: wait 0ms, vibrate 500ms, pause 300ms, vibrate 500ms
      vibrationPattern: [0, 500, 300, 500],
      // Sound file must be in android/app/src/main/res/raw/comet_alarm.wav
      sound: 'comet_alarm',
      // Keep notification visible until user explicitly dismisses
      ongoing:     true,
      autoCancel:  false,
      // Show action buttons on the notification shade
      actions: [
        { title: 'Acknowledge', pressAction: { id: 'acknowledge' } },
        { title: 'View Details', pressAction: { id: 'view', launchActivity: 'default' } },
      ],
    },

    ios: {
      // Requires Apple critical alert entitlement in app.json / Xcode
      critical: true,
      criticalVolume: 1.0,
      sound: 'comet_alarm.wav',
      // Ensure notification appears even in Focus / Do Not Disturb
      interruptionLevel: 'critical',
    },
  })
}

// ---------------------------------------------------------------------------
// 6. Channel creation (Notifee — Android only)
// ---------------------------------------------------------------------------

async function _createNotifeeChannels(): Promise<void> {
  if (Platform.OS !== 'android') return

  // Critical alarm channel — bypasses DND
  await notifee.createChannel({
    id:          CHANNEL_CRITICAL,
    name:        'COMET Critical Alarms',
    description: 'Emergency safety alerts for mine incidents, gas readings, and critical breaches.',
    importance:  AndroidImportance.HIGH,
    // Bypass Do Not Disturb (requires MANAGE_DND_ACCESS permission or special app permission)
    bypassDnd:   true,
    vibration:   true,
    vibrationPattern: [0, 500, 300, 500],
    sound:       'comet_alarm',          // ./res/raw/comet_alarm.wav
    lights:      true,
    lightColor:  AndroidColor.RED,
  })

  // Standard channel — normal priority
  await notifee.createChannel({
    id:          CHANNEL_STANDARD,
    name:        'COMET Notifications',
    description: 'Compliance reminders, CAPA updates, and general platform alerts.',
    importance:  AndroidImportance.DEFAULT,
    vibration:   true,
    sound:       'default',
  })
}

// ---------------------------------------------------------------------------
// 7. Permission request
// ---------------------------------------------------------------------------

async function _requestPermissions(): Promise<void> {
  if (Platform.OS === 'ios') {
    const settings = await notifee.requestPermission({
      alert:           true,
      sound:           true,
      badge:           true,
      // criticalAlert requires Apple entitlement — will silently fail without it
      criticalAlert:   true,
      announcement:    false,
    })
    if (settings.authorizationStatus < AuthorizationStatus.AUTHORIZED) {
      console.warn('[NOTIFY] iOS notification permission denied.')
    }
  } else {
    // Android 13+ requires explicit POST_NOTIFICATIONS permission
    const { status } = await Notifications.requestPermissionsAsync()
    if (status !== 'granted') {
      console.warn('[NOTIFY] Android notification permission denied.')
    }
  }
}
