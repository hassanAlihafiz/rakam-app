import type { QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

import { ApiError, NumbersService } from '@/src/lib/apiClient';
import { AuthExpiredError, withAuth } from '@/src/lib/api';
import { clearTokens } from '@/src/lib/auth';
import type { TranslationKey } from '@/src/lib/i18n';

type ReleaseNumberOptions = {
  numberId: string;
  t: (key: TranslationKey, options?: Record<string, unknown>) => string;
  queryClient: QueryClient;
  onSuccess?: () => void;
};

async function executeRelease({
  numberId,
  t,
  queryClient,
  onSuccess,
}: ReleaseNumberOptions): Promise<void> {
  try {
    await withAuth(() => NumbersService.postApiNumbersRelease(numberId));
    await queryClient.invalidateQueries({ queryKey: ['numbers'] });
    onSuccess?.();
  } catch (error) {
    if (error instanceof AuthExpiredError) {
      await clearTokens();
      router.replace('/auth/signin');
      return;
    }
    if (error instanceof ApiError) {
      Alert.alert(t('common.error_network'));
      return;
    }
    Alert.alert(t('common.error_network'));
  }
}

export function promptReleaseNumber(options: ReleaseNumberOptions): void {
  const { t } = options;
  Alert.alert(t('number.release_title'), t('number.release_warning'), [
    { text: t('common.cancel'), style: 'cancel' },
    {
      text: t('number.release_confirm'),
      style: 'destructive',
      onPress: () => void executeRelease(options),
    },
  ]);
}

export function promptReleaseMenu(options: ReleaseNumberOptions): void {
  const { t } = options;

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [t('common.cancel'), t('number.release')],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          promptReleaseNumber(options);
        }
      },
    );
    return;
  }

  Alert.alert(t('number.release'), '', [
    { text: t('common.cancel'), style: 'cancel' },
    {
      text: t('number.release'),
      style: 'destructive',
      onPress: () => promptReleaseNumber(options),
    },
  ]);
}
