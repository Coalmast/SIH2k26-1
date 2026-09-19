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

  let borderColor = 'border-comet-border';
  let badgeColor = 'bg-comet-muted';
  let iconName = 'information-circle';

  if (anomaly.severity === 'critical') {
    borderColor = 'border-comet-down';
    badgeColor = 'bg-comet-down';
    iconName = 'warning';
  } else if (anomaly.severity === 'high') {
    borderColor = 'border-comet-orange';
    badgeColor = 'bg-comet-orange';
    iconName = 'alert-circle';
  } else if (anomaly.severity === 'medium') {
    borderColor = 'border-comet-pending';
    badgeColor = 'bg-comet-pending';
    iconName = 'alert';
  }

  return (
    <View className={`bg-comet-card rounded-lg border-l-4 ${borderColor} p-4 mb-3`}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} className="flex-row justify-between items-start">
        <View className="flex-row items-center flex-1 mr-2">
          <View className={`px-2 py-1 rounded-md ${badgeColor} mr-3`}>
            <Text className="text-comet-canvas text-[10px] font-bold uppercase tracking-widest">{anomaly.severity}</Text>
          </View>
          <Text className="text-comet-fg font-bold flex-1">{anomaly.title}</Text>
        </View>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#848E9C" />
      </TouchableOpacity>

      {expanded ? (
        <View className="mt-3 pt-3 border-t border-comet-border">
          <Text className="text-comet-fg text-sm leading-5 mb-2">{anomaly.description}</Text>
          {anomaly.recommendation && (
            <View className="bg-comet-muted p-3 rounded-lg mt-2">
              <Text className="text-comet-fg-muted text-xs font-bold uppercase mb-1">Recommendation</Text>
              <Text className="text-comet-orange text-sm font-medium">{anomaly.recommendation}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text className="text-comet-fg-muted text-sm mt-2" numberOfLines={1}>
          {anomaly.description}
        </Text>
      )}
    </View>
  );
}
