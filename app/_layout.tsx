import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AppSplash } from '@/src/components/AppSplash';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { bootstrapToken } from '@/src/lib/api';
import { hasValidSession } from '@/src/lib/auth';
import '@/src/lib/i18n';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const ONBOARDING_KEY = 'onboarding_completed';
const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [appReady, setAppReady] = useState(false);
  const didNavigate = useRef(false);

  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (!loaded || didNavigate.current) return;

    void (async () => {
      try {
        await bootstrapToken();
        const onboardingCompleted = await SecureStore.getItemAsync(ONBOARDING_KEY);
        const session = await hasValidSession();
        didNavigate.current = true;

        if (!onboardingCompleted && !session) {
          routerRef.current.replace('/onboarding');
        } else {
          if (!onboardingCompleted && session) {
            await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
          }
          routerRef.current.replace(session ? '/(tabs)' : '/auth/signin');
        }
      } finally {
        setAppReady(true);
      }
    })();
  }, [loaded]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={styles.root}>
          <OfflineBanner />
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="number" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="pricing" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
          {!appReady && (
            <View style={styles.splashOverlay}>
              <AppSplash />
            </View>
          )}
        </View>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
