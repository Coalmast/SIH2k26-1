import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { router } from 'expo-router';

export default function AttendanceScreen() {
  return (
    <View className="flex-1 bg-binance-canvas-dark px-4 py-6">
      <Text className="text-binance-on-dark text-3xl font-bold mb-6">Attendance</Text>
      
      <Card className="mb-6">
        <Text className="text-binance-on-dark font-bold text-xl mb-4">Mark Attendance</Text>
        <Text className="text-binance-muted-strong mb-6">Scan QR code at the mine entrance.</Text>
        
        <Button className="w-full">
          Scan QR Code
        </Button>
      </Card>

      <Button variant="ghost" onPress={() => router.back()}>
        Back to Home
      </Button>
    </View>
  );
}
