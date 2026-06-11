import { router } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { isRTL, useTranslation } from '@/src/lib/i18n';

type TrialExpiredModalProps = {
  visible: boolean;
};

export function TrialExpiredModal({ visible }: TrialExpiredModalProps) {
  const { t } = useTranslation();

  const handleBuyPlan = () => {
    router.push('/pricing');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Clock size={40} color={colors.warning} />
          </View>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'center' }]}>
            {t('trial.expired_title')}
          </Text>
          <Text style={[styles.message, { textAlign: isRTL ? 'right' : 'center' }]}>
            {t('trial.expired_message')}
          </Text>
          <Pressable style={styles.button} onPress={handleBuyPlan}>
            <Text style={styles.buttonText}>{t('trial.buy_plan')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
  },
  message: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
});
