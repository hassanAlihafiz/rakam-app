// IMPORTANT: add rakam://auth/callback to Supabase Dashboard
// Auth → URL Configuration → Redirect URLs

import { XCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, spacing, typography } from '@/src/constants/theme';
import { setTokens } from '@/src/lib/auth';
import { useTranslation } from '@/src/lib/i18n';

type CallbackTokens = {
  access_token?: string;
  refresh_token?: string;
};

function parseAuthCallbackUrl(url: string | null): CallbackTokens {
  if (!url) {
    return {};
  }
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) {
    return {};
  }
  const fragment = url.substring(hashIndex + 1);
  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token') ?? undefined;
  const refresh_token = params.get('refresh_token') ?? undefined;
  return { access_token, refresh_token };
}

export default function AuthCallbackScreen() {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(true);
  const [failed, setFailed] = useState(false);

  const handleCallbackUrl = useCallback(async (url: string | null) => {
    if (!url) {
      return;
    }

    setProcessing(true);
    setFailed(false);

    const { access_token, refresh_token } = parseAuthCallbackUrl(url);
    if (access_token && refresh_token) {
      await setTokens(access_token, refresh_token);
      router.replace('/(tabs)');
      return;
    }

    setFailed(true);
    setProcessing(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const runInitial = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (!mounted) {
        return;
      }
      if (initialUrl) {
        await handleCallbackUrl(initialUrl);
      }
    };

    void runInitial();

    const subscription = Linking.addEventListener('url', (event) => {
      void handleCallbackUrl(event.url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [handleCallbackUrl]);

  if (failed) {
    return (
      <View style={styles.container}>
        <XCircle size={48} color={colors.danger} />
        <Text style={styles.errorText}>{t('auth.callback_failed')}</Text>
        <Pressable
          style={styles.linkButton}
          onPress={() => router.replace('/auth/signin')}>
          <Text style={styles.linkText}>{t('auth.go_to_signin')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.statusText}>{t('auth.signing_in')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  statusText: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  linkButton: {
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.accent,
  },
});
