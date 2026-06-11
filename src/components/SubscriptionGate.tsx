import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { TrialExpiredModal } from '@/src/components/TrialExpiredModal';
import { AuthService, type MeResponse } from '@/src/lib/apiClient';
import { runAuthQuery } from '@/src/lib/authQuery';

export function SubscriptionGate() {
  const queryClient = useQueryClient();

  const meQuery = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => runAuthQuery(() => AuthService.getApiAuthMe()) as Promise<MeResponse>,
    staleTime: 30_000,
  });

  useFocusEffect(
    useCallback(() => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    }, [queryClient]),
  );

  const subscription = meQuery.data?.subscription;
  const showExpiredModal =
    meQuery.isSuccess && subscription?.trial_expired === true;

  return <TrialExpiredModal visible={showExpiredModal} />;
}
