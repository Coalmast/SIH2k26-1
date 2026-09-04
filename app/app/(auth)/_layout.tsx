import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b0e11' } }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="biometric" />
    </Stack>
  );
}
