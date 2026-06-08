/**
 * API base URL for the Bag Count feedback backend.
 *
 * Local dev: defaults to localhost (iOS Simulator) or 10.0.2.2 (Android emulator).
 * Physical device: set EXPO_PUBLIC_API_URL in .env.development.local (e.g. http://192.168.1.x:5001)
 * Production: set via EAS build env (shared Cavaro Railway backend).
 */
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5001';
    }

    return 'http://localhost:5001';
  }

  return 'https://cavaro-production-9755.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();
