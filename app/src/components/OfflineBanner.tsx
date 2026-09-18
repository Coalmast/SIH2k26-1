import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppStore } from '../stores/appStore';
import { WifiOff, RefreshCw, Play } from 'lucide-react-native';
import { performSync } from '../sync/syncEngine';

export function OfflineBanner() {
  const isOnline = useAppStore((state) => state.isOnline);
  const isSyncing = useAppStore((state) => state.isSyncing);
  const pendingItems = useAppStore((state) => state.pendingSyncItems);

  if (isOnline && !isSyncing && pendingItems === 0) return null;

  return (
    <View className="bg-comet-card border-b border-comet-border flex-row items-center justify-between px-4 py-2">
      <View className="flex-row items-center space-x-2 gap-2">
        {!isOnline ? (
          <WifiOff size={16} color="#f97316" />
        ) : (
          <RefreshCw size={16} color="#a8a29e" />
        )}
        <Text className="text-comet-fg text-sm font-medium">
          {!isOnline 
            ? 'Offline Mode Active' 
            : isSyncing 
              ? 'Syncing changes...' 
              : `${pendingItems} pending syncs`}
        </Text>
      </View>
      
      {isOnline && !isSyncing && pendingItems > 0 && (
        <TouchableOpacity 
          className="bg-comet-orange/20 px-3 py-1 rounded flex-row items-center gap-1"
          onPress={() => performSync()}
        >
          <Play size={12} color="#f97316" />
          <Text className="text-comet-orange text-xs font-bold">Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
