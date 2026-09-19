import React from 'react';
import { View, Text } from 'react-native';

export type ObsSeverity = 'low' | 'medium' | 'high' | 'critical';

interface RiskChipProps {
  severity: ObsSeverity;
}

export function RiskChip({ severity }: RiskChipProps) {
  const getConfig = () => {
    switch (severity) {
      case 'low':
        return { label: 'Low', bg: 'bg-comet-up/20', text: 'text-comet-up' };
      case 'medium':
        return { label: 'Moderate', bg: 'bg-comet-pending/20', text: 'text-comet-pending' };
      case 'high':
        return { label: 'High', bg: 'bg-comet-orange/20', text: 'text-comet-orange' };
      case 'critical':
        return { label: 'CRITICAL', bg: 'bg-comet-down/20', text: 'text-comet-down font-bold' };
      default:
        return { label: severity, bg: 'bg-gray-500/20', text: 'text-gray-500' };
    }
  };

  const config = getConfig();

  return (
    <View className={`px-2 py-0.5 rounded-full ${config.bg}`}>
      <Text className={`text-xs ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
