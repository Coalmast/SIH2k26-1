import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInspectionDetail, useChecklistTemplates, useSubmitInspection } from '../../../../src/hooks/useInspectionApi';
import { GasObservationItem } from '../../../../src/components/GasObservationItem';
import { SkeletonLoader } from '../../../../src/components/SkeletonLoader';
import { Button } from '../../../../src/components/ui/Button';

export default function InspectionFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { inspection, observations, isLoading } = useInspectionDetail(id);
  const { data: templates } = useChecklistTemplates();
  const submitInspection = useSubmitInspection();

  if (isLoading || !inspection || !templates) {
    return (
      <View className="flex-1 bg-binance-ink pt-12">
        <SkeletonLoader />
      </View>
    );
  }

  const template = templates.find((t: any) => t.id === inspection.checklistTemplateId);
  const checklistItems = template ? (typeof template.checklist_items === 'string' ? JSON.parse(template.checklist_items) : template.checklist_items) : [];

  const handleFinish = () => {
    // Check if all items that require measurement have observations
    const requiredItems = checklistItems.filter((item: any) => item.measurement_required !== false);
    const completedItemsCount = observations.filter((obs: any) => requiredItems.some((req: any) => req.id === obs.checklistItemId)).length;

    if (completedItemsCount < requiredItems.length) {
      Alert.alert(
        'Incomplete', 
        `You have ${requiredItems.length - completedItemsCount} required items remaining. Submit anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', style: 'destructive', onPress: submitForm }
        ]
      );
    } else {
      submitForm();
    }
  };

  const submitForm = () => {
    submitInspection.mutate({ 
      localId: inspection.id, 
      remoteId: inspection.remoteId 
    }, {
      onSuccess: () => {
        router.replace(`/inspect/${inspection.id}/report`);
      },
      onError: () => {
        Alert.alert('Notice', 'Saved locally. Will submit when online.');
        router.replace('/(app)/home');
      }
    });
  };

  return (
    <View className="flex-1 bg-binance-ink pt-12 pb-4">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-binance-border-strong flex-row justify-between items-center">
        <View>
          <Text className="text-binance-muted-strong font-semibold uppercase text-xs">Inspection Progress</Text>
          <Text className="text-white text-xl font-bold mt-1">{template?.name}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-binance-primary font-bold">Save & Exit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-binance-muted mb-4 font-medium">Record measurements for the following parameters. Values exceeding thresholds will automatically be flagged.</Text>
        
        {checklistItems.map((item: any) => {
          const savedObs = observations.find((o: any) => o.checklistItemId === item.id);
          return (
            <GasObservationItem
              key={item.id}
              item={item}
              localInspectionId={inspection.id}
              remoteInspectionId={inspection.remoteId}
              zone={inspection.zone}
              savedObservation={savedObs}
              onSaved={() => {}}
            />
          );
        })}
        
        <View className="h-10" />
      </ScrollView>

      {/* Footer Navigation */}
      <View className="px-4 pt-4 border-t border-binance-border-strong">
        <Button 
          variant="primary" 
          onPress={handleFinish}
          disabled={submitInspection.isPending}
        >
          {submitInspection.isPending ? 'Submitting...' : 'Submit Inspection →'}
        </Button>
      </View>
    </View>
  );
}
