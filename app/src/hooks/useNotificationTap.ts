import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAlertStore } from '../stores/alertStore';

export function useNotificationTap() {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const router = useRouter();
  const acknowledgeAlert = useAlertStore(state => state.acknowledgeAlert);

  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.alert_id &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const data = lastNotificationResponse.notification.request.content.data;
      
      // If the user tapped the notification, they have "read" it, so we can
      // automatically acknowledge it to clear it from the backend unread count.
      if (data.alert_id) {
        acknowledgeAlert(data.alert_id).catch(() => {});
      }
      
      // Navigate to the notifications inbox or specific entity screen
      if (data.entity_type && data.entity_id) {
        // Here you could router.push to the specific entity
        // router.push(`/(app)/entity/${data.entity_type}/${data.entity_id}`);
      } else {
        router.push('/(app)/home/notifications');
      }
    }
  }, [lastNotificationResponse]);
}
