import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/stores/authStore';
import { DEMO_USERS } from '../../src/lib/demoAuth';
import { checkBackendHealth } from '../../src/lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const setAuth = useAuthStore(state => state.setAuth);

  const handleLogin = async (role: 'mine_manager' | 'field_officer') => {
    setLoadingRole(role);

    try {
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        Alert.alert(
          'Connection Error',
          'The backend server is unreachable. Please click the gear icon in the top right to configure the dynamic URLs in Dev Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      const demoUser = DEMO_USERS[role];
      const session = {
        access_token: demoUser.token,
        refresh_token: '',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: demoUser.userId, role: demoUser.role, email: '', app_metadata: {}, user_metadata: {}, aud: '', created_at: '' }
      };

      const user = {
        id: demoUser.userId,
        email: '',
        role: demoUser.role,
        mineId: demoUser.mineId,
        name: demoUser.name
      };

      // Call the existing setAuth method
      setAuth(session as any, user, demoUser.role, demoUser.mineId, demoUser.mineName);

      // The _layout.tsx in root listens to auth state changes, but we also push to be safe
      router.replace('/(app)/home');
    } catch (e) {
      Alert.alert('Error', 'Failed to login demo user');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-comet-canvas">
      <TouchableOpacity 
        className="absolute top-12 right-6 p-2 z-10"
        onPress={() => router.push('/(auth)/dev-settings')}
      >
        <Ionicons name="settings-outline" size={28} color="#848E9C" />
      </TouchableOpacity>

      <View className="mb-12 items-center">
        <Text className="text-comet-orange font-bold text-5xl mb-2 tracking-tighter">COMET</Text>
        <Text className="text-comet-fg-muted text-lg">Demo Mode</Text>
      </View>

      <Text className="text-comet-fg font-bold text-2xl mb-6 text-center">Select Role</Text>

      <View className="gap-6">
        {/* Mine Manager Card */}
        <TouchableOpacity
          onPress={() => handleLogin('mine_manager')}
          disabled={loadingRole !== null}
        >
          <Card className={`p-6 flex-row items-center gap-4 ${loadingRole === 'mine_manager' ? 'opacity-50' : ''}`}>
            <View className="w-12 h-12 bg-comet-orange/20 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark" size={24} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-comet-fg font-bold text-xl mb-1">Mine Manager</Text>
              <Text className="text-comet-fg-muted text-sm">{DEMO_USERS.mine_manager.name} • {DEMO_USERS.mine_manager.mineName}</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Field Officer Card */}
        <TouchableOpacity
          onPress={() => handleLogin('field_officer')}
          disabled={loadingRole !== null}
        >
          <Card className={`p-6 flex-row items-center gap-4 ${loadingRole === 'field_officer' ? 'opacity-50' : ''}`}>
            <View className="w-12 h-12 bg-comet-muted rounded-full items-center justify-center">
              <Ionicons name="search" size={24} color="#a8a29e" />
            </View>
            <View className="flex-1">
              <Text className="text-comet-fg font-bold text-xl mb-1">Field Officer</Text>
              <Text className="text-comet-fg-muted text-sm">{DEMO_USERS.field_officer.name} • {DEMO_USERS.field_officer.mineName}</Text>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    </View>
  );
}
