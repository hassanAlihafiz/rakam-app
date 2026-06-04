import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/src/constants/theme';

const splashIcon = require('@/assets/images/favicon.png');

export function AppSplash() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Image
          source={splashIcon}
          style={styles.icon}
          resizeMode="contain"
          accessibilityLabel="Rakam"
        />
      </View>
      <Text style={styles.title}>Rakam</Text>
      <ActivityIndicator size="small" color={colors.accent} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 16,
  },
  iconWrap: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#E8F4FC',
  },
  icon: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: typography.h1.size,
    fontWeight: typography.h1.weight,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: 8,
  },
});
