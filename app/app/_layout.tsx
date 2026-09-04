import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { bootstrapNotifications } from '../src/lib/notifications';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    bootstrapNotifications();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b0e11' } }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
