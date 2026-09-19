import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ObsSeverity } from './RiskChip';

interface SeverityPickerProps {
  value: ObsSeverity | null;
  onChange: (value: ObsSeverity) => void;
}

export function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  const options: { id: ObsSeverity; label: string; activeClass: string; textClass: string }[] = [
    { id: 'low', label: 'Minor', activeClass: 'bg-comet-up', textClass: 'text-comet-fg' },
    { id: 'medium', label: 'Moderate', activeClass: 'bg-comet-pending', textClass: 'text-comet-fg' },
    { id: 'high', label: 'HIGH', activeClass: 'bg-orange-500', textClass: 'text-comet-fg' },
    { id: 'critical', label: 'CRITICAL', activeClass: 'bg-comet-down', textClass: 'text-comet-fg' },
  ];

  return (
    <View className="flex-row rounded-lg overflow-hidden border border-comet-border mt-2">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <TouchableOpacity
            key={opt.id}
            onPress={() => onChange(opt.id)}
            className={`flex-1 py-2 items-center justify-center border-r border-comet-border last:border-r-0 ${
              isActive ? opt.activeClass : 'bg-comet-card'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isActive ? opt.textClass : 'text-comet-fg-muted'
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
