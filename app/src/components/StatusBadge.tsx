import React from 'react';
import { View, Text } from 'react-native';

export type SyncStatus = 'pending_sync' | 'synced' | 'error';
export type InspectionStatus = 'draft' | 'in_progress' | 'submitted' | 'reviewed';

export type StatusType = SyncStatus | InspectionStatus;

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending_sync':
        return { label: 'Pending Sync', icon: '🔄', bg: 'bg-yellow-500/20', text: 'text-yellow-500' };
      case 'synced':
        return { label: 'Synced', icon: '✅', bg: 'bg-binance-trading-up/20', text: 'text-binance-trading-up' };
      case 'error':
        return { label: 'Error', icon: '❌', bg: 'bg-binance-trading-down/20', text: 'text-binance-trading-down' };
      case 'draft':
        return { label: 'Draft', icon: '📝', bg: 'bg-binance-muted/20', text: 'text-binance-muted' };
      case 'in_progress':
        return { label: 'In Progress', icon: '🔵', bg: 'bg-binance-info/20', text: 'text-binance-info' };
      case 'submitted':
        return { label: 'Submitted', icon: '📤', bg: 'bg-binance-muted-strong/20', text: 'text-binance-muted-strong' };
      case 'reviewed':
        return { label: 'Reviewed', icon: '✅', bg: 'bg-binance-trading-up/20', text: 'text-binance-trading-up' };
      default:
        return { label: status, icon: '', bg: 'bg-gray-500/20', text: 'text-gray-500' };
    }
  };

  const config = getStatusConfig();

  return (
    <View className={`flex-row items-center px-2 py-1 rounded-full ${config.bg}`}>
      <Text className={`text-xs font-medium ${config.text}`}>
        {config.icon} {config.label}
      </Text>
    </View>
  );
}
