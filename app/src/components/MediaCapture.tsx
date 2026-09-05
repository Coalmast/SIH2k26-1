import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface MediaCaptureProps {
  uris: string[];
  onChange: (uris: string[]) => void;
  maxPhotos?: number;
}

export function MediaCapture({ uris, onChange, maxPhotos = 5 }: MediaCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  if (!permission) {
    return <View />;
  }

  const handleTakePhoto = async () => {
    if (!permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }
    }
    setIsCameraActive(true);
  };

  const captureImage = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.7 });
        if (photo) {
          onChange([...uris, photo.uri]);
          setIsCameraActive(false);
        }
      } catch (e) {
        console.error('Failed to take photo', e);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const removePhoto = (indexToRemove: number) => {
    onChange(uris.filter((_, index) => index !== indexToRemove));
  };

  if (isCameraActive) {
    return (
      <View className="h-64 rounded-lg overflow-hidden my-2">
        <CameraView 
          ref={(ref) => setCameraRef(ref)} 
          className="flex-1" 
          facing="back"
        >
          <View className="flex-1 bg-transparent flex-row justify-between items-end p-4">
            <TouchableOpacity 
              className="bg-binance-surface-elevated-dark p-3 rounded-full"
              onPress={() => setIsCameraActive(false)}
            >
              <Text className="text-binance-on-dark font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-16 h-16 rounded-full bg-white border-4 border-binance-primary/50 items-center justify-center mb-2"
              onPress={captureImage}
            />
            
            <View className="w-16" /> {/* Placeholder for layout balance */}
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View className="mt-2">
      {uris.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row">
            {uris.map((uri, index) => (
              <View key={index} className="mr-2 relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-md bg-binance-surface-card-dark" />
                <TouchableOpacity 
                  className="absolute -top-2 -right-2 bg-binance-trading-down rounded-full w-6 h-6 items-center justify-center border-2 border-binance-ink"
                  onPress={() => removePhoto(index)}
                >
                  <Text className="text-white text-xs font-bold">✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {uris.length < maxPhotos && (
        <TouchableOpacity 
          className="bg-binance-surface-card-dark border border-binance-border-strong rounded-lg p-3 flex-row items-center justify-center border-dashed"
          onPress={handleTakePhoto}
        >
          <Text className="text-xl mr-2">📸</Text>
          <Text className="text-binance-on-dark font-medium">Take Photo ({uris.length}/{maxPhotos})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
