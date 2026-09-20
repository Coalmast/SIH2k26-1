import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react-native';
import { GrievanceAnalysis } from '../lib/geminiAudioService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { RiskChip } from './RiskChip';

interface GrievanceResultCardProps {
  result: GrievanceAnalysis;
  onSubmit: () => void;
  onRetry: () => void;
}

export function GrievanceResultCard({ result, onSubmit, onRetry }: GrievanceResultCardProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <Card className="w-full">
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-comet-fg text-lg font-bold">Analysis Complete</Text>
          <View className="bg-comet-up/20 px-2 py-1 rounded">
            <Text className="text-comet-up text-xs font-bold">{result.detectedLanguage}</Text>
          </View>
        </View>
        
        <Text className="text-comet-fg-muted text-sm mb-4">
          {result.englishSummary}
        </Text>

        <View className="flex-row gap-2 mb-4">
          <RiskChip severity={result.severity as any} />
          <View className="bg-comet-canvas px-3 py-1 rounded-full border border-comet-border">
            <Text className="text-comet-fg-muted text-xs font-medium">{result.category}</Text>
          </View>
        </View>
      </View>

      <View className="bg-comet-canvas rounded-lg p-3 mb-6">
        <TouchableOpacity 
          className="flex-row items-center justify-between"
          onPress={() => setShowOriginal(!showOriginal)}
        >
          <Text className="text-comet-fg font-medium">Original Transcription</Text>
          {showOriginal ? <ChevronUp size={20} color="#a8a29e" /> : <ChevronDown size={20} color="#a8a29e" />}
        </TouchableOpacity>
        
        {showOriginal && (
          <Text className="text-comet-fg-muted mt-3 italic text-sm">
            "{result.transcription}"
          </Text>
        )}
      </View>

      <View className="gap-3">
        <Button variant="primary" onPress={onSubmit} className="w-full">
          <Text className="text-black font-bold">Submit Grievance</Text>
        </Button>
        <Button variant="outline" onPress={onRetry} className="w-full">
          <Text className="text-comet-fg font-medium">Record Again</Text>
        </Button>
      </View>
    </Card>
  );
}
