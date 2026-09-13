import { LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Attempt to bypass read-only Event.NONE properties
if (typeof Event !== 'undefined') {
  try {
    Object.defineProperty(Event, 'NONE', { value: 0, writable: true, configurable: true });
  } catch (e) {}
  try {
    Object.defineProperty(Event.prototype, 'NONE', { value: 0, writable: true, configurable: true });
  } catch (e) {}
}

LogBox.ignoreLogs([
  'JSI SQLiteAdapter not available',
  'Cannot assign to read-only property',
]);

// Fetch overrides in the background
AsyncStorage.getItem('DEV_API_URL').then(apiUrl => {
  if (apiUrl) global.DEV_API_URL = apiUrl;
}).catch(() => {});

AsyncStorage.getItem('DEV_SUPABASE_URL').then(supabaseUrl => {
  if (supabaseUrl) global.DEV_SUPABASE_URL = supabaseUrl;
}).catch(() => {});

import "expo-router/entry";
