import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { z } from 'zod';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { ApiError, AuthService } from '@/src/lib/apiClient';
import { isRTL, useTranslation } from '@/src/lib/i18n';

const MAGIC_LINK_REDIRECT = 'rakam://auth/callback';

type MagicLinkForm = {
  email: string;
};

function parseApiErrorMessage(error: ApiError): string | undefined {
  const body = error.body as { message?: string; error?: string } | undefined;
  return body?.message ?? body?.error;
}

function normalizeEmailParam(
  email: string | string[] | undefined,
): string {
  if (typeof email === 'string') {
    return decodeURIComponent(email);
  }
  if (Array.isArray(email) && email[0]) {
    return decodeURIComponent(email[0]);
  }
  return '';
}

export default function MagicLinkScreen() {
  const { t } = useTranslation();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('auth.email_invalid')),
      }),
    [t],
  );

  const prefilledEmail = normalizeEmailParam(emailParam);

  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<MagicLinkForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: prefilledEmail },
  });

  useEffect(() => {
    if (prefilledEmail) {
      reset({ email: prefilledEmail });
    }
  }, [prefilledEmail, reset]);

  const onSubmit = async (data: MagicLinkForm) => {
    setSubmitting(true);
    try {
      await AuthService.postApiAuthMagicLink({
        email: data.email,
        redirect_to: MAGIC_LINK_REDIRECT,
      });
      router.push(
        `/auth/check-email?email=${encodeURIComponent(data.email)}`,
      );
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (parseApiErrorMessage(error) ?? t('common.error_network'))
          : t('common.error_network');
      setError('email', { message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Pressable style={styles.pressable} onPress={Keyboard.dismiss}>
          <View style={styles.card}>
            <Text style={styles.brandTitle}>{t('auth.brand_title')}</Text>
            <Text style={styles.heading}>{t('auth.magic_link_heading')}</Text>
            <Text style={styles.subtitle}>{t('auth.magic_link_subtitle')}</Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.email && styles.inputError,
                      ]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      textContentType="emailAddress"
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                ) : null}
              </View>

              <Pressable
                style={[styles.primaryButton, submitting && styles.disabled]}
                onPress={handleSubmit(onSubmit)}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color={colors.textPrimary} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {t('auth.send_magic_link')}
                  </Text>
                )}
              </Pressable>
            </View>

            <Pressable style={styles.footerLink} onPress={() => router.back()}>
              <Text style={styles.footerLinkText}>{t('auth.back_to_signin')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  pressable: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.medium,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brandTitle: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.size,
    fontWeight: typography.body.weight,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    textAlign: isRTL ? 'right' : 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.small,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.body.size,
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: colors.danger,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.7,
  },
  footerLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerLinkText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.accent,
  },
});
