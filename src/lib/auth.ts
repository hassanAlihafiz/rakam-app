import * as SecureStore from 'expo-secure-store';

export const SESSION_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export type TokenKey = keyof typeof SESSION_KEYS;

export async function getToken(
  key: TokenKey,
): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SESSION_KEYS[key]);
  } catch {
    return null;
  }
}

export async function setTokens(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(SESSION_KEYS.REFRESH_TOKEN, refreshToken);
  } catch {
    // fail silently
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SESSION_KEYS.REFRESH_TOKEN);
  } catch {
    // fail silently
  }
}

export async function hasValidSession(): Promise<boolean> {
  try {
    const accessToken = await SecureStore.getItemAsync(
      SESSION_KEYS.ACCESS_TOKEN,
    );
    return accessToken != null && accessToken.length > 0;
  } catch {
    return false;
  }
}
