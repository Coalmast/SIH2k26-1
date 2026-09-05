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
      await database.write(async () => {
        const incident = await database.get('incident_reports').create((record: any) => {
          record.mineId = mineId || 'default_mine';
          record.reportedBy = user?.id || 'unknown';
          record.description = description;
          record.syncStatus = SyncStatusEnum.PENDING_SYNC;
          record.incidentType = incidentType;
          record.severity = finalSeverity;
          record.aiSuggestedSeverity = aiSeverity;
          record.zone = zone;
          record.shift = shift;
          record.personsInvolved = JSON.stringify(personsInvolved.split(',').map((s: string) => s.trim()).filter(Boolean));
          record.immediateActionsTaken = immediateActions;
          record.isLinkedToAccidentRegister = false;
          record.reportedAt = Date.now();
        });

        for (const path of mediaPaths) {
          await database.get('media_attachments').create((record: any) => {
            record.parentType = 'incident_report';
            record.parentId = incident.id;
            record.mediaType = 'photo';
            record.localFilePath = path;
            record.syncStatus = SyncStatusEnum.PENDING_UPLOAD;
            record.capturedBy = user?.id || 'unknown';
          });
        }
      });
      
      // Attempt priority sync immediately
      performSync().catch(console.error);
      
      Alert.alert('Success', 'Incident report submitted.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save incident:', error);
      Alert.alert('Error', 'Failed to save incident report');
    }
  };

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Type Selector */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Incident Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {Object.values(IncidentTypeEnum).map(t => (
            <TouchableOpacity 
              key={t} 
              className={`px-4 py-2 rounded-full mr-2 ${incidentType === t ? 'bg-red-500' : 'bg-binance-surface'}`}
              onPress={() => setIncidentType(t as IncidentTypeEnum)}
            >
              <Text className={incidentType === t ? 'text-white font-bold' : 'text-binance-on-dark capitalize'}>
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Description</Text>
        <TextInput
          className="bg-binance-surface text-binance-on-dark p-3 rounded"
          placeholder="Describe the incident in detail..."
          placeholderTextColor="#76808F"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* AI Severity */}
      <Card className="mb-4 border border-binance-border-strong">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-binance-on-dark font-bold">Severity Assessment</Text>
          {aiSeverity && (
            <View className="flex-row items-center">
              <Sparkles size={14} color="#FCD535" className="mr-1" />
              <Text className="text-binance-primary text-xs">AI Suggested</Text>
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
        <Text className="text-binance-on-dark font-bold mb-2">Zone</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {ZONES.map(z => (
            <TouchableOpacity 
              key={z} 
              className={`px-4 py-2 rounded-full mr-2 ${zone === z ? 'bg-binance-primary' : 'bg-binance-surface'}`}
              onPress={() => setZone(z)}
            >
              <Text className={zone === z ? 'text-black font-bold' : 'text-binance-on-dark'}>{z}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Persons Involved (comma separated)</Text>
        <TextInput
          className="bg-binance-surface text-binance-on-dark p-3 rounded"
          placeholder="e.g. John Doe, Jane Smith"
          placeholderTextColor="#76808F"
          value={personsInvolved}
          onChangeText={setPersonsInvolved}
        />
      </View>

      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Immediate Actions Taken</Text>
        <TextInput
          className="bg-binance-surface text-binance-on-dark p-3 rounded"
          placeholder="e.g. Area barricaded, first aid given"
          placeholderTextColor="#76808F"
          value={immediateActions}
          onChangeText={setImmediateActions}
        />
      </View>

      {/* Media */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Evidence Photos ({mediaPaths.length}/4)</Text>
        <MediaCapture uris={mediaPaths} onChange={setMediaPaths} maxPhotos={4} />
      </View>

      {/* GPS Stamp */}
      <View className="mb-4">
        <GeoStampDisplay {...geoStamp} />
      </View>

      {/* Submit */}
      <Button onPress={handleSubmit} className="mt-4 bg-binance-primary">
        <Text className="text-black font-bold">Submit Incident Report</Text>
      </Button>
    </ScrollView>
  );
}
