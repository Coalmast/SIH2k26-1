import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { database } from '../../../../src/db';
import { Inspection, Observation } from '../../../../src/db/models';
import { Q } from '@nozbe/watermelondb';
import { Button } from '../../../../src/components/ui/Button';
import { useObserve } from '../../../../src/hooks/useObserve';
import { useGeoStamp } from '../../../../src/hooks/useGeoStamp';
import { GeoStampDisplay } from '../../../../src/components/GeoStampDisplay';
import { RiskChip, ObsSeverity } from '../../../../src/components/RiskChip';
import { StatusBadge } from '../../../../src/components/StatusBadge';

export default function InspectionSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const geoStamp = useGeoStamp();

  const inspectionQuery = useMemo(() => database.get<Inspection>('inspections').query(Q.where('id', id)).observe(), [id]);
  const observationsQuery = useMemo(() => database.get<Observation>('observations').query(Q.where('inspection_id', id)).observe(), [id]);

  const inspections = useObserve(inspectionQuery, []);
  const observations = useObserve(observationsQuery, []);
  const inspection = inspections?.[0];

  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!inspection || !observations) {
    return (
      <View className="flex-1 bg-binance-ink items-center justify-center">
        <Text className="text-white">Loading summary...</Text>
      </View>
    );
  }

  const isCompleted = inspection.status === 'submitted' || inspection.status === 'reviewed';
  const issues = observations.filter(o => o.responseType === 'non_compliant' || o.responseType === 'observation_only');

  const handleSubmit = async () => {
    if (!geoStamp.inBoundary) {
      return Alert.alert('Out of Bounds', 'You must be within the mine boundary to submit the inspection.');
    }

    Alert.alert(
      'Confirm Submission',
      'Are you sure you want to sign off and submit this inspection? You will not be able to edit it after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign & Submit', 
          style: 'default',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await database.write(async () => {
                await inspection.update((i: any) => {
                  i.status = 'submitted';
                  i.syncStatus = 'pending_sync'; // will trigger syncEngine
                  i.overallRemarks = remarks;
                  i.submittedAt = Date.now();
                  i.signedAt = Date.now();
                  i.geoStampEnd = JSON.stringify({
                    lat: geoStamp.lat,
                    lng: geoStamp.lng,
                    accuracy: geoStamp.accuracy,
                  });
                });
              });
              Alert.alert('Success', 'Inspection submitted successfully', [
                { text: 'OK', onPress: () => router.replace('/inspect') }
              ]);
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to submit inspection');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-binance-ink pt-12 pb-4">
      {/* Header */}
      <View className="px-4 pb-4 border-b border-binance-border-strong flex-row justify-between items-center">
        <View>
          <Text className="text-binance-muted-strong font-semibold uppercase text-xs">Final Review</Text>
          <Text className="text-white text-xl font-bold mt-1">Inspection Summary</Text>
        </View>
        <StatusBadge status={inspection.status as any} />
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        <View className="bg-binance-surface-card-dark p-4 rounded-xl border border-binance-border-strong mb-6">
          <Text className="text-binance-primary font-bold text-lg mb-2">
            {inspection.inspectionType.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-binance-muted-strong">Shift: <Text className="text-binance-on-dark font-medium">{inspection.shift}</Text></Text>
            <Text className="text-binance-muted-strong">Zone: <Text className="text-binance-on-dark font-medium">{inspection.zone}</Text></Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-binance-muted-strong">Date: <Text className="text-binance-on-dark font-medium">{new Date(inspection.createdAt).toLocaleDateString()}</Text></Text>
            <Text className="text-binance-muted-strong">Issues Found: <Text className="text-binance-trading-down font-bold">{issues.length}</Text></Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-3">Observations ({issues.length})</Text>
        
        {issues.length === 0 ? (
          <View className="bg-binance-surface-elevated-dark p-6 rounded-xl border border-binance-trading-up/50 items-center justify-center mb-6">
            <Text className="text-4xl mb-2">✅</Text>
            <Text className="text-binance-trading-up font-bold text-lg">All Compliant</Text>
            <Text className="text-binance-muted text-center mt-1">No issues were recorded during this inspection.</Text>
          </View>
        ) : (
          issues.map((issue) => (
            <View key={issue.id} className="bg-binance-surface-elevated-dark p-4 rounded-xl mb-3 border border-binance-border-strong">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="text-binance-on-dark font-medium flex-1 mr-2">{issue.category}</Text>
                <RiskChip severity={issue.severity as ObsSeverity} />
              </View>
              
              <Text className="text-binance-muted-strong text-sm mb-2">{issue.description}</Text>
              
              {issue.statuteRef && (
                <Text className="text-binance-primary text-xs font-medium">Ref: {issue.statuteRef}</Text>
              )}
              {issue.subZone && (
                <Text className="text-binance-muted-strong text-xs mt-1">Loc: {issue.subZone}</Text>
              )}
            </View>
          ))
        )}

        {!isCompleted && (
          <View className="mb-6 mt-4">
            <Text className="text-binance-on-dark font-medium mb-2">Overall Remarks (Optional)</Text>
            <TextInput
              className="bg-binance-surface-card-dark text-binance-on-dark p-4 rounded-xl border border-binance-border-strong min-h-[100px]"
              placeholder="Add any final remarks or general observations..."
              placeholderTextColor="#707a8a"
              multiline
              textAlignVertical="top"
              value={remarks}
              onChangeText={setRemarks}
            />
          </View>
        )}

        {isCompleted && inspection.overallRemarks && (
          <View className="mb-6 mt-4 bg-binance-surface-card-dark p-4 rounded-xl border border-binance-border-strong">
            <Text className="text-binance-muted-strong font-medium mb-1">Overall Remarks</Text>
            <Text className="text-binance-on-dark">{inspection.overallRemarks}</Text>
          </View>
        )}

        {!isCompleted && (
          <View className="mb-8">
            <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Final Geo-Stamp</Text>
            <GeoStampDisplay {...geoStamp} />
          </View>
        )}

        <View className="h-10" />
      </ScrollView>

      {!isCompleted && (
        <View className="px-4 pt-4 border-t border-binance-border-strong flex-row justify-between">
          <Button 
            variant="outline" 
            onPress={() => router.back()}
            className="flex-1 mr-2"
          >
            ← Back to Edit
          </Button>
          <Button 
            variant="primary" 
            onPress={handleSubmit}
            className="flex-1 ml-2"
            disabled={isSubmitting || !geoStamp.inBoundary}
          >
            {isSubmitting ? 'Submitting...' : 'Sign & Submit ✅'}
          </Button>
        </View>
      )}
      
      {isCompleted && (
        <View className="px-4 pt-4 border-t border-binance-border-strong">
          <Button variant="secondary" onPress={() => router.replace('/inspect')}>
            ← Back to List
          </Button>
        </View>
      )}
    </View>
  );
}
