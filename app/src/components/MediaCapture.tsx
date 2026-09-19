import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Modal } from 'react-native';
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

  const [previewUri, setPreviewUri] = useState<string | null>(null);

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
          setPreviewUri(photo.uri);
        }
      } catch (e) {
        console.error('Failed to take photo', e);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const confirmPhoto = () => {
    if (previewUri) {
      onChange([...uris, previewUri]);
      setPreviewUri(null);
      setIsCameraActive(false);
    }
  };

  const retakePhoto = () => {
    setPreviewUri(null);
  };

  const cancelCamera = () => {
    setPreviewUri(null);
    setIsCameraActive(false);
  };

  const removePhoto = (indexToRemove: number) => {
    onChange(uris.filter((_, index) => index !== indexToRemove));
  };

  return (
    <View className="mt-2">
      {uris.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row">
            {uris.map((uri, index) => (
              <View key={index} className="mr-2 relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-md bg-comet-card" />
                <TouchableOpacity 
                  className="absolute -top-2 -right-2 bg-comet-down rounded-full w-6 h-6 items-center justify-center border-2 border-comet-sidebar-bg"
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
          className="bg-comet-card border border-comet-border rounded-lg p-3 flex-row items-center justify-center border-dashed"
          onPress={handleTakePhoto}
        >
          <Text className="text-xl mr-2">📸</Text>
          <Text className="text-comet-fg font-medium">Take Photo ({uris.length}/{maxPhotos})</Text>
        </TouchableOpacity>
      )}

      <Modal 
        visible={isCameraActive} 
        animationType="slide" 
        transparent={false}
        onRequestClose={cancelCamera}
      >
        <View className="flex-1 bg-black">
          {previewUri ? (
            <View className="flex-1">
              <Image source={{ uri: previewUri }} className="flex-1" resizeMode="contain" />
              <View className="absolute bottom-0 w-full flex-row justify-between px-8 py-8 bg-black/50">
                <TouchableOpacity 
                  className="bg-comet-card p-4 rounded-full border border-comet-border"
                  onPress={retakePhoto}
                >
                  <Text className="text-white font-bold text-lg">Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-comet-up p-4 px-8 rounded-full flex-row items-center"
                  onPress={confirmPhoto}
                >
                  <Text className="text-white font-bold text-xl mr-2">✓</Text>
                  <Text className="text-white font-bold text-lg">Use Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <CameraView 
              ref={(ref) => setCameraRef(ref)} 
              style={{ flex: 1 }} 
              facing="back"
            >
              <View className="flex-1 justify-between">
                <View className="p-6 pt-12 items-end">
                  <TouchableOpacity 
                    className="bg-black/50 p-3 rounded-full"
                    onPress={cancelCamera}
                  >
                    <Text className="text-white font-bold">✕ Cancel</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="w-full flex-row justify-center items-center pb-12">
                  <TouchableOpacity 
                    className="w-20 h-20 rounded-full bg-white border-4 border-comet-orange/50 items-center justify-center"
                    onPress={captureImage}
                  />
                </View>
              </View>
            </CameraView>
          )}
        </View>
      </Modal>
    </View>
  );
}
