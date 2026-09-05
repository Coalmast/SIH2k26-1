import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { database } from '../../../src/db';
import { useAuthStore } from '../../../src/stores/authStore';
import { SyncStatusEnum, ShiftEnum } from '../../../src/types/enums';
import { Q as QNative } from '@nozbe/watermelondb'; // Import Q for querying

export default function AttendanceScreen() {
  const { mineId } = useAuthStore();
  const [cardNumber, setCardNumber] = useState('');
  const [shift, setShift] = useState<ShiftEnum>(ShiftEnum.A);
  const [scanResult, setScanResult] = useState<{status: 'success'|'error', message: string, workerName?: string} | null>(null);

  // Simulated scan handler
  const handleScan = async (scannedCardNumber: string) => {
    if (!scannedCardNumber.trim()) return;

    try {
      // 1. Validate worker against local cache
      const workersColl = database.collections.get('contract_workers');
      // Fix Q usage: it is Q() on the query, not QNative directly. Wait, we imported it as QNative.
      // Actually watermelondb uses import { Q } from '@nozbe/watermelondb'.
      // workersColl.query(QNative.where('worker_id_card_number', scannedCardNumber)).fetch()
      // To avoid TS issues if Q isn't exported as expected, let's just query and filter if needed, or assume it works:
      // Note: In WatermelonDB, query with Q is the standard. Let's assume standard import works.

      // We will do a generic query for simplicity if Q causes issues:
      // const allWorkers = await workersColl.query().fetch();
      // const worker = allWorkers.find(w => w.workerIdCardNumber === scannedCardNumber);
      
      const allWorkers = await workersColl.query().fetch();
      const worker: any = allWorkers.find((w: any) => w.workerIdCardNumber === scannedCardNumber);

      let isTrainingExpired = false;
      let workerName = 'Unknown Worker';
      let workerType = 'regular';
      let contractorId = null;

      if (worker) {
        workerName = worker.name;
        workerType = 'contract';
        contractorId = worker.contractorId;
        // Mock training expiration check based on certificates JSON
        try {
          const certs = JSON.parse(worker.trainingCertificates || '[]');
          // simplistic mock
          isTrainingExpired = certs.length === 0;
        } catch {
          isTrainingExpired = true; // assume expired if invalid JSON
        }
      } else {
        // If not in contract cache, assume it's a regular employee (or unknown). 
        // Real app would check regular employee cache too.
        isTrainingExpired = false; // Mocking false for regular
      }

      // 2. Mark Attendance
      await database.write(async () => {
        await database.get('attendance_records').create((record: any) => {
          record.mineId = mineId || 'default_mine';
          record.workerIdCardNumber = scannedCardNumber;
          record.workerName = workerName;
          record.workerType = workerType;
          record.contractorId = contractorId;
          record.shift = shift;
          record.checkInAt = Date.now();
          record.geoStamp = JSON.stringify({ lat: 0, lon: 0 }); // Mock geostamp
          record.locationMismatch = false; // Mock geofence check
          record.trainingExpired = isTrainingExpired;
          record.flaggedForReview = isTrainingExpired;
          record.syncStatus = SyncStatusEnum.PENDING_SYNC;
        });
      });

      if (isTrainingExpired) {
        setScanResult({ status: 'error', message: 'Training Expired! Flagged for review.', workerName });
      } else {
        setScanResult({ status: 'success', message: 'Attendance Marked.', workerName });
      }

      // Reset input for next scan
      setCardNumber('');

    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to process scan.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 py-6" keyboardShouldPersistTaps="handled">
      <Text className="text-binance-on-dark text-3xl font-bold mb-6">Attendance Scanner</Text>
      
      <View className="mb-6">
        <Text className="text-binance-on-dark font-bold mb-2">Current Shift</Text>
        <View className="flex-row gap-2">
          {Object.values(ShiftEnum).map(s => (
            <TouchableOpacity 
              key={s} 
              className={`flex-1 py-2 rounded items-center ${shift === s ? 'bg-binance-primary' : 'bg-binance-surface'}`}
              onPress={() => setShift(s as ShiftEnum)}
            >
              <Text className={shift === s ? 'text-black font-bold capitalize' : 'text-binance-on-dark capitalize'}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Card className="mb-6 border border-binance-border-strong">
        <Text className="text-binance-on-dark font-bold text-xl mb-4">Manual Entry / Scanner</Text>
        <Text className="text-binance-muted-strong text-xs mb-4">
          In a real device, this would be a headless barcode scanner loop.
        </Text>
        
        <TextInput
          className="bg-binance-surface text-binance-on-dark p-4 rounded text-lg text-center font-bold tracking-widest"
          placeholder="Enter ID Card Number"
          placeholderTextColor="#76808F"
          value={cardNumber}
          onChangeText={setCardNumber}
          onSubmitEditing={() => handleScan(cardNumber)}
          autoCapitalize="characters"
        />
        
        <Button 
          title="Process Scan" 
          onPress={() => handleScan(cardNumber)} 
          className="mt-4 bg-binance-primary" 
        />
      </Card>

      {scanResult && (
        <Card className={`mb-6 border ${scanResult.status === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <Text className={`font-bold text-lg mb-1 ${scanResult.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {scanResult.workerName}
          </Text>
          <Text className={scanResult.status === 'success' ? 'text-green-400' : 'text-red-400'}>
            {scanResult.message}
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
