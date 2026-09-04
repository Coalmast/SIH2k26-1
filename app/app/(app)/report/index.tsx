import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../src/components/ui/Card';

export default function ReportScreen() {
  return (
    <View className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <Text className="text-binance-on-dark text-3xl font-bold mb-6">Reports</Text>
      
      <Card>
        <Text className="text-binance-on-dark font-bold text-xl mb-2">Recent Reports</Text>
        <Text className="text-binance-muted-strong">No reports submitted yet.</Text>
      </Card>
    </View>
  );
}
