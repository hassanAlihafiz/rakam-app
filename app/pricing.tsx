import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import theme, { colors, radius, spacing, typography } from '@/src/constants/theme';
import { runAuthQuery } from '@/src/lib/authQuery';
import { createCheckout, type BillingCycle } from '@/src/lib/checkout';
import { isRTL, useTranslation } from '@/src/lib/i18n';

type PlanGradient = (typeof theme.gradients)[keyof typeof theme.gradients];

type PlanDefinition = {
  id: string;
  flag: string;
  nameKey: 'pricing.plan.us_basic' | 'pricing.plan.uk_basic' | 'pricing.plan.global_pro';
  monthlyPrice: number;
  annualPrice: number;
  featureKeys: readonly (
    | 'pricing.feature.us_number'
    | 'pricing.feature.uk_number'
    | 'pricing.feature.us_uk_numbers'
    | 'pricing.feature.unlimited_sms'
    | 'pricing.feature.priority_support'
  )[];
  gradient: PlanGradient;
  popular: boolean;
};

const PLANS: PlanDefinition[] = [
  {
    id: 'us_basic',
    flag: '🇺🇸',
    nameKey: 'pricing.plan.us_basic',
    monthlyPrice: 3.99,
    annualPrice: 3.31,
    featureKeys: ['pricing.feature.us_number', 'pricing.feature.unlimited_sms'],
    gradient: theme.gradients.usCard,
    popular: false,
  },
  {
    id: 'uk_basic',
    flag: '🇬🇧',
    nameKey: 'pricing.plan.uk_basic',
    monthlyPrice: 4.99,
    annualPrice: 4.14,
    featureKeys: ['pricing.feature.uk_number', 'pricing.feature.unlimited_sms'],
    gradient: theme.gradients.ukCard,
    popular: false,
  },
  {
    id: 'global_pro',
    flag: '🌍',
    nameKey: 'pricing.plan.global_pro',
    monthlyPrice: 9.99,
    annualPrice: 8.29,
    featureKeys: [
      'pricing.feature.us_uk_numbers',
      'pricing.feature.unlimited_sms',
      'pricing.feature.priority_support',
    ],
    gradient: theme.gradients.brand,
    popular: true,
  },
];

export default function PricingScreen() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSelect = async (plan: PlanDefinition) => {
    setLoadingPlanId(plan.id);
    try {
      const { checkout_url } = await runAuthQuery(() =>
        createCheckout(plan.id, billingCycle),
      );
      await Linking.openURL(checkout_url);
      router.push(`/checkout/processing?plan=${plan.id}`);
    } catch {
      Alert.alert(t('common.error_network'));
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('pricing.title')}</Text>

      <View style={styles.toggle}>
        <Pressable
          style={[
            styles.toggleSegment,
            billingCycle === 'monthly' && styles.toggleSegmentActive,
          ]}
          onPress={() => setBillingCycle('monthly')}>
          <Text
            style={[
              styles.toggleText,
              billingCycle === 'monthly' && styles.toggleTextActive,
            ]}>
            {t('pricing.monthly')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleSegment,
            billingCycle === 'annual' && styles.toggleSegmentActive,
          ]}
          onPress={() => setBillingCycle('annual')}>
          <Text
            style={[
              styles.toggleText,
              billingCycle === 'annual' && styles.toggleTextActive,
            ]}>
            {t('pricing.annual')}
          </Text>
        </Pressable>
      </View>

      {PLANS.map((plan) => {
        const price =
          billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
        const isLoading = loadingPlanId === plan.id;

        return (
          <LinearGradient
            key={plan.id}
            colors={[...plan.gradient.colors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCard}>
            <View style={styles.planTopRow}>
              <Text style={styles.planName}>
                {plan.flag} {t(plan.nameKey)}
              </Text>
              {plan.popular ? (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>
                    {t('pricing.popular')}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>${price.toFixed(2)}</Text>
              <Text style={styles.perMonth}>{t('pricing.per_month')}</Text>
            </View>

            <View style={styles.features}>
              {plan.featureKeys.map((featureKey) => (
                <View key={featureKey} style={styles.featureRow}>
                  <Check size={14} color={colors.success} />
                  <Text style={styles.featureText}>{t(featureKey)}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.selectButton, isLoading && styles.selectDisabled]}
              onPress={() => void handleSelect(plan)}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.selectButtonText}>
                  {t('pricing.select')}
                </Text>
              )}
            </Pressable>
          </LinearGradient>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  toggle: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  toggleSegment: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  toggleSegmentActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.h2.weight,
  },
  planCard: {
    borderRadius: radius.medium,
    padding: spacing.base,
    gap: spacing.md,
  },
  planTopRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  popularBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  popularBadgeText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.background,
  },
  priceRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  price: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
  },
  perMonth: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  features: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: typography.body.size,
    color: colors.textPrimary,
  },
  selectButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.small,
    paddingVertical: spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectDisabled: {
    opacity: 0.8,
  },
  selectButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.primary,
  },
});
