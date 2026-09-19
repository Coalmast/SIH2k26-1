import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ObsSeverity } from './RiskChip';
import { SeverityPicker } from './SeverityPicker';
import { MediaCapture } from './MediaCapture';

export interface ObservationDetail {
  description: string;
  severity: ObsSeverity;
  photoUris: string[];
  subZone: string;
}

export type ResponseType = 'ok' | 'non_compliant' | 'observation_only' | 'na' | null;

interface ChecklistItemProps {
  questionId: string;
  questionText: string;
  regulationRef?: string;
  value: ResponseType;
  onChange: (val: ResponseType) => void;
  onDetailChange: (detail: ObservationDetail) => void;
  existingDetail?: ObservationDetail;
  showNa?: boolean;
}

export function ChecklistItem({
  questionId,
  questionText,
  regulationRef,
  value,
  onChange,
  onDetailChange,
  existingDetail,
  showNa = false,
}: ChecklistItemProps) {
  const [detail, setDetail] = useState<ObservationDetail>(
    existingDetail || {
      description: '',
      severity: 'low',
      photoUris: [],
      subZone: '',
    }
  );

  const isExpanded = value === 'non_compliant' || value === 'observation_only';

  const handleDetailUpdate = (updates: Partial<ObservationDetail>) => {
    const newDetail = { ...detail, ...updates };
    setDetail(newDetail);
    onDetailChange(newDetail);
  };

  const getButtonClass = (btnValue: ResponseType, baseClass: string, activeClass: string) => {
    const isActive = value === btnValue;
    return `flex-1 py-3 px-1 items-center justify-center border-r border-comet-border last:border-r-0 ${
      isActive ? activeClass : 'bg-comet-card'
    }`;
  };

  const getTextClass = (btnValue: ResponseType) => {
    return `text-xs font-semibold ${value === btnValue ? 'text-white' : 'text-comet-fg'}`;
  };

  return (
    <View className="mb-4 bg-comet-card p-4 rounded-xl border border-comet-border">
      <View className="mb-3">
        {regulationRef && (
          <Text className="text-comet-orange text-xs font-medium mb-1">
            {regulationRef}
          </Text>
        )}
        <Text className="text-comet-fg text-base">{questionText}</Text>
      </View>

      <View className="flex-row rounded-lg overflow-hidden border border-comet-border">
        <TouchableOpacity
          className={getButtonClass('ok', '', 'bg-comet-up')}
          onPress={() => onChange('ok')}
        >
          <Text className={getTextClass('ok')}>✅ OK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={getButtonClass('non_compliant', '', 'bg-comet-down')}
          onPress={() => onChange('non_compliant')}
        >
          <Text className={getTextClass('non_compliant')}>🔴 Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={getButtonClass('observation_only', '', 'bg-comet-pending')}
          onPress={() => onChange('observation_only')}
        >
          <Text className={getTextClass('observation_only')}>🟡 Obs Only</Text>
        </TouchableOpacity>

        {showNa && (
          <TouchableOpacity
            className={getButtonClass('na', '', 'bg-comet-fg-muted')}
            onPress={() => onChange('na')}
          >
            <Text className={getTextClass('na')}>N/A</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-comet-border">
          <Text className="text-comet-fg font-medium mb-1">Description</Text>
          <TextInput
            className="bg-comet-card text-comet-fg p-3 rounded-lg border border-comet-border mb-3 min-h-[80px]"
            placeholder="Enter observation details..."
            placeholderTextColor="#707a8a"
            multiline
            textAlignVertical="top"
            value={detail.description}
            onChangeText={(text) => handleDetailUpdate({ description: text })}
          />

          <Text className="text-comet-fg font-medium mb-1">Severity</Text>
          <SeverityPicker
            value={detail.severity}
            onChange={(sev) => handleDetailUpdate({ severity: sev })}
          />

          {(detail.severity === 'high' || detail.severity === 'critical') && value === 'non_compliant' && (
            <View className="bg-orange-500/20 border border-orange-500/50 p-2 rounded-lg mt-2 flex-row">
              <Text className="text-orange-500 mr-2">⚠️</Text>
              <Text className="text-orange-500 text-xs flex-1">
                Violation will be auto-created on sync due to High/Critical severity.
              </Text>
            </View>
          )}

          <View className="mt-4 mb-2">
            <Text className="text-comet-fg font-medium mb-1">Specific Location / Sub-zone</Text>
            <TextInput
              className="bg-comet-card text-comet-fg p-3 rounded-lg border border-comet-border"
              placeholder="e.g. Panel 4, near junction..."
              placeholderTextColor="#707a8a"
              value={detail.subZone}
              onChangeText={(text) => handleDetailUpdate({ subZone: text })}
            />
          </View>

          <MediaCapture
            uris={detail.photoUris}
            onChange={(uris) => handleDetailUpdate({ photoUris: uris })}
          />
        </View>
      )}
    </View>
  );
}
