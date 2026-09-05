import React from 'react';
import { Tabs } from 'expo-router';
import { Home, ClipboardList, AlertTriangle, User } from 'lucide-react-native';
import CriticalAlarmModal from '../../src/components/CriticalAlarmModal';

export default function AppLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#0b0e11', borderBottomWidth: 1, borderBottomColor: '#2b3139' },
          headerTintColor: '#fcd535',
          tabBarStyle: { backgroundColor: '#1e2329', borderTopWidth: 1, borderTopColor: '#2b3139' },
          tabBarActiveTintColor: '#fcd535',
          tabBarInactiveTintColor: '#707a8a',
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="inspect"
          options={{
            title: 'Inspections',
            headerShown: false,
            tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Reports',
            headerShown: false, // The stack layout handles the headers
            tabBarIcon: ({ color }) => <AlertTriangle size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false, // The stack layout handles the headers
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            href: null, // Hidden from tabs
          }}
        />
      </Tabs>
      <CriticalAlarmModal />
    </>
  );
}

