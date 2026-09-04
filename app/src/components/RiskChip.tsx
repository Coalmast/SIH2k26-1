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
        return { label: 'Low', bg: 'bg-binance-trading-up/20', text: 'text-binance-trading-up' };
      case 'medium':
        return { label: 'Moderate', bg: 'bg-yellow-500/20', text: 'text-yellow-500' };
      case 'high':
        return { label: 'High', bg: 'bg-orange-500/20', text: 'text-orange-500' };
      case 'critical':
        return { label: 'CRITICAL', bg: 'bg-binance-trading-down/20', text: 'text-binance-trading-down font-bold' };
      default:
        return { label: severity, bg: 'bg-gray-500/20', text: 'text-gray-500' };
    }
  };

  const config = getConfig();

  return (
    <View className={`px-2 py-0.5 rounded ${config.bg}`}>
      <Text className={`text-xs ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
}
