import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInspectionDetail } from '../../../../src/hooks/useInspectionApi';
import { SkeletonLoader } from '../../../../src/components/SkeletonLoader';
import { Button } from '../../../../src/components/ui/Button';

export default function InspectionReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { inspection, isLoading: detailLoading } = useInspectionDetail(id);

  if (detailLoading || !inspection) {
    return (
      <View className="flex-1 bg-comet-canvas pt-12">
        <SkeletonLoader />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-comet-canvas pt-12 pb-4">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-comet-border flex-row justify-between items-center">
        <View>
          <Text className="text-comet-fg-muted font-semibold uppercase text-xs">Final Report</Text>
          <Text className="text-white text-xl font-bold mt-1">Inspection Summary</Text>
        </View>
        <Button size="sm" variant="secondary" onPress={() => router.replace('/(app)/home')}>
          Done
        </Button>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* KPI Cards */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-comet-card p-4 rounded-xl border border-comet-border flex-1 mr-2">
            <Text className="text-comet-fg-muted text-xs uppercase font-bold tracking-wider mb-1">Observations</Text>
            <Text className="text-white font-bold text-3xl">{inspection.observationCount || 0}</Text>
          </View>
          <View className="bg-comet-card p-4 rounded-xl border border-comet-border flex-1 ml-2">
            <Text className="text-comet-fg-muted text-xs uppercase font-bold tracking-wider mb-1">Violations</Text>
            <Text className="text-comet-down font-bold text-3xl">{inspection.violationCount || 0}</Text>
          </View>
        </View>

        {/* Success Message Section */}
        <View className="bg-comet-card p-6 rounded-xl border border-comet-border items-center mb-8 mt-4">
          <View className="w-16 h-16 bg-comet-up/20 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">✅</Text>
          </View>
          <Text className="text-white font-bold text-xl mb-2 text-center">
            Inspection Submitted
          </Text>
          <Text className="text-comet-fg-muted text-center px-4 leading-5">
            Your inspection has been successfully completed and safely synced to the cloud. You may now return to the home screen.
          </Text>
        </View>
        
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
