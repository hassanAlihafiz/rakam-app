import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';

import { SubscriptionGate } from '@/src/components/SubscriptionGate';
import { colors } from '@/src/constants/theme';

export default function TabLayout() {
  return (
    <>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    <SubscriptionGate />
    </>
  );
}
