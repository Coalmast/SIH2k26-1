import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBadge } from '../../../src/components/StatusBadge';
import { useInspectionList } from '../../../src/hooks/useInspectionApi';
import { useAuthStore } from '../../../src/stores/authStore';

type FilterType = 'all' | 'active' | 'done';

export default function InspectionsScreen() {
  const router = useRouter();
  const mineId = useAuthStore(state => state.mineId);
  const { active, completed } = useInspectionList(mineId || '');
  const [filter, setFilter] = useState<FilterType>('active');

  const getFilteredData = () => {
    switch (filter) {
      case 'active': return active;
      case 'done': return completed;
      case 'all': return [...active, ...completed].sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
      default: return [];
    }
  };

  const renderInspectionCard = ({ item }: { item: any }) => {
    const isCompleted = item.status === 'submitted' || item.status === 'completed';
    
    return (
      <TouchableOpacity 
        className="bg-binance-surface-card-dark p-4 rounded-xl mb-3 border border-binance-border-strong"
        onPress={() => {
          if (isCompleted) {
            router.push(`/inspect/${item.id}/report`);
          } else {
            router.push(`/inspect/${item.id}/form`);
          }
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-binance-primary font-bold text-lg">
              {(item.inspectionType || '').replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text className="text-binance-muted-strong text-sm mt-1">
              {item.zone || 'No zone specified'} • {item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <StatusBadge status={isCompleted ? item.syncStatus : item.status} />
        </View>

        <View className="flex-row justify-between items-end mt-4">
          <View>
            {isCompleted ? (
              <Text className="text-binance-on-dark text-sm">
                Violations: <Text className="font-bold text-binance-trading-down">{item.violationCount || 0}</Text>
              </Text>
            ) : (
              <Text className="text-binance-on-dark text-sm">
                Progress: <Text className="font-bold text-binance-primary">{item.observationCount || 0}</Text> obs
              </Text>
            )}
          </View>
          <View className="bg-binance-surface-elevated-dark px-4 py-2 rounded-lg">
            <Text className="text-binance-on-dark font-medium">
              {isCompleted ? 'View Report →' : 'Continue →'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-binance-ink px-4 pt-6">
      
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-2xl font-bold">INSPECTIONS</Text>
        <TouchableOpacity 
          className="bg-binance-primary px-4 py-2 rounded-lg"
          onPress={() => router.push('/inspect/start')}
        >
          <Text className="text-binance-ink font-bold">+ New</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row mb-4 bg-binance-surface-card-dark p-1 rounded-lg">
        {['all', 'active', 'done'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-2 items-center rounded-md ${filter === f ? 'bg-binance-surface-elevated-dark' : ''}`}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text className={`font-semibold ${filter === f ? 'text-binance-primary' : 'text-binance-muted-strong'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'active' && active?.length > 0 && ` • ${active.length}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getFilteredData()}
        keyExtractor={item => item.id}
        renderItem={renderInspectionCard}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-20">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-binance-on-dark font-medium text-lg text-center">
              No inspections found
            </Text>
            <Text className="text-binance-muted-strong text-center mt-2">
              {filter === 'active' ? 'You have no active inspections.' : 'Nothing to show here.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
