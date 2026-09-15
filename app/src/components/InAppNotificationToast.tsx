import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAlertStore } from '../stores/alertStore';
import { Bell, AlertTriangle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function InAppNotificationToast() {
  const alerts = useAlertStore(state => state.activeAlerts);
  const removeAlert = useAlertStore(state => state.removeAlert);
  const router = useRouter();

  if (alerts.length === 0) return null;

  // Show only the most recent alert
  const alert = alerts[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.toast, alert.type === 'CRITICAL' ? styles.toastCritical : styles.toastWarning]}
        onPress={() => {
          removeAlert(alert.id);
          router.push('/(app)/home/notifications');
        }}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          {alert.type === 'CRITICAL' ? (
            <AlertTriangle size={24} color="white" />
          ) : (
            <Bell size={24} color="white" />
          )}
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{alert.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{alert.message}</Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => removeAlert(alert.id)}
        >
          <X size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  toastCritical: {
    backgroundColor: '#dc2626',
  },
  toastWarning: {
    backgroundColor: '#ea580c',
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
});
