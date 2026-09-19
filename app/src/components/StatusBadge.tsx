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
        return { label: 'Pending Sync', icon: '🔄', bg: 'bg-comet-pending/20', text: 'text-comet-pending' };
      case 'synced':
        return { label: 'Synced', icon: '✅', bg: 'bg-comet-up/20', text: 'text-comet-up' };
      case 'error':
        return { label: 'Error', icon: '❌', bg: 'bg-comet-down/20', text: 'text-comet-down' };
      case 'draft':
        return { label: 'Draft', icon: '📝', bg: 'bg-comet-muted', text: 'text-comet-fg-muted' };
      case 'in_progress':
        return { label: 'In Progress', icon: '🔵', bg: 'bg-comet-orange/20', text: 'text-comet-orange' };
      case 'submitted':
        return { label: 'Submitted', icon: '📤', bg: 'bg-comet-muted', text: 'text-comet-fg-muted' };
      case 'reviewed':
        return { label: 'Reviewed', icon: '✅', bg: 'bg-comet-up/20', text: 'text-comet-up' };
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
