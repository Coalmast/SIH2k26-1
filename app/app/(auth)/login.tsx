import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import * as LocalAuthentication from 'expo-local-authentication';
import { Mail, Lock, Fingerprint, ChevronRight } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login Failed', error.message);
    setLoading(false);
  }

  async function signInWithMagicLink() {
    if (!email) {
      Alert.alert('Email required', 'Please enter your email for the magic link.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    });

    if (error) Alert.alert('Failed', error.message);
    else Alert.alert('Success', 'Check your email for the login link!');
    setLoading(false);
  }

  async function handleBiometricLogin() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Biometrics to login',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        // Here we could try to restore the session if we kept it stored securely
        Alert.alert('Success', 'Biometric authentication successful (Session restoration placeholder)');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric login failed.');
    }
  }

  return (
    <View className="flex-1 bg-navy dark:bg-navy-dark px-6 justify-center">
      <View className="items-center mb-10">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
          <Text className="text-navy font-bold text-xl">COMET</Text>
        </View>
        <Text className="text-white text-2xl font-bold text-center">COMET Field App</Text>
        <Text className="text-white/80 text-center mt-2 text-sm">
          Coal Operations Monitoring, Enforcement & Transparency
        </Text>
      </View>

      <View className="space-y-4">
        <View className="flex-row items-center bg-white/10 rounded-lg px-4 py-3">
          <Mail color="white" size={20} className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Email / Employee ID"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="flex-row items-center bg-white/10 rounded-lg px-4 py-3 mb-2">
          <Lock color="white" size={20} className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className="bg-amber flex-row items-center justify-center rounded-lg py-3 mt-4"
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">SIGN IN</Text>
              <ChevronRight color="white" size={20} />
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row items-center py-4">
          <View className="flex-1 h-[1px] bg-white/20" />
          <Text className="text-white/50 px-4 text-sm">or</Text>
          <View className="flex-1 h-[1px] bg-white/20" />
        </View>

        <TouchableOpacity 
          className="border border-white/30 rounded-lg py-3 flex-row items-center justify-center"
          onPress={signInWithMagicLink}
          disabled={loading}
        >
          <Mail color="white" size={18} className="mr-2" />
          <Text className="text-white text-base">Send Magic Link</Text>
        </TouchableOpacity>

        {isBiometricSupported && (
          <TouchableOpacity 
            className="border border-white/30 rounded-lg py-3 mt-4 flex-row items-center justify-center"
            onPress={handleBiometricLogin}
          >
            <Fingerprint color="white" size={18} className="mr-2" />
            <Text className="text-white text-base">Biometric Login</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text className="text-white/50 text-center mt-10 text-xs">
        Need help? Contact your mine admin
      </Text>
    </View>
  );
}
