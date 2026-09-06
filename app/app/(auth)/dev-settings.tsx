import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../../src/components/ui/Button';

export default function DevSettingsScreen() {
  const [apiUrl, setApiUrl] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedApi = await AsyncStorage.getItem('DEV_API_URL');
      const savedSupabase = await AsyncStorage.getItem('DEV_SUPABASE_URL');
      
      setApiUrl(savedApi || process.env.EXPO_PUBLIC_API_URL || '');
      setSupabaseUrl(savedSupabase || process.env.EXPO_PUBLIC_SUPABASE_URL || '');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      if (apiUrl) await AsyncStorage.setItem('DEV_API_URL', apiUrl);
      else await AsyncStorage.removeItem('DEV_API_URL');

      if (supabaseUrl) await AsyncStorage.setItem('DEV_SUPABASE_URL', supabaseUrl);
      else await AsyncStorage.removeItem('DEV_SUPABASE_URL');

      Alert.alert(
        'Saved successfully', 
        'Please restart the app (close it entirely from the app switcher and reopen it) to apply the new URLs.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem('DEV_API_URL');
      await AsyncStorage.removeItem('DEV_SUPABASE_URL');
      setApiUrl(process.env.EXPO_PUBLIC_API_URL || '');
      setSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL || '');
      Alert.alert('Reset', 'Restored to default .env values. Restart app to apply.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView className="flex-1 bg-binance-canvas-dark px-4 pt-12">
      <Text className="text-binance-primary font-bold text-3xl mb-6">Dev Settings</Text>
      
      <View className="mb-6">
        <Text className="text-binance-muted-strong font-bold mb-2">API URL (Backend)</Text>
        <TextInput 
          value={apiUrl}
          onChangeText={setApiUrl}
          className="bg-binance-surface-card-dark text-binance-on-dark p-4 rounded-xl border border-binance-border-strong mb-2"
          placeholderTextColor="#474D57"
          placeholder="e.g. https://my-backend.loca.lt"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text className="text-binance-muted text-xs">
          Default: {process.env.EXPO_PUBLIC_API_URL}
        </Text>
      </View>

      <View className="mb-8">
        <Text className="text-binance-muted-strong font-bold mb-2">Supabase URL</Text>
        <TextInput 
          value={supabaseUrl}
          onChangeText={setSupabaseUrl}
          className="bg-binance-surface-card-dark text-binance-on-dark p-4 rounded-xl border border-binance-border-strong mb-2"
          placeholderTextColor="#474D57"
          placeholder="e.g. https://my-supabase.loca.lt"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text className="text-binance-muted text-xs">
          Default: {process.env.EXPO_PUBLIC_SUPABASE_URL}
        </Text>
      </View>

      <Button onPress={handleSave} className="mb-4">
        <Text className="text-binance-ink font-bold text-lg">Save & Restart</Text>
      </Button>

      <Button variant="outline" onPress={handleReset} className="mb-12">
        <Text className="text-binance-on-dark font-bold text-lg">Reset to Defaults</Text>
      </Button>
    </ScrollView>
  );
}
