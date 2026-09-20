import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function VoiceInput() {
  const router = useRouter();
  
  return (
    <View className="mt-4">
      <TouchableOpacity 
        onPress={() => router.push('/(app)/grievance')}
        className="bg-comet-card p-3 rounded-lg flex-row items-center justify-center border border-comet-orange shadow-sm"
      >
        <Text className="text-xl mr-2">🎙️</Text>
        <Text className="text-comet-orange font-bold">Use AI Voice Grievance</Text>
      </TouchableOpacity>
      <Text className="text-center text-comet-fg-muted text-xs mt-2">Speak in Hindi, Odia, Bengali, etc.</Text>
    </View>
  );
}
