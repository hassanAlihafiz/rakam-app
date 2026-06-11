import { Stack } from 'expo-router';

import { SubscriptionGate } from '@/src/components/SubscriptionGate';

export default function ProfileLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <SubscriptionGate />
    </>
  );
}
