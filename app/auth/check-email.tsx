import { CheckCircle } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { AuthService } from '@/src/lib/apiClient';
import { useTranslation } from '@/src/lib/i18n';

const MAGIC_LINK_REDIRECT = 'rakam://auth/callback';
const RESEND_COOLDOWN_SECONDS = 30;

function normalizeEmailParam(
  email: string | string[] | undefined,
): string {
  if (typeof email === 'string') {
    return decodeURIComponent(email);
  }
  if (Array.isArray(email) && email[0]) {
    return decodeURIComponent(email[0]);
  }
  return '';
}

export default function CheckEmailScreen() {
  const { t } = useTranslation();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = normalizeEmailParam(emailParam);

  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearCountdownInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdownInterval();
    setCountdown(RESEND_COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdownInterval();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearCountdownInterval]);

  useEffect(() => {
    return clearCountdownInterval;
  }, [clearCountdownInterval]);

  const handleResend = async () => {
    if (!email || countdown > 0 || resending) {
      return;
    }
    setResending(true);
    try {
      await AuthService.postApiAuthMagicLink({
        email,
        redirect_to: MAGIC_LINK_REDIRECT,
      });
      startCountdown();
    } finally {
      setResending(false);
    }
  };

  const resendDisabled = countdown > 0 || resending || !email;
  const resendLabel =
    countdown > 0
      ? t('auth.resend_in', { seconds: countdown })
      : t('auth.resend');

  return (
    <View style={styles.container}>
      <CheckCircle size={64} color={colors.success} />
      <Text style={styles.heading}>{t('auth.check_email')}</Text>
      <Text style={styles.subtext}>
        {t('auth.check_email_desc', { email: email || '—' })}
      </Text>

      <Pressable
        style={styles.primaryButton}
        onPress={() => void Linking.openURL('mailto:')}>
        <Text style={styles.primaryButtonText}>{t('auth.open_mail')}</Text>
      </Pressable>

      <Pressable
        style={styles.resendButton}
        onPress={() => void handleResend()}
        disabled={resendDisabled}>
        {resending ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Text
            style={[
              styles.resendText,
              resendDisabled && styles.resendTextDisabled,
            ]}>
            {resendLabel}
          </Text>
        )}
      </Pressable>
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
  heading: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.md,
    width: '100%',
    maxWidth: 320,
  },
  primaryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  resendButton: {
    paddingVertical: spacing.sm,
    minHeight: 32,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textMuted,
  },
  resendTextDisabled: {
    opacity: 0.6,
  },
});
