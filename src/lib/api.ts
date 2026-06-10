import { clearTokens, getToken, setTokens } from '@/src/lib/auth';
import { ApiError, AuthService, OpenAPI } from '@/src/lib/apiClient';

OpenAPI.BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://www.rakam.app';

export class AuthExpiredError extends Error {
  constructor() {
    super('Session expired');
    this.name = 'AuthExpiredError';
  }
}

/** Load access token from SecureStore into OpenAPI.TOKEN. Call once on app start. */
export async function bootstrapToken(): Promise<void> {
  const token = await getToken('ACCESS_TOKEN');
  OpenAPI.TOKEN = token ?? undefined;
}

async function forceSignOut(): Promise<void> {
  await clearTokens();
  OpenAPI.TOKEN = undefined;
}

async function tryRefreshSession(): Promise<boolean> {
  const refreshToken = await getToken('REFRESH_TOKEN');
  if (!refreshToken) {
    return false;
  }

  try {
    const { session } = await AuthService.postApiAuthRefresh({
      refresh_token: refreshToken,
    });
    const accessToken = session?.access_token;
    const newRefreshToken = session?.refresh_token;
    if (!accessToken || !newRefreshToken) {
      return false;
    }
    await setTokens(accessToken, newRefreshToken);
    OpenAPI.TOKEN = accessToken;
    return true;
  } catch {
    return false;
  }
}

/**
 * Wrap every authenticated API call so the token stays in sync and 401s refresh once.
 *
 * @example
 * const me = await withAuth(() => AuthService.getApiAuthMe());
 * const { numbers } = await withAuth(() => NumbersService.getApiNumbers());
 */
export async function withAuth<T>(fn: () => Promise<T>): Promise<T> {
  await bootstrapToken();

  try {
    return await fn();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshed = await tryRefreshSession();
    if (!refreshed) {
      await forceSignOut();
      throw new AuthExpiredError();
    }

    try {
      return await fn();
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        await forceSignOut();
        throw new AuthExpiredError();
      }
      throw retryError;
    }
  }
}
