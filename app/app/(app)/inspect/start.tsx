import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { database } from '../../../src/db';
import { Inspection } from '../../../src/db/models';
import { InspectionTypeEnum } from '../../../src/types/inspection.types';
import { ShiftPicker, ShiftType } from '../../../src/components/ShiftPicker';
import { GeoStampDisplay } from '../../../src/components/GeoStampDisplay';
import { useGeoStamp } from '../../../src/hooks/useGeoStamp';
import { useChecklistTemplate } from '../../../src/hooks/useChecklistTemplate';
import { Button } from '../../../src/components/ui/Button';

const INSPECTION_TYPES: { id: InspectionTypeEnum; label: string; icon: string }[] = [
  { id: 'dgms_annual_general', label: 'Annual General', icon: '📅' },
  { id: 'dgms_surprise', label: 'Surprise', icon: '🚨' },
  { id: 'dgms_inquiry', label: 'Inquiry', icon: '🔍' },
  { id: 'internal_safety_committee', label: 'Safety Comm.', icon: '🛡️' },
  { id: 'environmental_pcb', label: 'Environmental', icon: '🌱' },
  { id: 'medical_fitness', label: 'Medical', icon: '🏥' },
  { id: 'electrical', label: 'Electrical', icon: '⚡' },
  { id: 'explosives', label: 'Explosives', icon: '💥' },
];

export default function StartInspectionScreen() {
  const router = useRouter();
  const geoStamp = useGeoStamp();

  const [type, setType] = useState<InspectionTypeEnum | null>(null);
  const [shift, setShift] = useState<ShiftType | null>(null);
  const [zone, setZone] = useState('');

  // Fetch template for selected type
  const { template, isLoading: templateLoading } = useChecklistTemplate(type);

  const handleStart = async () => {
    if (!type) return Alert.alert('Required', 'Please select an inspection type');
    if (!shift) return Alert.alert('Required', 'Please select a shift');
    if (!zone) return Alert.alert('Required', 'Please enter a zone/district');
    if (!geoStamp.inBoundary) {
      return Alert.alert(
        'Out of Bounds', 
        'You are outside the designated mine boundary. Please move within the boundary to start inspection.'
      );
    }
    if (!template) {
      return Alert.alert('Template Not Found', 'No active template available for this inspection type. Please connect to internet to sync.');
    }

    try {
      let newInspectionId = '';
      await database.write(async () => {
        const newInspection = await database.get<Inspection>('inspections').create((r: any) => {
          r.mineId = '123e4567-e89b-12d3-a456-426614174000'; // mock
          r.inspectorId = 'insp_789'; // mock
          r.inspectionType = type;
          r.checklistTemplateId = template.remoteId;
          r.shift = shift;
          r.zone = zone;
          r.status = 'draft';
          r.syncStatus = 'pending_sync';
          r.conductedBy = 'Inspector Kumar';
          r.geoStampStart = JSON.stringify({
            lat: geoStamp.lat,
            lng: geoStamp.lng,
            accuracy: geoStamp.accuracy,
          });
          r.currentSection = 0;
          r.observationCount = 0;
          r.violationCount = 0;
        });
        newInspectionId = newInspection.id;
      });

      router.replace(`/inspect/${newInspectionId}/form`);
    } catch (error) {
      console.error('Failed to create inspection', error);
      Alert.alert('Error', 'Could not start inspection');
    }
  };

  return (
    <View className="flex-1 bg-binance-ink px-4 pt-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-white text-xl">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Start Inspection</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* GeoStamp */}
        <View className="mb-6">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Location Verification</Text>
          <GeoStampDisplay {...geoStamp} />
        </View>

        {/* Type Selection */}
        <View className="mb-6">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Inspection Type</Text>
          <View className="flex-row flex-wrap justify-between">
            {INSPECTION_TYPES.map((t) => {
              const isSelected = type === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setType(t.id)}
                  className={`w-[48%] mb-3 p-4 rounded-xl border ${
                    isSelected 
                      ? 'bg-binance-primary border-binance-primary' 
                      : 'bg-binance-surface-card-dark border-binance-border-strong'
                  }`}
                >
                  <Text className="text-2xl mb-2">{t.icon}</Text>
                  <Text className={`font-semibold ${isSelected ? 'text-binance-ink' : 'text-binance-on-dark'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Shift Selection */}
        <View className="mb-6">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Shift</Text>
          <ShiftPicker value={shift} onChange={setShift} />
        </View>

        {/* Zone */}
        <View className="mb-8">
          <Text className="text-binance-muted-strong font-semibold mb-2 uppercase text-xs tracking-wider">Zone / District</Text>
          <TextInput
            className="bg-binance-surface-card-dark text-binance-on-dark p-4 rounded-xl border border-binance-border-strong text-base"
            placeholder="e.g. Panel 4, Section B"
            placeholderTextColor="#707a8a"
            value={zone}
            onChangeText={setZone}
          />
        </View>

      </ScrollView>

      {/* Bottom Action */}
      <View className="py-4 border-t border-binance-border-strong">
        <Button 
          variant={type && shift && zone && geoStamp.inBoundary ? 'primary' : 'secondary'} 
          size="lg"
          onPress={handleStart}
          disabled={templateLoading}
        >
          {templateLoading ? 'Loading Template...' : 'Proceed to Form →'}
        </Button>
      </View>
    </View>
  );
}
