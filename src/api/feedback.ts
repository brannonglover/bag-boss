import Constants from 'expo-constants';

import { API_BASE_URL } from './config';

export async function sendFeedback({ type, message }: { type: string; message: string }) {
  const res = await fetch(`${API_BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app: 'Bag Count',
      appVersion: Constants.expoConfig?.version ?? 'unknown',
      message: message.trim(),
      type: type || 'General',
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error || 'Failed to send feedback');
  }

  return data;
}
