import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBackButton } from '@/src/components/ScreenBackButton';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { AuthService, OpenAPI, type MeResponse } from '@/src/lib/apiClient';
import { runAuthQuery } from '@/src/lib/authQuery';
import { clearTokens } from '@/src/lib/auth';
import { useColorScheme } from '@/components/useColorScheme';
import { currentLocale, isRTL, useTranslation } from '@/src/lib/i18n';

// Country code → full name with emoji
const COUNTRY_NAMES: Record<string, string> = {
  SA: '🇸🇦 Saudi Arabia',
  AE: '🇦🇪 United Arab Emirates',
  PK: '🇵🇰 Pakistan',
  EG: '🇪🇬 Egypt',
  IQ: '🇮🇶 Iraq',
  JO: '🇯🇴 Jordan',
  KW: '🇰🇼 Kuwait',
  QA: '🇶🇦 Qatar',
  BH: '🇧🇭 Bahrain',
  OM: '🇴🇲 Oman',
  US: '🇺🇸 United States',
  GB: '🇬🇧 United Kingdom',
  TR: '🇹🇷 Turkey',
  MA: '🇲🇦 Morocco',
  TN: '🇹🇳 Tunisia',
  LB: '🇱🇧 Lebanon',
};

function getCountryLabel(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRY_NAMES[code.toUpperCase()] ?? `🌍 ${code}`;
}

function ProfileSkeleton() {
  return (
    <View style={styles.skeletonBlock}>
      {[0, 1, 2, 3].map((key) => (
        <MotiView
          key={key}
          from={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8] }}
          transition={{ type: 'timing', duration: 800, loop: true }}
          style={styles.skeletonRow}
        />
      ))}
    </View>
  );
}

function formatRenewalDate(iso: string | undefined): string {
  if (!iso) {
    return '';
  }
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function getUserInitial(meData: MeResponse | undefined): string {
  const source =
    meData?.profile?.display_name?.trim() ||
    meData?.user?.email ||
    '?';
  return source[0].toUpperCase();
}

function getDisplayName(meData: MeResponse | undefined): string {
  const name = meData?.profile?.display_name?.trim();
  if (name) return name;
  const email = meData?.user?.email ?? meData?.profile?.email;
  if (email) return email.split('@')[0];
  return '—';
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const themeLabel = colorScheme === 'dark' ? 'Dark' : 'Light';

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () =>
      runAuthQuery(() => AuthService.getApiAuthMe()) as Promise<MeResponse>,
  });

  const meData = meQuery.data;
  const email = meData?.user?.email ?? meData?.profile?.email ?? '—';
  const displayName = getDisplayName(meData);
  const avatarInitial = getUserInitial(meData);
  const countryLabel = getCountryLabel(meData?.profile?.country_code);
  const subscription = meData?.subscription;

  const localeLabel = currentLocale === 'ar' ? 'العربية' : 'English';

  const handleManageSubscription = () => {
    if (meData?.subscription?.management_url) {
      void Linking.openURL(meData.subscription.management_url);
    } else {
      router.push('/pricing');
    }
  };

  const handleSignOut = () => {
    Alert.alert(t('auth.sign_out'), t('auth.sign_out_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.sign_out'),
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          OpenAPI.TOKEN = undefined;
          router.replace('/auth/signin');
        },
      },
    ]);
  };

  if (meQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <ScreenBackButton />
        </View>
        <ProfileSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <ScreenBackButton />
      </View>

      <View style={styles.userSection}>
        <View style={styles.avatar} accessibilityLabel={displayName}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
        {countryLabel ? (
          <Text style={styles.country}>{countryLabel} (auto-detected)</Text>
        ) : null}
      </View>

      <Text style={styles.sectionLabel}>{t('profile.subscription')}</Text>
      <View style={styles.card}>
        {subscription?.plan_name ? (
          <>
            <Text style={styles.planName}>{subscription.plan_name}</Text>
            {subscription.is_trial ? (
              <Text style={styles.trialBadge}>{t('trial.active_badge')}</Text>
            ) : null}
            {subscription.renewal_date ? (
              <Text style={styles.planMeta}>
                {subscription.is_trial
                  ? t('trial.days_left', {
                      count: Math.max(
                        0,
                        Math.ceil(
                          (new Date(subscription.renewal_date).getTime() - Date.now()) /
                            (1000 * 60 * 60 * 24),
                        ),
                      ),
                    })
                  : t('profile.renewal', {
                      date: formatRenewalDate(subscription.renewal_date),
                    })}
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.planMeta}>{t('profile.no_plan')}</Text>
        )}
        <Pressable onPress={handleManageSubscription}>
          <Text style={styles.linkPrimary}>
            {t('profile.manage_subscription')}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>{t('profile.preferences')}</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profile.notifications')}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.textPrimary}
          />
        </View>
        <Pressable
          style={styles.row}
          onPress={() => router.push('/settings/language')}>
          <Text style={styles.rowLabel}>{t('profile.language')}</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowValue}>{localeLabel}</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </View>
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('profile.theme')}</Text>
          <Text style={styles.rowValue}>{themeLabel}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{t('profile.support')}</Text>
      <View style={styles.card}>
        <Pressable
          style={styles.row}
          onPress={() => void Linking.openURL('mailto:support@rakam.app')}>
          <Text style={styles.linkPrimary}>{t('profile.email_us')}</Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={() => void Linking.openURL('https://rakam.app/legal')}>
          <Text style={styles.linkPrimary}>{t('profile.terms_privacy')}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>{t('auth.sign_out')}</Text>
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  headerRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  userSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
    marginTop: spacing.lg,
    paddingTop: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.background,
  },
  displayName: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  email: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  country: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    gap: spacing.md,
  },
  planName: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  trialBadge: {
    alignSelf: 'flex-start',
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.warning,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  planMeta: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  linkPrimary: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.primary,
  },
  row: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowLabel: {
    fontSize: typography.body.size,
    color: colors.textPrimary,
    textAlign: isRTL ? 'right' : 'left',
  },
  rowRight: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  rowValueMuted: {
    fontSize: typography.body.size,
    color: colors.textMuted,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing['3xl'],
  },
  signOutText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.danger,
  },
  skeletonBlock: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  skeletonRow: {
    height: 56,
    borderRadius: radius.medium,
    backgroundColor: colors.border,
  },
});
