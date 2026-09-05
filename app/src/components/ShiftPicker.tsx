import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export type ShiftType = 'A' | 'B' | 'C' | 'General';

interface ShiftPickerProps {
  value: ShiftType | null;
  onChange: (value: ShiftType) => void;
}

export function ShiftPicker({ value, onChange }: ShiftPickerProps) {
  const options: ShiftType[] = ['A', 'B', 'C', 'General'];

  return (
    <View className="flex-row rounded-lg overflow-hidden border border-binance-border-strong mt-1">
      {options.map((opt) => {
        const isActive = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            className={`flex-1 py-3 items-center justify-center border-r border-binance-border-strong last:border-r-0 ${
              isActive ? 'bg-binance-info' : 'bg-binance-surface-card-dark'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive ? 'text-white' : 'text-binance-on-dark'
              }`}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
