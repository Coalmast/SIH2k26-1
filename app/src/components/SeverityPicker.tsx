import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ObsSeverity } from './RiskChip';

interface SeverityPickerProps {
  value: ObsSeverity | null;
  onChange: (value: ObsSeverity) => void;
}

export function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  const options: { id: ObsSeverity; label: string; activeClass: string; textClass: string }[] = [
    { id: 'low', label: 'Minor', activeClass: 'bg-binance-trading-up', textClass: 'text-binance-on-dark' },
    { id: 'medium', label: 'Moderate', activeClass: 'bg-yellow-500', textClass: 'text-binance-on-dark' },
    { id: 'high', label: 'HIGH', activeClass: 'bg-orange-500', textClass: 'text-binance-on-dark' },
    { id: 'critical', label: 'CRITICAL', activeClass: 'bg-binance-trading-down', textClass: 'text-binance-on-dark' },
  ];

  return (
    <View className="flex-row rounded-lg overflow-hidden border border-binance-border-strong mt-2">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            className={`flex-1 py-2 items-center justify-center border-r border-binance-border-strong last:border-r-0 ${
              isActive ? opt.activeClass : 'bg-binance-surface-card-dark'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? opt.textClass : 'text-binance-muted-strong'
              }`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
