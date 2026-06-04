import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { Copy, Share2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, gradients, radius, spacing, typography } from '@/src/constants/theme';
import { PhoneNumber } from '@/src/lib/apiClient';
import { isRTL, useTranslation } from '@/src/lib/i18n';

type NumberCardProps = {
  number: PhoneNumber;
  index?: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

function formatPhoneInternational(phone: string | undefined): string {
  if (!phone) {
    return '';
  }
  const parsed = parsePhoneNumberFromString(phone);
  if (parsed) {
    return parsed.formatInternational();
  }
  return phone;
}

export function NumberCard({
  number,
  index = 0,
  onPress,
  onLongPress,
}: NumberCardProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const isUK = number.country === PhoneNumber.country.UK;
  const gradient = isUK ? gradients.ukCard : gradients.usCard;
  const countryLabel = isUK ? t('home.uk_number') : t('home.us_number');
  const flag = isUK ? '🇬🇧' : '🇺🇸';
  const isActive = number.status === PhoneNumber.status.ACTIVE;

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!number.phone_number) {
      return;
    }
    await Clipboard.setStringAsync(number.phone_number);
    setCopied(true);
  };

  const handleShare = async () => {
    if (!number.phone_number) {
      return;
    }
    await Share.share({ message: number.phone_number });
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: reduced ? 0 : 350,
        delay: reduced ? 0 : index * 80,
      }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}>
        <LinearGradient
          colors={[...gradient.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.countryLabel}>
              {flag} {countryLabel}
            </Text>
            {isActive ? (
              <MotiView
                from={{ opacity: 1 }}
                animate={{ opacity: [1, 0.3] }}
                transition={{
                  type: 'timing',
                  duration: reduced ? 0 : 1500,
                  loop: !reduced,
                }}
                style={styles.statusDot}
              />
            ) : (
              <View style={[styles.statusDot, styles.statusDotInactive]} />
            )}
          </View>

          <Text style={styles.phoneNumber}>
            {formatPhoneInternational(number.phone_number)}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => void handleCopy()}>
              <Copy size={16} color={colors.textPrimary} />
              <Text style={styles.actionText}>{t('common.copy')}</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => void handleShare()}>
              <Share2 size={16} color={colors.textPrimary} />
              <Text style={styles.actionText}>{t('common.share')}</Text>
            </Pressable>
          </View>

          {copied ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.toast}>
              <Text style={styles.toastText}>{t('common.copied')}</Text>
            </MotiView>
          ) : null}
        </LinearGradient>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    borderRadius: radius.medium,
    padding: spacing.base,
    marginEnd: spacing.md,
    minHeight: 120,
  },
  topRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  countryLabel: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: isRTL ? 'right' : 'left',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  statusDotInactive: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  phoneNumber: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: isRTL ? 'right' : 'left',
  },
  actions: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textPrimary,
  },
  toast: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
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
