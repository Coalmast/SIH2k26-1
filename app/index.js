import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Attempt to bypass read-only Event.NONE properties
if (typeof Event !== 'undefined') {
  try {
    Object.defineProperty(Event, 'NONE', { value: 0, writable: true, configurable: true });
  } catch (e) {}
  try {
    Object.defineProperty(Event.prototype, 'NONE', { value: 0, writable: true, configurable: true });
  } catch (e) {}
}

LogBox.ignoreLogs([
  'JSI SQLiteAdapter not available',
  'Cannot assign to read-only property',
]);

// Fetch overrides in the background
AsyncStorage.getItem('DEV_API_URL').then(apiUrl => {
  if (apiUrl) global.DEV_API_URL = apiUrl;
}).catch(() => {});

AsyncStorage.getItem('DEV_SUPABASE_URL').then(supabaseUrl => {
  if (supabaseUrl) global.DEV_SUPABASE_URL = supabaseUrl;
}).catch(() => {});

import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
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

import "expo-router/entry";
