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
        <View style={{ display: notification.priority === 'critical' ? 'flex' : 'none' }}>
          <AlertTriangle size={24} color="#dc2626" />
        </View>
        <View style={{ display: notification.priority === 'critical' ? 'none' : 'flex' }}>
          <Bell size={24} color="#2563eb" />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.time}>{new Date(notification.createdAt).toLocaleString()}</Text>
      </View>
      <View style={[styles.unreadDot, { display: notification.status === 'unread' ? 'flex' : 'none' }]} />
    </View>
  );
};

// NOTE: Do NOT wrap each FlatList item with withObservables.
// Under React Native's New Architecture (Fabric), a per-item observable causes
// the view node to re-insert into FlatList's recycler while it still has a parent,
// crashing with: "The specified child already has a parent".
// The outer `enhance` HOC already re-renders the whole list reactively via
// WatermelonDB, so individual item observation is redundant AND crash-prone.

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Bell size={48} color="#4b5563" />
    <Text style={styles.emptyText}>No notifications yet.</Text>
  </View>
);

const NotificationsScreen = ({ notifications }: { notifications: Notification[] }) => {
  React.useEffect(() => {
    // Seed initial notification for demo if empty
    if (notifications.length === 0) {
      const seedNotification = async () => {
        try {
          await database.write(async () => {
            const count = await database.collections.get('notifications').query().fetchCount();
            if (count === 0) {
              await database.get('notifications').create((n: any) => {
                n.remoteId = 'demo-seed-1';
                n.type = 'compliance_reminder';
                n.priority = 'high';
                n.title = 'Compliance Task Assigned';
                n.message = 'Monthly Environmental Monitoring Report is due on Sept 20. Please complete the air quality inspection at Umrer OCP.';
                n.status = 'unread';
                n.syncStatus = 'synced';
              });
            }
          });
        } catch (e) {
          console.error('Failed to seed notification', e);
        }
      };
      seedNotification();
    }
  }, [notifications.length]);

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
      
      <FlatList
        data={notifications}
        // Fabric requires stable keys. Do NOT append status to the key, 
        // otherwise view recycling crashes with "child already has a parent".
        keyExtractor={item => item.id}
        removeClippedSubviews={false}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={EmptyState}
      />
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
    backgroundColor: '#f2ede8',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#faf7f2',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d4cec5',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#e8e2da',
    borderColor: '#d4cec5',
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#1a1614',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#78716c',
    fontSize: 14,
    marginBottom: 8,
  },
  time: {
    color: '#78716c',
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
    color: '#78716c',
    marginTop: 16,
    fontSize: 16,
  },
  markReadText: {
    color: '#3b82f6',
    fontSize: 16,
    marginRight: 16,
  },
});
