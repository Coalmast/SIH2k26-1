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
import { useColorScheme } from 'nativewind';
import { useFonts } from 'expo-font';
import { Geist_400Regular, Geist_600SemiBold, Geist_700Bold } from '@expo-google-fonts/geist';
import { GeistMono_400Regular, GeistMono_500Medium, GeistMono_600SemiBold, GeistMono_700Bold } from '@expo-google-fonts/geist-mono';
import '../global.css';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isOnline } = useConnectivity();
  const appState = useRef(AppState.currentState);
  const { colorScheme } = useColorScheme();
  
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
    GeistMono_500Medium,
    GeistMono_600SemiBold,
    GeistMono_700Bold,
  });
  
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

  if (!fontsLoaded) {
    return null; // Or a splash screen
  }

  // Canvas background colors from COMET Design.md
  const isDark = colorScheme === 'dark';
  const canvasBackgroundColor = isDark ? '#0f0d0c' : '#f2ede8';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: canvasBackgroundColor } }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
