import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState } from 'react-native';

import { AuthProvider } from '../src/context/AuthContext';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { bootstrapNotifications } from '../src/lib/notifications';
import { useConnectivity } from '../src/hooks/useConnectivity';
import { performSync } from '../src/sync/syncEngine';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isOnline } = useConnectivity();
  const appState = useRef(AppState.currentState);
  
  useEffect(() => {
    bootstrapNotifications();
  }, []);

  useEffect(() => {
    if (isOnline) {
      performSync();
    }
  }, [isOnline]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isOnline) {
          performSync();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isOnline]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b0e11' } }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
