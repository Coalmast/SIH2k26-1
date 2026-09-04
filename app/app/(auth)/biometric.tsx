import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/authStore';

export default function BiometricScreen() {
  const setOfflineAuthenticated = useAuthStore(state => state.setOfflineAuthenticated);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Not Available', 'Biometric authentication is not set up on this device.', [
        { text: 'Use Password Instead', onPress: () => router.replace('/(auth)/login') }
      ]);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock COMET Field App',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      setOfflineAuthenticated(true);
      router.replace('/(app)/home');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-binance-canvas-dark px-6">
      <Text className="text-binance-primary font-bold text-3xl mb-8">Unlock COMET</Text>
      
      <Button onPress={authenticate} className="w-full mb-4" size="lg">
        Use Fingerprint / Face ID
      </Button>

      <Button variant="ghost" onPress={() => router.replace('/(auth)/login')} className="w-full">
        Log in with Password
      </Button>
    </View>
  );
}
