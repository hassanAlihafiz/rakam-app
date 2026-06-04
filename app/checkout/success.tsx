import { router } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useTranslation } from '@/src/lib/i18n';

export default function CheckoutSuccessScreen() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduced
            ? { type: 'timing', duration: 0 }
            : { type: 'spring', damping: 14 }
        }>
        <CheckCircle size={72} color={colors.success} />
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: reduced ? 0 : 400,
          delay: reduced ? 0 : 300,
        }}
        style={styles.textBlock}>
        <Text style={styles.title}>{t('checkout.success_title')}</Text>
        <Text style={styles.desc}>{t('checkout.success_desc')}</Text>
      </MotiView>
      <Pressable
        style={styles.button}
        onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonText}>{t('checkout.go_home')}</Text>
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
  textBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  desc: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
});
