import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { isRTL, useTranslation, type TranslationKey } from '@/src/lib/i18n';

const ONBOARDING_KEY = 'onboarding_completed';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// SMS Notifications for phone mockup animation
const NOTIFICATIONS = [
  { id: '1', app: 'WhatsApp', message: 'Your code is 847-291', color: '#25D366', delay: 0 },
  { id: '2', app: 'Google',    message: 'G-123456 is your code', color: '#4285F4', delay: 600 },
  { id: '3', app: 'PayPal',    message: 'Your OTP: 739-104',    color: '#0070E0', delay: 1200 },
  { id: '4', app: 'Instagram', message: 'Your code: 582-947',   color: '#E1306C', delay: 1800 },
];

function PhoneMockup({ reduced }: { reduced: boolean }) {
  return (
    <View style={styles.phoneMockup}>
      {/* Phone frame */}
      <View style={styles.phoneFrame}>
        {/* Status bar */}
        <View style={styles.phoneStatusBar}>
          <Text style={styles.phoneTime}>9:41</Text>
          <View style={styles.phoneStatusIcons}>
            <View style={styles.statusDot} />
            <View style={styles.statusDot} />
            <View style={styles.statusDot} />
          </View>
        </View>

        {/* Notification cards dropping in */}
        <View style={styles.notificationsContainer}>
          {NOTIFICATIONS.map((notif) => (
            <MotiView
              key={notif.id}
              from={{ opacity: 0, translateY: -60, scale: 0.9 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{
                type: 'spring',
                delay: reduced ? 0 : notif.delay,
                damping: 15,
                stiffness: 120,
              }}
              style={styles.notificationCard}>
              {/* App color dot */}
              <View style={[styles.appDot, { backgroundColor: notif.color }]} />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationApp}>{notif.app}</Text>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
              </View>
            </MotiView>
          ))}
        </View>
      </View>

      {/* Glow effect under phone */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{
          type: 'timing',
          duration: 2000,
          loop: true,
        }}
        style={styles.phoneGlow}
      />
    </View>
  );
}

type OnboardingSlide = {
  key: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  visual: 'phone' | 'apps' | 'mena';
};

const SLIDES: OnboardingSlide[] = [
  {
    key: 'get_number',
    titleKey: 'onboarding.slide1_title',
    descKey: 'onboarding.slide1_desc',
    visual: 'phone',
  },
  {
    key: 'apps',
    titleKey: 'onboarding.slide2_title',
    descKey: 'onboarding.slide2_desc',
    visual: 'apps',
  },
  {
    key: 'mena',
    titleKey: 'onboarding.slide3_title',
    descKey: 'onboarding.slide3_desc',
    visual: 'mena',
  },
];

// App logos for slide 2
const APP_LOGOS = [
  { name: 'WA',  color: '#25D366' },
  { name: 'G',   color: '#4285F4' },
  { name: 'PP',  color: '#0070E0' },
  { name: 'IG',  color: '#E1306C' },
  { name: 'TW',  color: '#1DA1F2' },
  { name: 'BN',  color: '#F0B90B' },
];

// Country flags for slide 3
const COUNTRIES = ['🇸🇦', '🇦🇪', '🇵🇰', '🇪🇬', '🇮🇶', '🇯🇴'];

function SlideVisual({ type, reduced }: { type: 'phone' | 'apps' | 'mena'; reduced: boolean }) {
  if (type === 'phone') {
    return <PhoneMockup reduced={reduced} />;
  }

  if (type === 'apps') {
    return (
      <View style={styles.appsGrid}>
        {APP_LOGOS.map((app, i) => (
          <MotiView
            key={app.name}
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              delay: reduced ? 0 : i * 120,
              damping: 12,
            }}
            style={[styles.appIcon, { backgroundColor: app.color }]}>
            <Text style={styles.appIconText}>{app.name}</Text>
          </MotiView>
        ))}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: reduced ? 0 : 720 }}
          style={[styles.appIcon, styles.appIconMore]}>
          <Text style={styles.appIconText}>+94</Text>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={styles.flagsWrap}>
      {COUNTRIES.map((flag, i) => (
        <MotiView
          key={flag}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'spring',
            delay: reduced ? 0 : i * 150,
          }}
          style={styles.flagBubble}>
          <Text style={styles.flagText}>{flag}</Text>
        </MotiView>
      ))}
    </View>
  );
}

async function markComplete(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<OnboardingSlide>>(null);

  const handleSkip = async () => {
    await markComplete();
    router.replace('/auth/signup');
  };

  const handleGetStarted = async () => {
    await markComplete();
    router.replace('/auth/signup');
  };

  const handleSignIn = async () => {
    await markComplete();
    router.replace('/auth/signin');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const renderSlide: ListRenderItem<OnboardingSlide> = ({ item, index }) => (
    <View style={styles.slide}>
      <SlideVisual type={item.visual} reduced={!!reduced} />
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: reduced ? 0 : 400,
          delay: reduced ? 0 : 300 + index * 100,
        }}>
        <Text style={styles.title}>{t(item.titleKey)}</Text>
        <Text style={styles.desc}>{t(item.descKey)}</Text>
      </MotiView>
    </View>
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button — always visible top-right */}
      <Pressable style={styles.skipButton} onPress={() => void handleSkip()}>
        <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        inverted={isRTL}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination dots */}
      <View style={styles.dots}>
        {SLIDES.map((slide, index) => (
          <MotiView
            key={slide.key}
            animate={{
              width: index === activeIndex ? 24 : 8,
              backgroundColor: index === activeIndex ? colors.primary : colors.border,
            }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.dot}
          />
        ))}
      </View>

      {/* CTA buttons */}
      {isLastSlide ? (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.ctaBlock}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => void handleGetStarted()}>
            <Text style={styles.primaryButtonText}>
              {t('onboarding.get_started')}
            </Text>
          </Pressable>
          <Pressable onPress={() => void handleSignIn()}>
            <Text style={styles.secondaryLink}>
              {t('onboarding.have_account')}
            </Text>
          </Pressable>
        </MotiView>
      ) : (
        <View style={styles.ctaPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: spacing['2xl'],
    end: spacing.xl,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.body.size,
    color: colors.textMuted,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
    paddingTop: spacing['3xl'],
  },

  // Phone mockup
  phoneMockup: {
    alignItems: 'center',
    position: 'relative',
  },
  phoneFrame: {
    width: 200,
    height: 340,
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  phoneTime: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    gap: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  notificationsContainer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  notificationCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: radius.small,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appDot: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationApp: {
    color: colors.textPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
  notificationMessage: {
    color: colors.textSecondary,
    fontSize: 8,
    marginTop: 2,
  },
  phoneGlow: {
    position: 'absolute',
    bottom: -20,
    width: 160,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 80,
    opacity: 0.4,
    // blur effect via shadow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  // Apps grid slide
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    maxWidth: 260,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: radius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconMore: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  appIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Flags slide
  flagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
    maxWidth: 280,
  },
  flagBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 32,
  },

  // Text
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  desc: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 300,
  },

  // Dots
  dots: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },

  // CTA
  ctaBlock: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  ctaPlaceholder: {
    height: 120,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  secondaryLink: {
    fontSize: typography.body.size,
    color: colors.accent,
    textAlign: 'center',
  },
});
