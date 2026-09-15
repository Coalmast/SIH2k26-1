import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { database } from '../../../src/db';
import { Notification } from '../../../src/db/models';
import withObservables from '@nozbe/with-observables';
import { Bell, AlertTriangle } from 'lucide-react-native';
import { Q } from '@nozbe/watermelondb';

const NotificationItem = ({ notification }: { notification: Notification }) => {
  return (
    <View style={[styles.itemContainer, notification.status === 'unread' && styles.unreadItem]}>
      <View style={styles.iconContainer}>
        {notification.priority === 'critical' ? (
          <AlertTriangle size={24} color="#dc2626" />
        ) : (
          <Bell size={24} color="#2563eb" />
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>{new Date(notification.createdAt).toLocaleString()}</Text>
      </View>
      {notification.status === 'unread' && <View style={styles.unreadDot} />}
    </View>
  );
};

const EnhancedNotificationItem = withObservables(['notification'], ({ notification }) => ({
  notification: notification.observe(),
}))(NotificationItem);

const NotificationsScreen = ({ notifications }: { notifications: Notification[] }) => {
  const markAllAsRead = async () => {
    await database.write(async () => {
      const unread = await database.collections.get('notifications').query(Q.where('status', 'unread')).fetch();
      for (const notif of unread) {
        await notif.update((n: any) => {
          n.status = 'read';
          n.syncStatus = 'pending_ack';
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Notifications',
          headerRight: () => (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#4b5563" />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EnhancedNotificationItem notification={item} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const enhance = withObservables([], () => ({
  notifications: database.collections.get('notifications').query(Q.sortBy('created_at', Q.desc)).observe(),
}));

export default enhance(NotificationsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0e11',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1e2329',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2b3139',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#262b32',
    borderColor: '#4b5563',
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  time: {
    color: '#6b7280',
    fontSize: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: 16,
    fontSize: 16,
  },
  markReadText: {
    color: '#3b82f6',
    fontSize: 16,
    marginRight: 16,
  },
});
