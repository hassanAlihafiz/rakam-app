import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import {
  currentLocale,
  isRTL,
  setLocale,
  useTranslation,
  type SupportedLocale,
} from '@/src/lib/i18n';

export default function LanguageSettingsScreen() {
  const { t } = useTranslation();

  const selectLanguage = (locale: SupportedLocale) => {
    if (locale === currentLocale) {
      router.back();
      return;
    }
    setLocale(locale);
    Alert.alert(t('settings.restart_required'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <ChevronLeft size={24} color={colors.textPrimary} />
        <Text style={styles.title}>{t('settings.language_title')}</Text>
      </Pressable>

      <View style={styles.card}>
        <Pressable
          style={[
            styles.option,
            currentLocale === 'en' && styles.optionSelected,
          ]}
          onPress={() => selectLanguage('en')}>
          <Text style={styles.optionText}>{t('settings.english')}</Text>
        </Pressable>
        <Pressable
          style={[
            styles.option,
            currentLocale === 'ar' && styles.optionSelected,
          ]}
          onPress={() => selectLanguage('ar')}>
          <Text style={styles.optionText}>{t('settings.arabic')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  backRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: colors.border,
  },
  optionText: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textPrimary,
  },
});
