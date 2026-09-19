import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthInit } from '../src/context/AuthContext';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isInitialized } = useAuthInit();
  const session = useAuthStore((state) => state.session);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0e11' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
