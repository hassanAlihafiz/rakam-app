import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { colors, spacing, typography } from '@/src/constants/theme';
import { isRTL, useTranslation } from '@/src/lib/i18n';

export function OfflineBanner() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const [isOffline, setIsOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable !== false);
      if (offline) {
        setIsOffline(true);
        setVisible(true);
      } else {
        setIsOffline(false);
        setTimeout(() => setVisible(false), reduced ? 0 : 300);
      }
    });

    return unsubscribe;
  }, [reduced]);

  if (!visible && !isOffline) {
    return null;
  }

  return (
    <MotiView
      from={{ translateY: -40 }}
      animate={{ translateY: isOffline ? 0 : -40 }}
      transition={{
        type: 'timing',
        duration: reduced ? 0 : 300,
      }}
      style={styles.banner}>
      <View style={styles.row}>
        <WifiOff size={16} color="#1a1a1a" />
        <Text style={styles.text}>{t('common.offline')}</Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  row: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.caption.size,
    fontWeight: typography.caption.weight,
    color: '#1a1a1a',
    textAlign: isRTL ? 'right' : 'left',
  },
});
