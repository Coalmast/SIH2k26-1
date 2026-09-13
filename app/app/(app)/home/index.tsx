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
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <View className="mb-6">
        <Text className="text-binance-on-dark text-3xl font-bold">Dashboard</Text>
        <Text className="text-binance-muted-strong mt-1">Welcome back, {user?.name || 'User'}</Text>
      </View>

      <View className="mb-4">
        <Card className="bg-[#1E2329] border border-[#2b3139]">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-binance-muted font-bold text-xs mb-1 uppercase tracking-wider">Current Site</Text>
              <Text className="text-binance-on-dark text-xl font-bold">{mineName || 'Headquarters'}</Text>
            </View>
            <View className="bg-green-500/20 px-2 py-1 rounded">
              <Text className="text-green-500 text-xs font-bold">ONLINE</Text>
            </View>
          </View>
          <Text className="text-binance-muted-strong text-sm">All systems operational. Data is synced.</Text>
        </Card>
      </View>

      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1">
          <Text className="text-binance-primary text-3xl font-bold mb-1">{active?.length || 0}</Text>
          <Text className="text-binance-muted-strong text-sm">Active Inspections</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-binance-primary text-3xl font-bold mb-1">{completed?.length || 0}</Text>
          <Text className="text-binance-muted-strong text-sm">Completed Inspections</Text>
        </Card>
      </View>

      <View>
        <Text className="text-binance-on-dark text-xl font-bold mb-4">Quick Actions</Text>
        
        <View className="gap-4">
          <Button variant="outline" onPress={() => router.push('/(app)/inspect')} className="w-full justify-start py-4">
            <Text className="text-binance-on-dark font-semibold">🔍 New Inspection</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
