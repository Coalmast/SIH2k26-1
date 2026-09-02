import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Search, AlertTriangle, Users, User } from 'lucide-react-native';
import { View, Text } from 'react-native';

function OfflineBanner() {
  // Placeholder for the offline banner
  return (
    <View className="bg-amber-500 py-1 items-center justify-center">
      <Text className="text-white text-xs font-bold">Offline Banner Placeholder</Text>
    </View>
  );
}

export default function AppLayout() {
  return (
    <View className="flex-1">
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: '#1E3A5F' },
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#F59E0B',
          tabBarInactiveTintColor: '#9ca3af',
          tabBarStyle: { backgroundColor: '#152C47', borderTopWidth: 0 },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="inspect"
          options={{
            title: 'Inspect',
            tabBarIcon: ({ color }) => <Search color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="report"
          options={{
            title: 'Report',
            tabBarIcon: ({ color }) => <AlertTriangle color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>
    </View>
  );
}
