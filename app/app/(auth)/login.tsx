import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setOfflineAuthenticated = useAuthStore(state => state.setOfflineAuthenticated);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      setOfflineAuthenticated(true);
      router.replace('/(app)/home');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 justify-center px-6 bg-binance-canvas-dark"
    >
      <View className="mb-12 items-center">
        <Text className="text-binance-primary font-bold text-5xl mb-2 tracking-tighter">COMET</Text>
        <Text className="text-binance-muted-strong text-lg">Field Operations</Text>
      </View>

      <Card className="gap-4 py-8">
        <Text className="text-binance-on-dark font-bold text-2xl mb-2">Log In</Text>
        
        <View>
          <Text className="text-binance-muted text-sm mb-1">Email</Text>
          <TextInput 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
            placeholderTextColor="#707a8a"
            className="bg-binance-surface-elevated-dark text-binance-on-dark px-4 py-3 rounded-lg border border-binance-hairline-on-dark"
          />
        </View>

        <View className="mb-4">
          <Text className="text-binance-muted text-sm mb-1">Password</Text>
          <TextInput 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor="#707a8a"
            className="bg-binance-surface-elevated-dark text-binance-on-dark px-4 py-3 rounded-lg border border-binance-hairline-on-dark"
          />
        </View>

        <Button onPress={handleLogin} disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </Card>
    </KeyboardAvoidingView>
  );
}
