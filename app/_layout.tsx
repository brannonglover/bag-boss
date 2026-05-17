import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: '#0F172A' },
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '800' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Bag Boss' }} />
        <Stack.Screen name="history" options={{ title: 'Game History' }} />
      </Stack>
    </>
  );
}
