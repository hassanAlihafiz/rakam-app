import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Plus, Smartphone } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageCard } from '@/src/components/MessageCard';
import { NumberCard } from '@/src/components/NumberCard';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import {
  AuthService,
  MessagesService,
  NumbersService,
  type Message,
  type MessagesListResponse,
  type MeResponse,
  type PhoneNumber,
} from '@/src/lib/apiClient';
import { runAuthQuery } from '@/src/lib/authQuery';
import { isRTL, useTranslation } from '@/src/lib/i18n';
import { checkAndRegisterPush } from '@/src/lib/notifications';
import { promptReleaseNumber } from '@/src/lib/releaseNumber';
import { supabase } from '@/src/lib/supabase';

function NumbersSkeleton() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.numbersScroll}>
      {[0, 1].map((key) => (
        <MotiView
          key={key}
          from={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.8] }}
          transition={{
            type: 'timing',
            duration: 800,
            loop: true,
          }}
          style={styles.skeletonCard}
        />
      ))}
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const queryClient = useQueryClient();

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => runAuthQuery(() => AuthService.getApiAuthMe()) as Promise<MeResponse>,
    staleTime: 5 * 60 * 1000,
  });


  const numbersQuery = useQuery({
    queryKey: ['numbers'],
    queryFn: () => runAuthQuery(() => NumbersService.getApiNumbers()),
    select: (data) => data.numbers ?? [],
  });

  const messagesQuery = useQuery({
    queryKey: ['messages'],
    queryFn: () =>
      runAuthQuery(() => MessagesService.getApiMessages(undefined, 20)),
  });

  const numbers = numbersQuery.data ?? [];
  const messages = messagesQuery.data?.messages ?? [];

  // Unique channel name per mount — prevents "cannot add callbacks after subscribe()" error
  const channelName = useRef(`messages-${Date.now()}`);

  useEffect(() => {
    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          queryClient.setQueryData(
            ['messages'],
            (old: MessagesListResponse | undefined) => ({
              ...old,
              messages: [
                payload.new as Message,
                ...(old?.messages ?? []),
              ],
            }),
          );
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        },
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [queryClient]);

  useEffect(() => {
    if (numbers.length > 0) {
      // Push registration requires a dev build (not Expo Go).
      void checkAndRegisterPush(numbers);
    }
  }, [numbers.length]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const numberId = response.notification.request.content.data?.number_id;
        if (typeof numberId === 'string') {
          router.push(`/number/${numberId}`);
        }
      },
    );
    return () => sub.remove();
  }, []);

  const onRefresh = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['numbers'] });
    void queryClient.invalidateQueries({ queryKey: ['messages'] });
  }, [queryClient]);

  const isRefreshing =
    numbersQuery.isRefetching || messagesQuery.isRefetching;

  const handleRelease = (number: PhoneNumber) => {
    if (!number.id) {
      return;
    }
    promptReleaseNumber({
      numberId: number.id,
      t,
      queryClient,
    });
  };

  const renderNumbersSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{t('home.my_numbers')}</Text>
      {numbersQuery.isLoading ? (
        <NumbersSkeleton />
      ) : numbersQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t('common.error_network')}</Text>
          <Pressable onPress={() => void numbersQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.try_again')}</Text>
          </Pressable>
        </View>
      ) : numbers.length === 0 ? (
        <View style={styles.stateBox}>
          <Smartphone size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('home.empty_title')}</Text>
          <Text style={styles.emptyDesc}>{t('home.empty_desc')}</Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push('/pricing')}>
            <Text style={styles.primaryButtonText}>{t('home.empty_cta')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.numbersScroll}>
          {numbers.map((number, index) => (
            <NumberCard
              key={number.id ?? number.phone_number}
              number={number}
              index={index}
              onPress={() => {
                if (number.id) {
                  router.push(`/number/${number.id}`);
                }
              }}
              onLongPress={() => handleRelease(number)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderMessagesSectionHeader = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>{t('home.recent_otps')}</Text>
      {messagesQuery.isLoading ? (
        <View style={styles.messagesLoading}>
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8] }}
            transition={{ type: 'timing', duration: 800, loop: true }}
            style={styles.skeletonMessage}
          />
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.8] }}
            transition={{
              type: 'timing',
              duration: 800,
              loop: true,
              delay: 200,
            }}
            style={styles.skeletonMessage}
          />
        </View>
      ) : messagesQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t('common.error_network')}</Text>
          <Pressable onPress={() => void messagesQuery.refetch()}>
            <Text style={styles.retryText}>{t('common.try_again')}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageCard message={item} />
  );

  const listHeader = (
    <>
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>{t('auth.brand_title')}</Text>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>
            {(meQuery.data?.profile?.display_name ?? meQuery.data?.user?.email ?? '?')[0].toUpperCase()}
          </Text>
        </Pressable>
      </View>
      {renderNumbersSection()}
      {renderMessagesSectionHeader()}
    </>
  );

  const listFooter = (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration: reduced ? 0 : 300,
        delay: reduced ? 0 : 500,
      }}>
      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/pricing')}>
        <Plus size={20} color={colors.textSecondary} />
        <Text style={styles.addButtonText}>{t('home.add_number')}</Text>
      </Pressable>
    </MotiView>
  );

  const showMessagesList =
    !messagesQuery.isLoading && !messagesQuery.isError;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={styles.content}
      data={showMessagesList ? messages : []}
      keyExtractor={(item, index) =>
        item.id ?? `${item.received_at ?? 'msg'}-${index}`
      }
      renderItem={renderMessageItem}
      ListHeaderComponent={listHeader}
      ListFooterComponent={listFooter}
      ListEmptyComponent={
        showMessagesList ? (
          <Text style={styles.emptyMessages}>{t('home.no_messages')}</Text>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    />
    </SafeAreaView>
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
    topBar: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing['2xl'],
    },
    brandTitle: {
      fontSize: typography.h1.size,
      fontWeight: typography.h1.weight,
      color: colors.textPrimary,
      textAlign: isRTL ? 'right' : 'left',
    },
    avatarSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarSmallText: {
      fontSize: typography.body.size,
      fontWeight: typography.h1.weight,
      color: colors.background,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeading: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      textAlign: isRTL ? 'right' : 'left',
    },
    numbersScroll: {
      paddingEnd: spacing.md,
    },
    skeletonCard: {
      width: 280,
      height: 120,
      borderRadius: radius.medium,
      backgroundColor: colors.border,
      marginEnd: spacing.md,
    },
    skeletonMessage: {
      height: 88,
      borderRadius: radius.medium,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    messagesLoading: {
      gap: spacing.md,
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
    emptyTitle: {
      fontSize: typography.h1.size,
      fontWeight: typography.h1.weight,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: typography.body.size,
      fontWeight: typography.body.weight,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.small,
      paddingVertical: spacing.base,
      paddingHorizontal: spacing.xl,
      marginTop: spacing.sm,
    },
    primaryButtonText: {
      fontSize: typography.body.size,
      fontWeight: typography.h2.weight,
      color: colors.textPrimary,
    },
    emptyMessages: {
      fontSize: typography.body.size,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    addButton: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: radius.medium,
      paddingVertical: spacing.base,
      marginTop: spacing.md,
    },
    addButtonText: {
      fontSize: typography.body.size,
      fontWeight: typography.caption.weight,
      color: colors.textSecondary,
    },
  });
