import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { ArrowLeft, ArrowRight, Copy, MoreHorizontal, Share2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MessageCard } from '@/src/components/MessageCard';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { runAuthQuery } from '@/src/lib/authQuery';
import {
  MessagesService,
  NumbersService,
  PhoneNumber,
  type Message,
} from '@/src/lib/apiClient';
import { isRTL, useTranslation } from '@/src/lib/i18n';
import { promptReleaseMenu } from '@/src/lib/releaseNumber';

function formatPhoneInternational(phone: string | undefined): string {
  if (!phone) {
    return '';
  }
  const parsed = parsePhoneNumberFromString(phone);
  if (parsed) {
    return parsed.formatInternational();
  }
  return phone;
}

export default function NumberDetailScreen() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const numberId = typeof id === 'string' ? id : id?.[0];
  const [copied, setCopied] = useState(false);

  const numbersQuery = useQuery({
    queryKey: ['numbers'],
    queryFn: () => runAuthQuery(() => NumbersService.getApiNumbers()),
    select: (data) => data.numbers ?? [],
  });

  const number = useMemo(
    () => numbersQuery.data?.find((n) => n.id === numberId),
    [numbersQuery.data, numberId],
  );

  const messagesQuery = useQuery({
    queryKey: ['messages', numberId],
    queryFn: () =>
      runAuthQuery(() =>
        MessagesService.getApiMessages(numberId, 100),
      ),
    enabled: !!numberId,
    select: (data) => data.messages ?? [],
  });

  const isUK = number?.country === PhoneNumber.country.UK;
  const countryLabel = isUK ? t('number.uk_number') : t('number.us_number');
  const flag = isUK ? '🇬🇧' : '🇺🇸';

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!number?.phone_number) {
      return;
    }
    await Clipboard.setStringAsync(number.phone_number);
    setCopied(true);
  };

  const handleShare = async () => {
    if (!number?.phone_number) {
      return;
    }
    await Share.share({ message: number.phone_number });
  };

  const handleMenu = () => {
    if (!numberId) {
      return;
    }
    promptReleaseMenu({
      numberId,
      t,
      queryClient,
      onSuccess: () => router.back(),
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageCard message={item} />
  );

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          {isRTL ? (
            <ArrowRight size={24} color={colors.textPrimary} />
          ) : (
            <ArrowLeft size={24} color={colors.textPrimary} />
          )}
        </Pressable>
        <Pressable onPress={handleMenu} style={styles.iconButton}>
          <MoreHorizontal size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Text style={styles.countryLabel}>
        {flag} {countryLabel}
      </Text>
      <Text style={styles.phoneNumber}>
        {formatPhoneInternational(number?.phone_number)}
      </Text>

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={() => void handleCopy()}>
          <Copy size={18} color={colors.textPrimary} />
          <Text style={styles.actionText}>{t('common.copy')}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => void handleShare()}>
          <Share2 size={18} color={colors.textPrimary} />
          <Text style={styles.actionText}>{t('common.share')}</Text>
        </Pressable>
      </View>

      {copied ? (
        <Text style={styles.copiedToast}>{t('common.copied')}</Text>
      ) : null}

      <View style={styles.divider} />
      <Text style={styles.sectionHeading}>{t('number.inbox')}</Text>
    </View>
  );

  const listEmpty = () => {
    if (messagesQuery.isLoading) {
      return (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((key) => (
            <MotiView
              key={key}
              from={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 0.8] }}
              transition={{ type: 'timing', duration: 800, loop: true }}
              style={styles.skeletonRow}
            />
          ))}
        </View>
      );
    }
    if (messagesQuery.isError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t('common.error_network')}</Text>
          <Pressable onPress={() => void messagesQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.try_again')}</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <Text style={styles.emptyText}>{t('number.no_messages')}</Text>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={messagesQuery.isSuccess ? (messagesQuery.data ?? []) : []}
      keyExtractor={(item, index) =>
        item.id ?? `${item.received_at ?? 'msg'}-${index}`
      }
      renderItem={renderMessage}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  headerBlock: {
    marginBottom: spacing.md,
  },
  topBar: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconButton: {
    padding: spacing.xs,
  },
  countryLabel: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: isRTL ? 'right' : 'left',
  },
  phoneNumber: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: isRTL ? 'right' : 'left',
  },
  actions: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.body.size,
    fontWeight: typography.caption.weight,
    color: colors.textPrimary,
  },
  copiedToast: {
    fontSize: typography.caption.size,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionHeading: {
    fontSize: typography.h2.size,
    fontWeight: typography.h2.weight,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: isRTL ? 'right' : 'left',
  },
  skeletonList: {
    gap: spacing.md,
  },
  skeletonRow: {
    height: 88,
    borderRadius: radius.medium,
    backgroundColor: colors.border,
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  stateText: {
    fontSize: typography.body.size,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryText: {
    fontSize: typography.body.size,
    fontWeight: typography.h2.weight,
    color: colors.accent,
  },
  emptyText: {
    fontSize: typography.body.size,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
