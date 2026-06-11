import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useTranslation } from '@/src/lib/i18n';

type ConfirmModalProps = {
  visible: boolean;
  title?: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmTone?: 'primary' | 'danger';
};

export function ConfirmModal({
  visible,
  title,
  message,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmTone = 'primary',
}: ConfirmModalProps) {
  const { isRTL } = useTranslation();
  const confirmIsDanger = confirmTone === 'danger';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}>
          {title ? (
            <Text
              style={[
                styles.title,
                { textAlign: isRTL ? 'right' : 'left' },
              ]}>
              {title}
            </Text>
          ) : null}
          <Text
            style={[
              styles.message,
              { textAlign: isRTL ? 'right' : 'left' },
            ]}>
            {message}
          </Text>
          <View
            style={[
              styles.actions,
              { flexDirection: isRTL ? 'row-reverse' : 'row' },
            ]}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmButton,
                confirmIsDanger && styles.confirmButtonDanger,
              ]}
              onPress={onConfirm}>
              <Text
                style={[
                  styles.confirmText,
                  confirmIsDanger && styles.confirmTextDanger,
                ]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 15, 0.85)',
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
    gap: spacing.md,
  },
  title: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  message: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.small,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  confirmButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  confirmText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  confirmTextDanger: {
    color: colors.danger,
  },
});
