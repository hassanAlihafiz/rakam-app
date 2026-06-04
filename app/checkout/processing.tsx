import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Loader2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { runAuthQuery } from '@/src/lib/authQuery';
import { NumbersService, type NumbersListResponse } from '@/src/lib/apiClient';
import { useTranslation } from '@/src/lib/i18n';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;

export default function CheckoutProcessingScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [timedOut, setTimedOut] = useState(false);

  const cached = queryClient.getQueryData<NumbersListResponse>(['numbers']);
  const previousCountRef = useRef(cached?.numbers?.length ?? 0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearPoll = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    pollRef.current = setInterval(() => {
      void (async () => {
        try {
          const data = await runAuthQuery(() =>
            NumbersService.getApiNumbers(),
          );
          const count = data.numbers?.length ?? 0;
          if (count > previousCountRef.current) {
            clearPoll();
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            await queryClient.invalidateQueries({ queryKey: ['numbers'] });
            router.replace('/checkout/success');
          }
        } catch {
          // runAuthQuery handles AuthExpiredError
        }
      })();
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      clearPoll();
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);

    return () => {
      clearPoll();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [queryClient]);

  if (timedOut) {
    return (
      <View style={styles.container}>
        <Text style={styles.desc}>{t('checkout.timeout')}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>{t('checkout.go_back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MotiView
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 1000,
          loop: true,
        }}>
        <Loader2 size={48} color={colors.primary} />
      </MotiView>
      <Text style={styles.title}>{t('checkout.processing_title')}</Text>
      <Text style={styles.desc}>{t('checkout.processing_desc')}</Text>
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
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  buttonText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
  },
});
