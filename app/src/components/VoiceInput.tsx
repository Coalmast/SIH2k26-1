import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function VoiceInput() {
  return (
    <View className="mt-4">
      <TouchableOpacity 
        disabled
        className="bg-binance-surface-elevated-dark p-3 rounded-lg flex-row items-center justify-center opacity-50 border border-binance-border-strong"
      >
        <Text className="text-xl mr-2">🎤</Text>
        <Text className="text-binance-muted-strong font-medium">Voice note — Hindi/Odia</Text>
      </TouchableOpacity>
      <Text className="text-center text-binance-muted text-xs mt-2">Voice input coming soon</Text>
    </View>
  );
}
