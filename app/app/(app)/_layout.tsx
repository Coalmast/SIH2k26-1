import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, AlertTriangle, User } from 'lucide-react-native';
import CriticalAlarmModal from '../../src/components/CriticalAlarmModal';
import { InAppNotificationToast } from '../../src/components/InAppNotificationToast';
import { useRealtimeAlerts } from '../../src/hooks/useRealtimeAlerts';
import { useNotificationTap } from '../../src/hooks/useNotificationTap';
import NotificationHeaderIcon from '../../src/components/NotificationHeaderIcon';

import { useColorScheme } from 'nativewind';

export default function AppLayout() {
  useRealtimeAlerts();
  useNotificationTap();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const headerBg = '#0a0908';
  const headerBorder = '#0a0908';
  
  const tabBarBg = isDark ? '#0a0908' : '#18181b';
  const tabBarBorder = isDark ? '#1e1a17' : '#27272a';
  
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: headerBg, borderBottomWidth: 1, borderBottomColor: headerBorder },
          headerTintColor: '#ffffff',
          tabBarStyle: { backgroundColor: tabBarBg, borderTopWidth: 1, borderTopColor: tabBarBorder },
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: isDark ? '#a8a29e' : '#78716c',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
            headerRight: () => <NotificationHeaderIcon />,
          }}
        />
        <Tabs.Screen
          name="inspect"
          options={{
            title: 'Inspections',
            headerRight: () => <NotificationHeaderIcon />,
            tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Reports',
            headerRight: () => <NotificationHeaderIcon />,
            tabBarIcon: ({ color }) => <AlertTriangle size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerRight: () => <NotificationHeaderIcon />,
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            href: null, // Hidden from tabs
          }}
        />
        <Tabs.Screen
          name="mark-attendance"
          options={{
            href: null, // Hidden from tabs
          }}
        />
      </Tabs>
      <CriticalAlarmModal />
      <InAppNotificationToast />
    </View>
  );
}

