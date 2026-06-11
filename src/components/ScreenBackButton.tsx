import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, spacing } from '@/src/constants/theme';
import { useTranslation } from '@/src/lib/i18n';

export function ScreenBackButton() {
  const { isRTL } = useTranslation();

  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      {isRTL ? (
        <ArrowRight size={24} color={colors.textPrimary} />
      ) : (
        <ArrowLeft size={24} color={colors.textPrimary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.xs,
  },
});
