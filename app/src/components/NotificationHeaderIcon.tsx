import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { database } from '../db';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';

const NotificationHeaderIcon = ({ unreadCount }: { unreadCount: number }) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => router.push('/(app)/home/notifications')}
    >
      <Bell size={24} color="#f97316" />
      <View style={[styles.badge, { opacity: unreadCount > 0 ? 1 : 0 }]}>
        <Text style={styles.badgeText}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const enhance = withObservables([], () => ({
  unreadCount: database.collections.get('notifications').query(Q.where('status', 'unread')).observeCount(),
}));

export default enhance(NotificationHeaderIcon);

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
