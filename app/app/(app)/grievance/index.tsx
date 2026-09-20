import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
import { useVoiceGrievance } from '../../../src/hooks/useVoiceGrievance';
import { GrievanceResultCard } from '../../../src/components/GrievanceResultCard';
import { Button } from '../../../src/components/ui/Button';

export default function VoiceGrievanceScreen() {
  const {
    state,
    recordingDuration,
    result,
    error,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceGrievance();

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSubmit = () => {
    // For Demo: we just log. In production: push to Supabase grievances table.
    console.log('Submit grievance:', result);
    alert('Grievance Submitted successfully!');
    reset();
  };

  return (
    <ScrollView className="flex-1 bg-comet-canvas px-4 py-6">
      <View className="mb-6">
        <Text className="text-comet-fg text-3xl font-bold">Voice Grievance</Text>
        <Text className="text-comet-fg-muted mt-2">
          Speak your grievance in your preferred language. The system will automatically translate and categorize it.
        </Text>
      </View>

      {error && (
        <View className="bg-red-500/20 p-4 rounded-lg border border-red-500/50 mb-6">
          <Text className="text-red-400">{error}</Text>
          <Button variant="outline" onPress={reset} className="mt-3">
            <Text className="text-comet-fg">Try Again</Text>
          </Button>
        </View>
      )}

      {state === 'idle' && (
        <View className="items-center justify-center py-10">
          <TouchableOpacity 
            onPress={startRecording}
            className="w-32 h-32 bg-comet-card rounded-full items-center justify-center border-4 border-comet-orange shadow-lg"
          >
            <Mic size={48} color="#f97316" />
          </TouchableOpacity>
          <Text className="text-comet-fg-muted mt-6 text-lg">Tap to start recording</Text>
        </View>
      )}

      {state === 'recording' && (
        <View className="items-center justify-center py-10">
          <TouchableOpacity 
            onPress={stopRecording}
            className="w-32 h-32 bg-comet-orange/20 rounded-full items-center justify-center border-4 border-comet-orange"
          >
            <View className="w-12 h-12 bg-comet-orange rounded-md" />
          </TouchableOpacity>
          
          <View className="flex-row items-center mt-6 gap-2">
            <View className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <Text className="text-comet-fg font-mono text-xl">{formatDuration(recordingDuration)}</Text>
          </View>
          <Text className="text-comet-fg-muted mt-2 text-lg">Tap to stop</Text>
        </View>
      )}

      {state === 'processing' && (
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-comet-fg-muted mt-6 text-lg text-center">
            Analyzing audio with Gemini...{'\n'}Detecting language and summarizing...
          </Text>
        </View>
      )}

      {state === 'done' && result && (
        <View className="mb-8">
          <GrievanceResultCard 
            result={result} 
            onSubmit={handleSubmit}
            onRetry={reset}
          />
        </View>
      )}

    </ScrollView>
  );
}
