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
    return `flex-1 py-3 px-1 items-center justify-center border-r border-binance-border-strong last:border-r-0 ${
      isActive ? activeClass : 'bg-binance-surface-card-dark'
    }`;
  };

  const getTextClass = (btnValue: ResponseType) => {
    return `text-xs font-semibold ${value === btnValue ? 'text-white' : 'text-binance-on-dark'}`;
  };

  return (
    <View className="mb-4 bg-binance-surface-elevated-dark p-4 rounded-xl border border-binance-border-strong">
      <View className="mb-3">
        {regulationRef && (
          <Text className="text-binance-primary text-xs font-medium mb-1">
            {regulationRef}
          </Text>
        )}
        <Text className="text-binance-on-dark text-base">{questionText}</Text>
      </View>

      <View className="flex-row rounded-lg overflow-hidden border border-binance-border-strong">
        <TouchableOpacity
          className={getButtonClass('ok', '', 'bg-binance-trading-up')}
          onPress={() => onChange('ok')}
        >
          <Text className={getTextClass('ok')}>✅ OK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={getButtonClass('non_compliant', '', 'bg-binance-trading-down')}
          onPress={() => onChange('non_compliant')}
        >
          <Text className={getTextClass('non_compliant')}>🔴 Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={getButtonClass('observation_only', '', 'bg-yellow-500')}
          onPress={() => onChange('observation_only')}
        >
          <Text className={getTextClass('observation_only')}>🟡 Obs Only</Text>
        </TouchableOpacity>

        {showNa && (
          <TouchableOpacity
            className={getButtonClass('na', '', 'bg-binance-muted-strong')}
            onPress={() => onChange('na')}
          >
            <Text className={getTextClass('na')}>N/A</Text>
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (
        <View className="mt-4 pt-4 border-t border-binance-border-strong">
          <Text className="text-binance-on-dark font-medium mb-1">Description</Text>
          <TextInput
            className="bg-binance-surface-card-dark text-binance-on-dark p-3 rounded-lg border border-binance-border-strong mb-3 min-h-[80px]"
            placeholder="Enter observation details..."
            placeholderTextColor="#707a8a"
            multiline
            textAlignVertical="top"
            value={detail.description}
            onChangeText={(text) => handleDetailUpdate({ description: text })}
          />

          <Text className="text-binance-on-dark font-medium mb-1">Severity</Text>
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
            <Text className="text-binance-on-dark font-medium mb-1">Specific Location / Sub-zone</Text>
            <TextInput
              className="bg-binance-surface-card-dark text-binance-on-dark p-3 rounded-lg border border-binance-border-strong"
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
