import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Globe, LayoutGrid, Smartphone } from 'lucide-react-native';
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

type SlideIcon = 'smartphone' | 'grid' | 'globe';

type OnboardingSlide = {
  key: string;
  icon: SlideIcon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
};

const SLIDES: OnboardingSlide[] = [
  {
    key: 'get_number',
    icon: 'smartphone',
    titleKey: 'onboarding.slide1_title',
    descKey: 'onboarding.slide1_desc',
  },
  {
    key: 'apps',
    icon: 'grid',
    titleKey: 'onboarding.slide2_title',
    descKey: 'onboarding.slide2_desc',
  },
  {
    key: 'mena',
    icon: 'globe',
    titleKey: 'onboarding.slide3_title',
    descKey: 'onboarding.slide3_desc',
  },
];

async function markComplete(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
}

function SlideIconView({ name }: { name: SlideIcon }) {
  const props = { size: 80, color: colors.primary };
  switch (name) {
    case 'smartphone':
      return <Smartphone {...props} />;
    case 'grid':
      return <LayoutGrid {...props} />;
    case 'globe':
      return <Globe {...props} />;
  }
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
    const index = Math.round(
      e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    setActiveIndex(index);
  };

  const renderSlide: ListRenderItem<OnboardingSlide> = ({
    item,
    index,
  }) => (
    <View style={styles.slide}>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: reduced ? 0 : 400,
          delay: reduced ? 0 : index * 100,
        }}>
        <SlideIconView name={item.icon} />
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: reduced ? 0 : 400,
          delay: reduced ? 0 : 150 + index * 100,
        }}>
        <Text style={styles.title}>{t(item.titleKey)}</Text>
        <Text style={styles.desc}>{t(item.descKey)}</Text>
      </MotiView>
    </View>
  );

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
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

      <View style={styles.dots}>
        {SLIDES.map((slide, index) => (
          <View
            key={slide.key}
            style={[
              styles.dot,
              index === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {isLastSlide ? (
        <View style={styles.ctaBlock}>
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
        </View>
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
    textAlign: isRTL ? 'right' : 'left',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
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
    maxWidth: 320,
  },
  dots: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
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
