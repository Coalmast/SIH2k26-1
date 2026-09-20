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
        className="bg-comet-card p-4 rounded-xl mb-3 border border-comet-border"
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
            <Text className="text-comet-orange font-bold text-lg">
              {(item.inspectionType || '').replace(/_/g, ' ').toUpperCase()}
            </Text>
            <Text className="text-comet-fg-muted text-sm mt-1">
              {item.zone || 'No zone specified'} • {item.startedAt ? new Date(item.startedAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <StatusBadge status={isCompleted ? item.syncStatus : item.status} />
        </View>

        <View className="flex-row justify-between items-end mt-4">
          <View>
            {isCompleted ? (
              <Text className="text-comet-fg text-sm">
                Violations: <Text className="font-bold text-comet-down">{item.violationCount || 0}</Text>
              </Text>
            ) : (
              <Text className="text-comet-fg text-sm">
                Progress: <Text className="font-bold text-comet-orange">{item.observationCount || 0}</Text> obs
              </Text>
            )}
          </View>
          <View className="bg-comet-card px-4 py-2 rounded-lg">
            <Text className="text-comet-fg font-medium">
              {isCompleted ? 'View Report →' : 'Continue →'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-comet-canvas pt-4">
      
      <View className="flex-row mb-4 bg-comet-card p-1 rounded-lg mx-4">
        {['all', 'active', 'done'].map((f) => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-2 items-center rounded-md ${filter === f ? 'bg-comet-card' : ''}`}
            onPress={() => setFilter(f as FilterType)}
          >
            <Text className={`font-semibold ${filter === f ? 'text-comet-orange' : 'text-comet-fg-muted'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'active' && active?.length > 0 && ` • ${active.length}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        className="px-4"
        data={getFilteredData()}
        keyExtractor={item => item.id}
        renderItem={renderInspectionCard}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="items-center justify-center mt-20">
            <Text className="text-6xl mb-4">📋</Text>
            <Text className="text-comet-fg font-medium text-lg text-center">
              No inspections found
            </Text>
            <Text className="text-comet-fg-muted text-center mt-2">
              {filter === 'active' ? 'You have no active inspections.' : 'Nothing to show here.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
