import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// supabase-js auto-derives the Realtime WS URL from supabaseUrl:
//   ws://[host]:[port]/realtime/v1
// This goes through Kong (port 54321) which proxies to supabase_realtime_backend.
// No manual endpoint override is needed or supported.
if (__DEV__) {
  console.log('[SUPABASE] URL:', supabaseUrl);
  console.log('[SUPABASE] WS Realtime URL will be:', supabaseUrl.replace(/^http/, 'ws') + '/realtime/v1');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    timeout: 30000,
  },
});
