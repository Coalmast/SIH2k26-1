import * as Notifications from 'expo-notifications';
import { useAlertStore } from '../stores/alertStore';

// Set global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Initialize Expo Notifications and register listeners
 */
export function setupNotifications() {
  // Listener for foreground notifications
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    const data = notification.request.content.data;
    
    // Check if it's a critical alert payload
    if (data && data.type === 'CRITICAL') {
      useAlertStore.getState().addAlert({
        id: data.id || Math.random().toString(),
        type: 'CRITICAL',
        title: data.title || notification.request.content.title || 'CRITICAL ALARM',
        message: data.message || notification.request.content.body || 'Immediate evacuation required.',
        timestamp: new Date().toISOString(),
        mineId: data.mineId || 'unknown',
        remoteId: data.remoteId
      });
    } else if (data && data.type === 'WARNING') {
      useAlertStore.getState().addAlert({
        id: data.id || Math.random().toString(),
        type: 'WARNING',
        title: data.title || notification.request.content.title || 'Warning',
        message: data.message || notification.request.content.body || 'Please check the dashboard.',
        timestamp: new Date().toISOString(),
        mineId: data.mineId || 'unknown',
        remoteId: data.remoteId
      });
    }
  });

  // Listener for user tapping on a notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('User tapped notification:', response.notification.request.content.data);
    // Could navigate to a specific screen based on payload
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Request notification permissions from the OS
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return false;
  }
  
  return true;
}
