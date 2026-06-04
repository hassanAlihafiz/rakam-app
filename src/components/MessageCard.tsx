import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import type { Message } from '@/src/lib/apiClient';
import { isRTL, useTranslation, type TranslationKey } from '@/src/lib/i18n';
import { getSenderLabel } from '@/src/lib/senderIcons';

type MessageCardProps = {
  message: Message;
};

function extractOtp(body: string | undefined, otpCode: string | null | undefined): string | null {
  if (otpCode) {
    return otpCode;
  }
  if (!body) {
    return null;
  }
  const match = body.match(/\b(\d{4,8})\b/);
  return match?.[1] ?? null;
}

function relativeTime(
  iso: string | undefined,
  t: (key: TranslationKey, options?: Record<string, unknown>) => string,
): string {
  if (!iso) {
    return '';
  }
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) {
    return t('home.time_just_now');
  }
  if (diff < 3_600_000) {
    return t('home.time_min_ago', { count: Math.floor(diff / 60_000) });
  }
  if (diff < 86_400_000) {
    return t('home.time_hr_ago', { count: Math.floor(diff / 3_600_000) });
  }
  return t('home.time_yesterday');
}

export function MessageCard({ message }: MessageCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const otp = useMemo(
    () => extractOtp(message.body, message.otp_code),
    [message.body, message.otp_code],
  );

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyOtp = async () => {
    if (!otp) {
      return;
    }
    await Clipboard.setStringAsync(otp);
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    );
    setCopied(true);
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.sender} numberOfLines={1}>
          {getSenderLabel(message.from_number ?? '') || '—'}
        </Text>
        <Text style={styles.timestamp}>
          {relativeTime(message.received_at, t)}
        </Text>
      </View>

      <Text style={styles.body}>{message.body}</Text>

      {otp ? (
        <View style={styles.otpRow}>
          <Text style={styles.otpCode}>{otp}</Text>
          <Pressable onPress={() => void handleCopyOtp()}>
            <Text style={styles.copyOtpButton}>
              {t('home.copy_otp', { code: otp })}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {copied ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.toast}>
          <Text style={styles.toastText}>{t('common.copied')}</Text>
        </MotiView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.medium,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sender: {
    flex: 1,
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    textAlign: isRTL ? 'right' : 'left',
  },
  timestamp: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textMuted,
  },
  body: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: isRTL ? 'right' : 'left',
  },
  otpRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  otpCode: {
    fontFamily: 'monospace',
    fontSize: typography.body.size + 2,
    fontWeight: typography.h2.weight,
    color: colors.accent,
  },
  copyOtpButton: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.primary,
  },
  toast: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  toastText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textPrimary,
  },
});
