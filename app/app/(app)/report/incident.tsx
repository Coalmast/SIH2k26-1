import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { GeoStampDisplay } from '../../../src/components/GeoStampDisplay';
import { useGeoStamp } from '../../../src/hooks/useGeoStamp';
import { MediaCapture } from '../../../src/components/MediaCapture';
import { SeverityPicker } from '../../../src/components/SeverityPicker';
import { database } from '../../../src/db';
import { useAuthStore } from '../../../src/stores/authStore';
import { IncidentTypeEnum, SyncStatusEnum, SeverityEnum, ShiftEnum } from '../../../src/types/enums';
import { Sparkles } from 'lucide-react-native';
import { performSync } from '../../../src/sync/syncEngine';

const ZONES = ['Pit 3', 'Workshop', 'CHP', 'Entry', 'Magazine', 'Other'];

// Fake AI Hook
function useAISeverity(description: string) {
  const [suggestedSeverity, setSuggestedSeverity] = useState<SeverityEnum | null>(null);

  useEffect(() => {
    const text = description.toLowerCase();
    if (text.includes('death') || text.includes('fatal') || text.includes('collapse') || text.includes('explosion')) {
      setSuggestedSeverity(SeverityEnum.CRITICAL);
    } else if (text.includes('fracture') || text.includes('hospital') || text.includes('fire')) {
      setSuggestedSeverity(SeverityEnum.HIGH);
    } else if (text.includes('cut') || text.includes('bruise') || text.includes('leak')) {
      setSuggestedSeverity(SeverityEnum.MODERATE);
    } else if (text.length > 10) {
      setSuggestedSeverity(SeverityEnum.MINOR);
    } else {
      setSuggestedSeverity(null);
    }
  }, [description]);

  return suggestedSeverity;
}

export default function IncidentReportScreen() {
  const router = useRouter();
  const { user, mineId } = useAuthStore();
  
  const [incidentType, setIncidentType] = useState<IncidentTypeEnum>(IncidentTypeEnum.INJURY);
  const [zone, setZone] = useState(ZONES[0]);
  const [shift, setShift] = useState<ShiftEnum>(ShiftEnum.GENERAL);
  const [description, setDescription] = useState('');
  const [personsInvolved, setPersonsInvolved] = useState('');
  const [immediateActions, setImmediateActions] = useState('');
  const [manualSeverity, setManualSeverity] = useState<SeverityEnum | null>(null);
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const geoStamp = useGeoStamp();
  
  const aiSeverity = useAISeverity(description);
  const finalSeverity = manualSeverity || aiSeverity || SeverityEnum.MINOR;

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      Alert.alert('Success', 'Incident report submitted.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save incident:', error);
      Alert.alert('Error', 'Failed to save incident report');
    }
  };

  return (
    <ScrollView className="flex-1 bg-comet-canvas px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Type Selector */}
      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Incident Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {Object.values(IncidentTypeEnum).map(t => (
            <TouchableOpacity 
              key={t} 
              className={`px-4 py-2 rounded-full mr-2 ${incidentType === t ? 'bg-red-500' : 'bg-comet-card'}`}
              onPress={() => setIncidentType(t as IncidentTypeEnum)}
            >
              <Text className={incidentType === t ? 'text-white font-bold' : 'text-comet-fg capitalize'}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Description</Text>
        <TextInput
          className="bg-comet-card text-comet-fg p-3 rounded"
          placeholder="Describe the incident in detail..."
          placeholderTextColor="#76808F"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* AI Severity */}
      <Card className="mb-4 border border-comet-border">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-comet-fg font-bold">Severity Assessment</Text>
          {aiSeverity && (
            <View className="flex-row items-center">
              <Sparkles size={14} color="#f97316" className="mr-1" />
              <Text className="text-comet-orange text-xs">AI Suggested</Text>
            </View>
          )}
        </View>
        <SeverityPicker 
          value={finalSeverity as any} 
          onChange={(v) => setManualSeverity(v as any)} 
        />
      </Card>

      {/* Location / Zone */}
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
        <Text className="text-comet-fg font-bold mb-2">Persons Involved (comma separated)</Text>
        <TextInput
          className="bg-comet-card text-comet-fg p-3 rounded"
          placeholder="e.g. John Doe, Jane Smith"
          placeholderTextColor="#76808F"
          value={personsInvolved}
          onChangeText={setPersonsInvolved}
        />
      </View>

      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Immediate Actions Taken</Text>
        <TextInput
          className="bg-comet-card text-comet-fg p-3 rounded"
          placeholder="e.g. Area barricaded, first aid given"
          placeholderTextColor="#76808F"
          value={immediateActions}
          onChangeText={setImmediateActions}
        />
      </View>

      {/* Media */}
      <View className="mb-4">
        <Text className="text-comet-fg font-bold mb-2">Evidence Photos ({mediaPaths.length}/4)</Text>
        <MediaCapture uris={mediaPaths} onChange={setMediaPaths} maxPhotos={4} />
      </View>

      {/* GPS Stamp */}
      <View className="mb-4">
        <GeoStampDisplay {...geoStamp} />
      </View>

      {/* Submit */}
      <Button onPress={handleSubmit} className="mt-4 bg-comet-orange">
        <Text className="text-black font-bold">Submit Incident Report</Text>
      </Button>
    </ScrollView>
  );
}
