import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { GeoStampDisplay } from '../../../src/components/GeoStampDisplay';
import { useGeoStamp } from '../../../src/hooks/useGeoStamp';
import { database } from '../../../src/db';
import { useAuthStore } from '../../../src/stores/authStore';
import { SyncStatusEnum, ShiftEnum } from '../../../src/types/enums';
import { performSync } from '../../../src/sync/syncEngine';
import { AlertTriangle } from 'lucide-react-native';

const ZONES = ['Pit 3', 'Workshop', 'CHP', 'Entry', 'Magazine', 'Other'];

interface GasReading {
  location: string;
  ch4: string;
  co: string;
  o2: string;
}

// Fake Alert Hook
function useCH4Alert(readings: GasReading[]) {
  const [alertFired, setAlertFired] = useState(false);

  useEffect(() => {
    const isDangerous = readings.some(r => parseFloat(r.ch4) > 1.25);
    setAlertFired(isDangerous);
  }, [readings]);

  return alertFired;
}

export default function ShiftReportScreen() {
  const router = useRouter();
  const { user, mineId } = useAuthStore();
  
  const [zone, setZone] = useState(ZONES[0]);
  const [shift, setShift] = useState<ShiftEnum>(ShiftEnum.GENERAL);
  
  const [regularCount, setRegularCount] = useState('');
  const [contractCount, setContractCount] = useState('');
  
  const [coalTonnes, setCoalTonnes] = useState('');
  const [obCum, setObCum] = useState('');
  
  const [gasReadings, setGasReadings] = useState<GasReading[]>([
    { location: 'Face 1', ch4: '0.1', co: '0', o2: '20.9' }
  ]);
  
  const [handoverNotes, setHandoverNotes] = useState('');
  const geoStamp = useGeoStamp();
  
  const ch4AlertFired = useCH4Alert(gasReadings);

  const addGasReading = () => {
    setGasReadings([...gasReadings, { location: '', ch4: '', co: '', o2: '' }]);
  };

  const updateGasReading = (index: number, field: keyof GasReading, value: string) => {
    const updated = [...gasReadings];
    updated[index][field] = value;
    setGasReadings(updated);
  };

  const handleSubmit = async () => {
    const rc = parseInt(regularCount) || 0;
    const cc = parseInt(contractCount) || 0;
    const workforceCount = rc + cc;

    try {
      await database.write(async () => {
        await database.get('shift_reports').create((record: any) => {
          record.mineId = mineId || 'default_mine';
          record.zone = zone;
          record.shift = shift;
          record.reportDate = Date.now();
          record.workforceCount = workforceCount;
          record.regularCount = rc;
          record.contractCount = cc;
          record.gasReadings = JSON.stringify(gasReadings);
          record.productionCoalTonnes = parseFloat(coalTonnes) || null;
          record.productionObCum = parseFloat(obCum) || null;
          record.handoverNotes = handoverNotes;
          record.ch4AlertFired = ch4AlertFired;
          record.syncStatus = SyncStatusEnum.PENDING_SYNC;
        });
      });
      
      performSync().catch(console.error);

      Alert.alert('Success', 'Shift report submitted successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save shift report:', error);
      Alert.alert('Error', 'Failed to save shift report');
    }
  };

  return (
    <ScrollView className="flex-1 bg-comet-canvas px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Zone & Shift */}
      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Zone</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {ZONES.map(z => (
            <TouchableOpacity 
              key={z} 
              className={`px-4 py-2 rounded-full mr-2 ${zone === z ? 'bg-comet-orange' : 'bg-comet-card'}`}
              onPress={() => setZone(z)}
            >
              <Text className={zone === z ? 'text-black font-bold' : 'text-comet-fg'}>{z}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Shift</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {Object.values(ShiftEnum).map(s => (
            <TouchableOpacity 
              key={s} 
              className={`px-4 py-2 rounded-full mr-2 ${shift === s ? 'bg-comet-orange' : 'bg-comet-card'}`}
              onPress={() => setShift(s as ShiftEnum)}
            >
              <Text className={shift === s ? 'text-black font-bold' : 'text-comet-fg capitalize'}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Headcount */}
      <Card className="mb-4 border border-comet-border p-3">
        <Text className="text-comet-fg font-bold mb-3">Headcount</Text>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-comet-fg-muted text-xs mb-1">Regular</Text>
            <TextInput
              className="bg-comet-card text-comet-fg p-2 rounded"
              placeholder="0"
              placeholderTextColor="#76808F"
              keyboardType="numeric"
              value={regularCount}
              onChangeText={setRegularCount}
            />
          </View>
          <View className="flex-1">
            <Text className="text-comet-fg-muted text-xs mb-1">Contract</Text>
            <TextInput
              className="bg-comet-card text-comet-fg p-2 rounded"
              placeholder="0"
              placeholderTextColor="#76808F"
              keyboardType="numeric"
              value={contractCount}
              onChangeText={setContractCount}
            />
          </View>
        </View>
      </Card>

      {/* Production */}
      <Card className="mb-4 border border-comet-border p-3">
        <Text className="text-comet-fg font-bold mb-3">Production Estimates</Text>
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Text className="text-comet-fg-muted text-xs mb-1">Coal (Tonnes)</Text>
            <TextInput
              className="bg-comet-card text-comet-fg p-2 rounded"
              placeholder="0.0"
              placeholderTextColor="#76808F"
              keyboardType="decimal-pad"
              value={coalTonnes}
              onChangeText={setCoalTonnes}
            />
          </View>
          <View className="flex-1">
            <Text className="text-comet-fg-muted text-xs mb-1">OB (Cu.m)</Text>
            <TextInput
              className="bg-comet-card text-comet-fg p-2 rounded"
              placeholder="0.0"
              placeholderTextColor="#76808F"
              keyboardType="decimal-pad"
              value={obCum}
              onChangeText={setObCum}
            />
          </View>
        </View>
      </Card>

      {/* Gas Readings */}
      <Card className="mb-4 border border-comet-border p-3">
        <Text className="text-comet-fg font-bold mb-3">Gas Readings</Text>
        {ch4AlertFired && (
          <View className="bg-red-500/20 p-2 rounded mb-3 flex-row items-center">
            <AlertTriangle color="#ef4444" size={16} className="mr-2" />
            <Text className="text-red-500 font-bold text-xs">CRITICAL: CH4 {'>'} 1.25% detected. Statutory alert triggered.</Text>
          </View>
        )}
        
        {gasReadings.map((reading, idx) => (
          <View key={idx} className="mb-4 border-b border-comet-border pb-3 last:border-0 last:pb-0">
            <TextInput
              className="bg-comet-card text-comet-fg p-2 rounded mb-2"
              placeholder="Location (e.g. Face 1)"
              placeholderTextColor="#76808F"
              value={reading.location}
              onChangeText={(val) => updateGasReading(idx, 'location', val)}
            />
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Text className="text-comet-fg-muted text-xs mb-1">CH4 (%)</Text>
                <TextInput
                  className="bg-comet-card text-comet-fg p-2 rounded"
                  placeholder="0.0"
                  placeholderTextColor="#76808F"
                  keyboardType="decimal-pad"
                  value={reading.ch4}
                  onChangeText={(val) => updateGasReading(idx, 'ch4', val)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-comet-fg-muted text-xs mb-1">CO (ppm)</Text>
                <TextInput
                  className="bg-comet-card text-comet-fg p-2 rounded"
                  placeholder="0"
                  placeholderTextColor="#76808F"
                  keyboardType="decimal-pad"
                  value={reading.co}
                  onChangeText={(val) => updateGasReading(idx, 'co', val)}
                />
              </View>
              <View className="flex-1">
                <Text className="text-comet-fg-muted text-xs mb-1">O2 (%)</Text>
                <TextInput
                  className="bg-comet-card text-comet-fg p-2 rounded"
                  placeholder="20.9"
                  placeholderTextColor="#76808F"
                  keyboardType="decimal-pad"
                  value={reading.o2}
                  onChangeText={(val) => updateGasReading(idx, 'o2', val)}
                />
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={addGasReading} className="mt-2 items-center p-2 bg-comet-card rounded">
          <Text className="text-comet-orange font-bold">+ Add Reading</Text>
        </TouchableOpacity>
      </Card>

      {/* Handover Notes */}
      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Handover Notes</Text>
        <TextInput
          className="bg-comet-card text-comet-fg p-3 rounded"
          placeholder="Any important notes for the next shift overman..."
          placeholderTextColor="#76808F"
          multiline
          numberOfLines={3}
          value={handoverNotes}
          onChangeText={setHandoverNotes}
        />
      </View>

      {/* GPS Stamp */}
      <View className="mb-4">
        <GeoStampDisplay {...geoStamp} />
      </View>

      {/* Submit */}
      <Button 
        onPress={handleSubmit} 
        className="mt-4 bg-comet-orange" 
      >
        <Text className="text-black font-bold">Sign & Lock Shift Report</Text>
      </Button>
    </ScrollView>
  );
}
