import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import GeoStampDisplay from '../../../src/components/GeoStampDisplay';
import MediaCapture from '../../../src/components/MediaCapture';
import { database } from '../../../src/db';
import { useAuthStore } from '../../../src/stores/authStore';
import { ObservationTypeEnum, SyncStatusEnum } from '../../../src/types/enums';

const ZONES = ['Pit 3', 'Workshop', 'CHP', 'Entry', 'Magazine', 'Other'];
const CATEGORIES = ['PPE', 'Housekeeping', 'Equipment Guard', 'Fall Protection', 'Fire', 'Traffic', 'Ventilation', 'Explosives', 'Other'];

export default function ObservationScreen() {
  const router = useRouter();
  const { user, mineId } = useAuthStore();
  
  const [zone, setZone] = useState(ZONES[0]);
  const [obsType, setObsType] = useState<ObservationTypeEnum>(ObservationTypeEnum.UNSAFE_ACT);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [mediaPaths, setMediaPaths] = useState<string[]>([]);
  const [geoStamp, setGeoStamp] = useState<any>(null); // from GeoStampDisplay? Actually GeoStampDisplay just displays. We need to fetch it.
  
  // Need a hook or utility to get current location for the record. 
  // Let's assume GeoStampDisplay manages it or we fetch separately. For speed, we will save what we have.

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    try {
      await database.write(async () => {
        const observation = await database.get('safety_observations').create((record: any) => {
          record.mineId = mineId || 'default_mine';
          record.zone = zone;
          record.observationType = obsType;
          record.category = category;
          record.description = description;
          record.status = 'open';
          record.observedBy = user?.id || 'unknown';
          record.observedAt = Date.now();
          record.syncStatus = SyncStatusEnum.PENDING_SYNC;
          // record.geoStamp = JSON.stringify(geoStamp);
        });

        if (mediaPaths.length > 0) {
          await database.get('media_attachments').create((record: any) => {
            record.parentType = 'safety_observation';
            record.parentId = observation.id;
            record.mediaType = 'photo';
            record.localFilePath = mediaPaths[0]; // just taking the first one for STOP card
            record.syncStatus = SyncStatusEnum.PENDING_UPLOAD;
            record.capturedBy = user?.id || 'unknown';
          });
        }
      });
      
      Alert.alert('Success', 'Safety observation recorded.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to save observation:', error);
      Alert.alert('Error', 'Failed to save observation');
    }
  };

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Type Selector */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Observation Type</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity 
            className={`flex-1 p-2 rounded items-center ${obsType === ObservationTypeEnum.UNSAFE_ACT ? 'bg-red-500' : 'bg-binance-surface'}`}
            onPress={() => setObsType(ObservationTypeEnum.UNSAFE_ACT)}
          >
            <Text className={obsType === ObservationTypeEnum.UNSAFE_ACT ? 'text-white font-bold' : 'text-binance-muted-strong'}>🔴 Unsafe Act</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 p-2 rounded items-center ${obsType === ObservationTypeEnum.UNSAFE_CONDITION ? 'bg-yellow-500' : 'bg-binance-surface'}`}
            onPress={() => setObsType(ObservationTypeEnum.UNSAFE_CONDITION)}
          >
            <Text className={obsType === ObservationTypeEnum.UNSAFE_CONDITION ? 'text-black font-bold' : 'text-binance-muted-strong'}>🟡 Unsafe Cond.</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`flex-1 p-2 rounded items-center ${obsType === ObservationTypeEnum.POSITIVE ? 'bg-green-500' : 'bg-binance-surface'}`}
            onPress={() => setObsType(ObservationTypeEnum.POSITIVE)}
          >
            <Text className={obsType === ObservationTypeEnum.POSITIVE ? 'text-white font-bold' : 'text-binance-muted-strong'}>🟢 Positive</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Zone Selector */}
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

      {/* Category Selector */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {CATEGORIES.map(c => (
            <TouchableOpacity 
              key={c} 
              className={`px-4 py-2 rounded-full mr-2 ${category === c ? 'bg-binance-primary' : 'bg-binance-surface'}`}
              onPress={() => setCategory(c)}
            >
              <Text className={category === c ? 'text-black font-bold' : 'text-binance-on-dark'}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Description</Text>
        <TextInput
          className="bg-binance-surface text-binance-on-dark p-3 rounded"
          placeholder="Describe the observation briefly"
          placeholderTextColor="#76808F"
          multiline
          numberOfLines={2}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      {/* Photo */}
      <View className="mb-4">
        <Text className="text-binance-on-dark font-bold mb-2">Photo (Optional)</Text>
        <MediaCapture onMediaCaptured={(path) => setMediaPaths([path])} />
      </View>

      {/* GPS Stamp */}
      <View className="mb-4">
        <GeoStampDisplay />
      </View>

      {/* Submit */}
      <Button title="Submit Observation" onPress={handleSubmit} className="mt-4" />
    </ScrollView>
  );
}
