import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { ShieldAlert, Fingerprint, LogOut, KeyRound } from 'lucide-react-native';

export default function BiometricReAuthScreen() {
  const router = useRouter();

  async function handleAuthenticate() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Underground Re-Authentication',
        fallbackLabel: 'Use PIN instead',
      });

      if (result.success) {
        // Handle session restoration logic here
        // For now, redirect to the app
        router.replace('/(app)/home');
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed');
    }
  }

  function handleSignOut() {
    // Should clear session and go to login
    router.replace('/(auth)/login');
  }

  return (
    <View className="flex-1 bg-navy dark:bg-navy-dark px-6 justify-center items-center">
      <View className="items-center mb-10">
        <ShieldAlert color="#F59E0B" size={80} className="mb-4" />
        <Text className="text-white text-2xl font-bold text-center mb-2">
          Underground Re-Authentication
        </Text>
        <Text className="text-white/80 text-center text-base px-4">
          You are offline. Use biometric to resume your session.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-40 h-40 bg-white/10 rounded-full items-center justify-center border-2 border-white/20 mb-8"
        onPress={handleAuthenticate}
      >
        <Fingerprint color="white" size={64} />
        <Text className="text-white text-sm mt-4">Touch to authenticate</Text>
      </TouchableOpacity>

      <View className="bg-white/5 rounded-lg w-full p-4 mb-8">
        <Text className="text-white/60 text-sm mb-1">Last sync: 2h 14m ago</Text>
        <Text className="text-white font-medium">Mine: Rajmahal OCP</Text>
      </View>

      <View className="w-full space-y-3">
        <TouchableOpacity 
          className="border border-white/30 rounded-lg py-3 flex-row items-center justify-center"
          onPress={handleAuthenticate}
        >
          <KeyRound color="white" size={18} className="mr-2" />
          <Text className="text-white text-base">Use PIN instead</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="py-3 flex-row items-center justify-center mt-2"
          onPress={handleSignOut}
        >
          <LogOut color="#ef4444" size={18} className="mr-2" />
          <Text className="text-[#ef4444] text-base">Sign out & return online</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
