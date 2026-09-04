import React from 'react';
import { View, Text } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { WifiOff, RefreshCw } from 'lucide-react-native';

export function OfflineBanner() {
  const isOnline = useAppStore((state) => state.isOnline);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const pendingItems = useAppStore((state) => state.pendingSyncItems);

  if (isOnline && !isSyncing && pendingItems === 0) return null;

  return (
    <View className="bg-binance-surface-card-dark border-b border-binance-hairline-on-dark flex-row items-center justify-between px-4 py-2">
      <View className="flex-row items-center space-x-2 gap-2">
        {!isOnline ? (
          <WifiOff size={16} color="#fcd535" />
        ) : (
          <RefreshCw size={16} color="#707a8a" />
        )}
        <Text className="text-binance-body text-sm font-medium">
          {!isOnline 
            ? 'Offline Mode Active' 
            : isSyncing 
              ? 'Syncing changes...' 
              : `${pendingItems} pending syncs`}
        </Text>
      </View>
    </View>
  );
}
