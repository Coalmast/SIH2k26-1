import { LogBox } from 'react-native';

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

import "expo-router/entry";
