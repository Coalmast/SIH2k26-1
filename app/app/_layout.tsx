import 'react-native-reanimated';
import '../global.css';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/src/context/AuthContext';
import { bootstrapNotifications } from '@/src/lib/notifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Bootstrap Notifee channels on mount
    bootstrapNotifications();
    
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <UIThemeProvider>
            <AuthProvider> {/* ✅ Wrap everything with AuthProvider */}
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </AuthProvider>
          </UIThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
