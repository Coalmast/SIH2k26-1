import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { useAuthStore } from '../../../src/stores/authStore';

export default function HomeScreen() {
  const user = useAuthStore(state => state.user);

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <View className="mb-6">
        <Text className="text-binance-on-dark text-3xl font-bold">Dashboard</Text>
        <Text className="text-binance-muted-strong mt-1">Welcome back, {user?.email || 'User'}</Text>
      </View>

      <Card className="mb-4 bg-binance-primary">
        <Text className="text-binance-primary text-xl font-bold mb-2">Start Shift</Text>
        <Text className="text-binance-primary mb-4">Complete your attendance and baseline gas readings.</Text>
        <Button variant="secondary" onPress={() => router.push('/(app)/attendance')}>
          Mark Attendance
        </Button>
      </Card>

      <View className="flex-row gap-4 mb-6">
        <Card className="flex-1">
          <Text className="text-binance-primary text-3xl font-bold mb-1">3</Text>
          <Text className="text-binance-muted-strong text-sm">Pending Tasks</Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-binance-primary text-3xl font-bold mb-1">2</Text>
          <Text className="text-binance-muted-strong text-sm">Draft Reports</Text>
        </Card>
      </View>

      <Text className="text-binance-on-dark text-xl font-bold mb-4">Quick Actions</Text>
      
      <View className="gap-4">
        <Button variant="outline" onPress={() => router.push('/(app)/inspect')} className="w-full justify-start py-4">
          <Text className="text-binance-on-dark font-semibold">🔍 New Inspection</Text>
        </Button>
        <Button variant="outline" onPress={() => router.push('/(app)/report')} className="w-full justify-start py-4">
          <Text className="text-binance-on-dark font-semibold">⚠️ Report Incident</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
