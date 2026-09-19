import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface GeoStampDisplayProps {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  inBoundary: boolean;
  loading: boolean;
}

export function GeoStampDisplay({ lat, lng, accuracy, inBoundary, loading }: GeoStampDisplayProps) {
  if (loading) {
    return (
      <View className="bg-comet-card p-3 rounded-lg flex-row items-center justify-center">
        <ActivityIndicator size="small" color="#f97316" className="mr-2" />
        <Text className="text-comet-fg-muted">Acquiring GPS location...</Text>
      </View>
    );
  }

  if (!lat || !lng) {
    return (
      <View className="bg-comet-card p-3 rounded-lg flex-row items-center justify-between border border-comet-down/50">
        <Text className="text-comet-down font-medium">GPS Location Unavailable</Text>
        <Text className="text-comet-fg-muted text-xs">Check permissions</Text>
      </View>
    );
  }

  return (
    <View className={`bg-comet-card p-3 rounded-lg border ${inBoundary ? 'border-comet-up/50' : 'border-orange-500/50'}`}>
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-comet-fg font-medium">
          {Math.abs(lat).toFixed(4)}°{lat >= 0 ? 'N' : 'S'} {Math.abs(lng).toFixed(4)}°{lng >= 0 ? 'E' : 'W'}
        </Text>
        <View className={`flex-row items-center px-2 py-0.5 rounded ${inBoundary ? 'bg-comet-up/20' : 'bg-orange-500/20'}`}>
          <Text className={`text-xs ${inBoundary ? 'text-comet-up' : 'text-orange-500'}`}>
            {inBoundary ? '✅ In Boundary' : '⚠️ Out of Bounds'}
          </Text>
        </View>
      </View>
      {accuracy && (
        <Text className="text-comet-fg-muted text-xs">
          Accuracy: ±{Math.round(accuracy)}m
        </Text>
      )}
    </View>
  );
}
