import { Stack } from 'expo-router';

export default function InspectLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="form" />
      <Stack.Screen name="report" />
    </Stack>
  );
}
