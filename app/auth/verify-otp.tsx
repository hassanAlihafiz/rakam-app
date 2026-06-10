import { router, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useRef, useState } from 'react';
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

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { ApiError, AuthService } from '@/src/lib/apiClient';
import { useTranslation } from '@/src/lib/i18n';
import { PENDING_OTP_KEY } from '@/app/auth/signup';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 30;

function normalizeParam(v: string | string[] | undefined): string {
  if (typeof v === 'string') return decodeURIComponent(v);
  if (Array.isArray(v) && v[0]) return decodeURIComponent(v[0]);
  return '';
}

export default function VerifyOtpScreen() {
  const { t } = useTranslation();
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const email = normalizeParam(emailParam);

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [expirySeconds, setExpirySeconds] = useState(OTP_EXPIRY_SECONDS);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start resend cooldown timer on mount
  useEffect(() => {
    resendIntervalRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(resendIntervalRef.current!);
          resendIntervalRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    expiryIntervalRef.current = setInterval(() => {
      setExpirySeconds((s) => {
        if (s <= 1) {
          clearInterval(expiryIntervalRef.current!);
          expiryIntervalRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
      if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
    };
  }, []);

  const formatExpiry = () => {
    const m = Math.floor(expirySeconds / 60);
    const s = expirySeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleChangeText = useCallback((text: string, index: number) => {
    setError(null);

    // Handle paste: if more than 1 character is entered at once
    if (text.length > 1) {
      const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const next = Array(OTP_LENGTH).fill('');
      cleaned.split('').forEach((ch, i) => { next[i] = ch; });
      setDigits(next);
      const lastFilled = Math.min(cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[lastFilled]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  }, [digits]);

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!isComplete || submitting) return;
    Keyboard.dismiss();
    setSubmitting(true);
    setError(null);
    try {
      await AuthService.postApiAuthVerifyOtp({ email, otp });
      await SecureStore.deleteItemAsync(PENDING_OTP_KEY);
      router.replace('/auth/signin');
    } catch (err) {
      if (err instanceof ApiError) {
        const body = err.body as { error?: string } | undefined;
        setError(body?.error ?? 'Incorrect code. Please try again.');
      } else {
        setError('Network error. Please try again.');
      }
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await AuthService.postApiAuthResendOtp({ email });
      setDigits(Array(OTP_LENGTH).fill(''));
      setExpirySeconds(OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      resendIntervalRef.current = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) { clearInterval(resendIntervalRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
      expiryIntervalRef.current = setInterval(() => {
        setExpirySeconds((s) => {
          if (s <= 1) { clearInterval(expiryIntervalRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Could not resend code. Please try again.');
    } finally {
      setResending(false);
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
            <Text style={styles.brandTitle}>Rakam رقم</Text>
            <Text style={styles.heading}>Verify your email</Text>
            <Text style={styles.subtext}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            {/* OTP boxes */}
            <View style={styles.otpRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputRefs.current[i] = r; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={(t) => handleChangeText(t, i)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  selectTextOnFocus
                  autoFocus={i === 0}
                  textContentType="oneTimeCode"
                  caretHidden
                />
              ))}
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Text style={styles.expiryText}>
              {expirySeconds > 0
                ? `Code expires in ${formatExpiry()}`
                : 'Code expired — please resend'}
            </Text>

            {/* Verify button */}
            <Pressable
              style={[styles.primaryButton, (!isComplete || submitting) && styles.disabled]}
              onPress={handleVerify}
              disabled={!isComplete || submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Verify</Text>
              )}
            </Pressable>

            {/* Resend */}
            <Pressable
              style={styles.resendButton}
              onPress={handleResend}
              disabled={resendCooldown > 0 || resending}>
              {resending ? (
                <ActivityIndicator size="small" color={colors.textMuted} />
              ) : (
                <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend code'}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.backLink}
              onPress={async () => {
                await SecureStore.deleteItemAsync(PENDING_OTP_KEY);
                router.back();
              }}>
              <Text style={styles.backLinkText}>← Back to sign up</Text>
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
    alignItems: 'center',
    gap: spacing.md,
  },
  brandTitle: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  otpBox: {
    width: 44,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.small,
    backgroundColor: colors.background,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
  },
  otpBoxError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: typography.caption.size,
    color: colors.danger,
    textAlign: 'center',
  },
  expiryText: {
    fontSize: typography.caption.size,
    color: colors.textMuted,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.small,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
  disabled: {
    opacity: 0.5,
  },
  resendButton: {
    paddingVertical: spacing.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  resendText: {
    fontSize: typography.body.size,
    color: colors.accent,
    textAlign: 'center',
  },
  resendDisabled: {
    color: colors.textMuted,
  },
  backLink: {
    paddingVertical: spacing.xs,
  },
  backLinkText: {
    fontSize: typography.caption.size,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
