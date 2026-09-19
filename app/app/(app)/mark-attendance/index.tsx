import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Dimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, MapPin, MapPinned, Scan, X } from 'lucide-react-native';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';

// Simulated step flow
type Step = 'IDLE' | 'SCANNING' | 'SUCCESS';

export default function MarkAttendanceScreen() {
  const [step, setStep] = useState<Step>('IDLE');
  
  // Camera State
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  // Location State
  const [locationState, setLocationState] = useState<{
    coords: { latitude: number; longitude: number } | null;
    status: 'loading' | 'success' | 'error';
  }>({ coords: null, status: 'loading' });

  // Scanned Data State
  const [scannedData, setScannedData] = useState<{
    rawPayload: string;
    parsedName: string;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    // Acquire GPS as soon as the screen loads
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationState({ coords: null, status: 'error' });
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocationState({
          coords: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          status: 'success'
        });
      } catch (e) {
        setLocationState({ coords: null, status: 'error' });
      }
    })();
  }, []);

  const handleOpenScanner = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Permission required', 'Camera permission is needed to scan QR codes.');
        return;
      }
    }
    setStep('SCANNING');
  };

  const handleBarcodeScanned = (scanningResult: { type: string; data: string }) => {
    // Prevent multiple scans
    if (step !== 'SCANNING') return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    let parsedName = 'Worker';
    try {
      // Try to parse JSON if it is structured data
      const parsed = JSON.parse(scanningResult.data);
      if (parsed && parsed.name) {
        parsedName = parsed.name;
      }
    } catch {
      // If it's just a raw string, use it directly or keep "Worker"
      parsedName = scanningResult.data.length < 50 ? scanningResult.data : 'Worker';
    }

    setScannedData({
      rawPayload: scanningResult.data,
      parsedName: parsedName,
      timestamp: Date.now(),
    });
    
    setStep('SUCCESS');
  };

  const handleDone = () => {
    // Dispose data and return to home
    setScannedData(null);
    setStep('IDLE');
    router.push('/(app)/home');
  };

  // If in Success state
  if (step === 'SUCCESS' && scannedData) {
    return (
      <View className="flex-1 bg-comet-canvas justify-center px-6">
        <Card className="bg-comet-card border border-green-500/50 items-center p-8">
          <View className="bg-green-500/20 p-4 rounded-full mb-6">
            <CheckCircle2 size={64} color="#22c55e" />
          </View>
          
          <Text className="text-comet-fg text-2xl font-bold mb-2 text-center">Attendance Marked</Text>
          <Text className="text-green-400 font-bold text-xl mb-6 text-center">{scannedData.parsedName}</Text>
          
          <View className="w-full bg-black/30 rounded p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Scan size={16} color="#a8a29e" className="mr-2" />
              <Text className="text-comet-fg-muted text-xs flex-1" numberOfLines={2}>
                QR: {scannedData.rawPayload.substring(0, 30)}...
              </Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <MapPinned size={16} color="#a8a29e" className="mr-2" />
              {locationState.coords ? (
                <Text className="text-comet-fg-muted text-xs">
                  {locationState.coords.latitude.toFixed(5)}, {locationState.coords.longitude.toFixed(5)}
                </Text>
              ) : (
                <Text className="text-comet-fg-muted text-xs">Location Unavailable</Text>
              )}
            </View>
            
            <Text className="text-comet-fg-muted text-xs text-center mt-4">
              {new Date(scannedData.timestamp).toLocaleString()}
            </Text>
          </View>
          
          <Button variant="primary" onPress={handleDone} className="w-full">
            Done
          </Button>
        </Card>
      </View>
    );
  }

  // If in Idle state
  return (
    <ScrollView className="flex-1 bg-comet-canvas px-4 py-6">
      <Text className="text-comet-fg text-3xl font-bold mb-6">Mark Attendance</Text>
      
      <Card className="mb-6">
        <View className="flex-row items-center mb-4">
          <View className="bg-comet-orange/20 p-2 rounded-full mr-3">
            <Scan size={24} color="#f97316" />
          </View>
          <View>
            <Text className="text-comet-fg font-bold text-lg">QR Scanner</Text>
            <Text className="text-comet-fg-muted text-sm">Scan worker ID card</Text>
          </View>
        </View>
        
        <Text className="text-comet-fg-muted mb-6">
          This will scan the dynamic QR code on the worker's ID and mark their attendance along with the current GPS location.
        </Text>
        
        <View className="bg-black/30 rounded p-3 mb-6 flex-row items-center">
          <MapPin size={20} color={locationState.status === 'success' ? '#22c55e' : locationState.status === 'error' ? '#ef4444' : '#f97316'} className="mr-3" />
          <View>
            <Text className="text-comet-fg text-sm font-semibold">GPS Status</Text>
            {locationState.status === 'loading' && <Text className="text-comet-fg-muted text-xs">Acquiring location...</Text>}
            {locationState.status === 'success' && locationState.coords && (
              <Text className="text-green-400 text-xs">Lat: {locationState.coords.latitude.toFixed(4)}, Lng: {locationState.coords.longitude.toFixed(4)}</Text>
            )}
            {locationState.status === 'error' && <Text className="text-red-400 text-xs">Location access denied or failed</Text>}
          </View>
        </View>
        
        <Button onPress={handleOpenScanner} className="w-full flex-row items-center justify-center py-4">
          <Scan size={20} color="#fff" className="mr-2" />
          <Text className="text-white font-bold text-lg">Open Scanner</Text>
        </Button>
      </Card>

      {/* Camera Modal */}
      <Modal visible={step === 'SCANNING'} animationType="slide" transparent={false}>
        <View className="flex-1 bg-black">
          {step === 'SCANNING' && cameraPermission?.granted && (
            <CameraView 
              style={{ flex: 1 }} 
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={handleBarcodeScanned}
            >
              <View className="flex-1 justify-between p-6">
                <View className="items-end mt-12">
                  <TouchableOpacity 
                    className="bg-black/60 p-3 rounded-full flex-row items-center"
                    onPress={() => setStep('IDLE')}
                  >
                    <X size={20} color="#fff" className="mr-2" />
                    <Text className="text-white font-bold">Cancel</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Viewfinder overlay */}
                <View className="flex-1 items-center justify-center">
                  <View className="w-64 h-64 border-2 border-comet-orange bg-transparent rounded-lg">
                    {/* Corner accents */}
                    <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -mt-1 -ml-1" />
                    <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white -mt-1 -mr-1" />
                    <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -mb-1 -ml-1" />
                    <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white -mb-1 -mr-1" />
                  </View>
                  <Text className="text-white font-semibold mt-8 bg-black/60 px-4 py-2 rounded-full">
                    Position QR code within frame
                  </Text>
                </View>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}
