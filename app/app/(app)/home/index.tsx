import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useAuthStore } from '../../../src/stores/authStore';
import { useInspectionList } from '../../../src/hooks/useInspectionApi';

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);
  const mineId = useAuthStore(state => state.mineId);
  const mineName = useAuthStore(state => state.mineName);
  const { active, completed } = useInspectionList(mineId || '');

  return (
    <ScrollView className="flex-1 bg-comet-canvas px-4 py-6">
      <View className="mb-6">
        <Text className="text-comet-fg text-3xl font-bold">Dashboard</Text>
        <Text className="text-comet-fg-muted mt-1">Welcome back, {user?.name || 'User'}</Text>
      </View>

      <View className="mb-4">
        <Card>
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-comet-fg-muted font-bold text-xs mb-1 uppercase tracking-wider">Current Site</Text>
              <Text className="text-comet-fg text-xl font-bold">{mineName || 'Headquarters'}</Text>
            </View>
            <View className="bg-comet-up/20 px-2 py-1 rounded">
              <Text className="text-comet-up text-xs font-bold">ONLINE</Text>
            </View>
          </View>
          <Text className="text-comet-fg-muted text-sm">All systems operational. Data is synced.</Text>
        </Card>
      </View>

      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1">
          <Text className="text-comet-orange text-3xl font-bold mb-1 font-mono">{active?.length || 0}</Text>
          <Text className="text-comet-fg-muted text-sm">Active Inspections</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-comet-orange text-3xl font-bold mb-1 font-mono">{completed?.length || 0}</Text>
          <Text className="text-comet-fg-muted text-sm">Completed Inspections</Text>
        </Card>
      </View>

      <View>
        <Text className="text-comet-fg text-xl font-bold mb-4">Quick Actions</Text>
        
        <View className="gap-4">
          <Button variant="outline" onPress={() => router.push('/(app)/grievance')} className="w-full justify-start py-4">
            <Text className="text-comet-fg font-semibold">🎙️ Voice Grievance</Text>
          </Button>
          <Button variant="outline" onPress={() => router.push('/(app)/inspect')} className="w-full justify-start py-4">
            <Text className="text-comet-fg font-semibold">🔍 New Inspection</Text>
          </Button>
          <Button variant="outline" onPress={() => router.push('/(app)/mark-attendance')} className="w-full justify-start py-4">
            <Text className="text-comet-fg font-semibold">📋 Mark Attendance</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
