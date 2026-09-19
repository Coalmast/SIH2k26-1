import React from 'react';
import { Stack } from 'expo-router';

export default function ReportLayout() {
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
      <Stack.Screen name="incident" options={{ title: 'Report Incident', presentation: 'modal' }} />
      <Stack.Screen name="observation" options={{ title: 'Safety Observation', presentation: 'modal' }} />
      <Stack.Screen name="shift" options={{ title: 'Shift Report', presentation: 'modal' }} />
    </Stack>
  );
}
