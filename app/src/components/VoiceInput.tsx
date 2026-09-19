import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function VoiceInput() {
  return (
    <View className="mt-4">
      <TouchableOpacity 
        disabled
        className="bg-comet-card p-3 rounded-lg flex-row items-center justify-center opacity-50 border border-comet-border"
      >
        <Text className="text-xl mr-2">🎤</Text>
        <Text className="text-comet-fg-muted font-medium">Voice note — Hindi/Odia</Text>
      </TouchableOpacity>
      <Text className="text-center text-comet-fg-muted text-xs mt-2">Voice input coming soon</Text>
    </View>
  );
}
