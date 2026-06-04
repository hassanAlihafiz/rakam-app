import { router } from 'expo-router';

import { AuthExpiredError, withAuth } from '@/src/lib/api';
import { clearTokens } from '@/src/lib/auth';

export async function runAuthQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await withAuth(fn);
  } catch (error) {
    if (error instanceof AuthExpiredError) {
      await clearTokens();
      router.replace('/auth/signin');
    }
    throw error;
  }
}
