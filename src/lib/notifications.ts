import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { withAuth } from '@/src/lib/api';
import type { PhoneNumber } from '@/src/lib/apiClient';
import { getToken } from '@/src/lib/auth';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});   

// Regenerate OpenAPI client when POST /api/push/register is in the spec.
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://www.rakam.app';
const PUSH_REGISTER_URL = `${API_BASE}/api/push/register`;

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    await withAuth(async () => {
      const accessToken = await getToken('ACCESS_TOKEN');
      if (!accessToken) {
        return;
      }
      const response = await fetch(PUSH_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error(`Push registration failed: ${response.status}`);
      }
    });

    return token;
  } catch {
    return null;
  }
}

/** Requires a dev build (not Expo Go). Call after the user has at least one number. */
export async function checkAndRegisterPush(
  numbers: PhoneNumber[],
): Promise<void> {
  if (numbers.length === 0) {
    return;
  }
  await registerForPushNotifications();
}
