import React from 'react';
import { Stack } from 'expo-router';

export default function InspectLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0a0908', // black bar
        },
        headerTintColor: '#ffffff', // white text
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="start" options={{ title: 'Start Inspection', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
