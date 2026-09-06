import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnomalyCardProps {
  anomaly: {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    recommendation?: string;
  };
}

export function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const [expanded, setExpanded] = useState(false);

  let borderColor = 'border-binance-border';
  let badgeColor = 'bg-binance-muted';
  let iconName = 'information-circle';

  if (anomaly.severity === 'critical') {
    borderColor = 'border-binance-trading-down';
    badgeColor = 'bg-binance-trading-down';
    iconName = 'warning';
  } else if (anomaly.severity === 'high') {
    borderColor = 'border-[#F3BA2F]';
    badgeColor = 'bg-[#F3BA2F]';
    iconName = 'alert-circle';
  } else if (anomaly.severity === 'medium') {
    borderColor = 'border-[#F0B90B]';
    badgeColor = 'bg-[#F0B90B]';
    iconName = 'alert';
  }

  return (
    <View className={`bg-binance-surface-card-dark rounded-xl border-l-4 ${borderColor} p-4 mb-3`}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} className="flex-row justify-between items-start">
        <View className="flex-row items-center flex-1 mr-2">
          <View className={`px-2 py-1 rounded-md ${badgeColor} mr-3`}>
            <Text className="text-binance-ink text-[10px] font-bold uppercase">{anomaly.severity}</Text>
          </View>
          <Text className="text-white font-bold flex-1">{anomaly.title}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#848E9C" />
      </TouchableOpacity>

      {expanded ? (
        <View className="mt-3 pt-3 border-t border-binance-border-strong">
          <Text className="text-[#eaecef] text-sm leading-5 mb-2">{anomaly.description}</Text>
          {anomaly.recommendation && (
            <View className="bg-binance-ink p-3 rounded-lg mt-2">
              <Text className="text-binance-muted-strong text-xs font-bold uppercase mb-1">Recommendation</Text>
              <Text className="text-binance-primary text-sm font-medium">{anomaly.recommendation}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="text-binance-muted text-sm mt-2" numberOfLines={1}>
          {anomaly.description}
        </Text>
      )}
    </View>
  );
}
