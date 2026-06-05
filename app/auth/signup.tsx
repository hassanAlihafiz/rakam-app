import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { setTokens } from '@/src/lib/auth';
import { isRTL, useTranslation } from '@/src/lib/i18n';

type SignupForm = {
  name: string;
  email: string;
  password: string;
};

function parseApiErrorMessage(error: ApiError): string | undefined {
  const body = error.body as { message?: string; error?: string } | undefined;
  return body?.message ?? body?.error;
}

export default function SignupScreen() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email(t('auth.email_invalid')),
        password: z.string().min(8, t('auth.password_min')),
      }),
    [t],
  );

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupForm) => {
    setSubmitting(true);
    try {
      const result = await AuthService.postApiAuthSignup({
        email: data.email,
        password: data.password,
      });

      if (result.needsEmailConfirmation) {
        router.push(
          `/auth/check-email?email=${encodeURIComponent(data.email)}`,
        );
        return;
      }

      const accessToken = result.session?.access_token;
      const refreshToken = result.session?.refresh_token;
      if (!accessToken || !refreshToken) {
        setError('email', { message: t('common.error_network') });
        return;
      }

      await setTokens(accessToken, refreshToken);
      router.replace('/(tabs)');
    } catch (error) {
      if (error instanceof ApiError) {
        const message =
          parseApiErrorMessage(error) ?? t('common.error_network');
        setError('email', { message });
      } else {
        setError('email', { message: t('common.error_network') });
      }
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

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        styles.input,
                        errors.name && styles.inputError,
                      ]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoComplete="name"
                      textContentType="name"
                      placeholder="Enter your name"
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                ) : null}
              </View>

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
                      placeholder="Enter your email"
                      placeholderTextColor={colors.textMuted}
                    />
                  )}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email.message}</Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('auth.password')}</Text>
                <View style={styles.passwordRow}>
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[
                          styles.input,
                          styles.passwordInput,
                          errors.password && styles.inputError,
                        ]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password-new"
                        textContentType="newPassword"
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textMuted}
                      />
                    )}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((v) => !v)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? t('auth.hide_password')
                        : t('auth.show_password')
                    }>
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textSecondary} />
                    ) : (
                      <Eye size={20} color={colors.textSecondary} />
                    )}
                  </Pressable>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
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
                    {t('auth.create_account')}
                  </Text>
                )}
              </Pressable>

              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/magic-link')}
                disabled={submitting}>
                <Text style={styles.secondaryButtonText}>
                  {t('auth.or_magic_link')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('auth.already_have_account')}{' '}
              </Text>
              <Pressable onPress={() => router.push('/auth/signin')}>
                <Text style={styles.footerLink}>{t('auth.sign_in')}</Text>
              </Pressable>
            </View>
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
    marginBottom: spacing['2xl'],
    writingDirection: isRTL ? 'rtl' : 'ltr',
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
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingEnd: spacing['3xl'],
  },
  eyeButton: {
    position: 'absolute',
    ...(isRTL ? { left: spacing.md } : { right: spacing.md }),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
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
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.accent,
  },
  footer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.accent,
  },
});
