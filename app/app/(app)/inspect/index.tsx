import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../../../src/components/ui/Card';

export default function InspectScreen() {
  return (
    <View className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <Text className="text-binance-on-dark text-3xl font-bold mb-6">Inspections</Text>
      
      <Card>
        <Text className="text-binance-on-dark font-bold text-xl mb-2">No active inspections</Text>
        <Text className="text-binance-muted-strong">Tap the new inspection button on the home screen to start one.</Text>
      </Card>
    </View>
  );
}
